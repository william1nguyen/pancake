import { Queue, Worker } from "bullmq";
import { COMMAND_QUEUE } from "./consts";
import { redisForBullMq } from "../redis";
import logger from "../shared/logger";
import axios from "axios";
import { sendChannelMessage } from "~/applications/services/apiService";
import { createResponse } from "../discord/messageHandler";
import { db } from "~/drizzle/db";
import { dscUserTable, tvAccountTable } from "~/drizzle/schema";
import { env } from "../shared/env";

interface ICommand {
  url: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  headers: any;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any;
  channelId: string;
  username?: string;
  userId?: string;
}

export const commandQueue = new Queue<ICommand>(COMMAND_QUEUE, {
  connection: redisForBullMq,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 1000,
    removeOnFail: 1000,
  },
});

export const createCommandWorker = (): Worker => {
  const commandWorker = new Worker(
    COMMAND_QUEUE,
    async (job) => {
      if (job.name === "login") {
        const { url, headers, data, channelId, username, userId } = job.data;
        try {
          const res = await axios.post(url, data, { headers });
          const message = res.data.message;
          const cookies = res.data.cookies;

          try {
            await db.transaction(async (tx) => {
              await tx
                .insert(dscUserTable)
                .values({
                  id: userId,
                  username: username,
                  channelId: channelId,
                })
                .onConflictDoNothing();

              await tx
                .insert(tvAccountTable)
                .values({
                  dscUserId: userId,
                  username,
                  password: data.password,
                  backupCode: data.backupCode,
                  cookies,
                })
                .onConflictDoUpdate({
                  target: [tvAccountTable.dscUserId],
                  set: {
                    username,
                    password: data.password,
                    backupCode: data.backupCode,
                    cookies,
                  },
                });
            });
          } catch (err) {
            logger.error(`Transaction failed: ${err}`);
          }

          const botResponse = createResponse(message);
          await sendChannelMessage(channelId, botResponse);
        } catch (err) {
          logger.error(`Login failed: ${err}`);
          const botResponse = createResponse("Failed to login");
          await sendChannelMessage(channelId, botResponse);
        }
      }

      if (job.name === "create_alert") {
        const { url, headers, data, channelId } = job.data;
        try {
          const res = await axios.post(url, data, { headers });
          const message = res.data.message;
          const botResponse = createResponse(message);
          await sendChannelMessage(channelId, botResponse);
        } catch (err) {
          logger.info(err);
          const botResponse = createResponse("Failed to create alert");
          await sendChannelMessage(channelId, botResponse);
        }
      }
    },
    {
      connection: redisForBullMq,
      concurrency: env.MAX_REDIS_CONCURRENCY,
    },
  );

  commandWorker.on("completed", (job) => {
    logger.info({ msg: "Job completed", jobId: job.id });
  });

  commandWorker.on("failed", (job, err) => {
    logger.error({ msg: "Job failed", jobId: job?.id, reason: err.message });
  });

  return commandWorker;
};
