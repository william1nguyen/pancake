import { type Job, Queue, Worker } from "bullmq";
import { COMMAND_QUEUE } from "./consts";
import { redisForBullMq } from "../redis";
import logger from "../utils/logger";
import axios from "axios";
import { sendChannelMessage } from "~/core/utils/message";
import { createResponse } from "../discord/message";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import { env } from "../utils/env";
import { eq } from "drizzle-orm";
import { client } from "../discord";
import type { TextChannel } from "discord.js";
import { v4 as uuidv4 } from "uuid";
import { BotResponse } from "../utils/botResponse";

interface ICommand {
  channelId: string;
  userId: string;
  url: string;
  headers: Record<string, string>;
  data: Record<string, unknown>;
}

export const commandQueue = new Queue<ICommand>(COMMAND_QUEUE, {
  connection: redisForBullMq,
  defaultJobOptions: {
    attempts: 5,
    removeOnComplete: 1000,
    removeOnFail: 1000,
  },
});

const handleCreateAlertRequest = async (job: Job) => {
  const { channelId, userId, url, headers, data } = job.data;

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  if (!user) {
    const botResponse = createResponse(BotResponse.UserNotFound);
    await sendChannelMessage(channelId, botResponse);
    return;
  }

  try {
    const res = await axios.post(url, data, { headers });
    if (res.status === 200) {
      await sendChannelMessage(
        channelId,
        createResponse(BotResponse.CreateAlertSuccessfully),
      );
    } else {
      await sendChannelMessage(
        channelId,
        createResponse(BotResponse.CreateAlertFailed),
      );
    }
  } catch (err) {
    logger.info(err);

    await sendChannelMessage(
      channelId,
      createResponse(BotResponse.CreateAlertFailed),
    );
  }
};

export const createCommandWorker = (): Worker => {
  const commandWorker = new Worker(
    COMMAND_QUEUE,
    async (job) => {
      switch (job.name) {
        case "create_alert":
          await handleCreateAlertRequest(job);
          break;
      }
    },
    {
      connection: redisForBullMq,
      concurrency: env.REDIS_MAX_CONCURRENCY,
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
