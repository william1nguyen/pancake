import { type Job, Queue, Worker } from "bullmq";
import { COMMAND_QUEUE } from "./consts";
import { redisForBullMq } from "../redis";
import logger from "../shared/logger";
import axios from "axios";
import { sendChannelMessage } from "~/applications/services/apiService";
import { createResponse } from "../discord/messageHandler";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import { env } from "../shared/env";
import { eq } from "drizzle-orm";
import { client } from "../discord/bot";
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

const handleLoginRequest = async (job: Job) => {
  const { channelId, userId, url, headers, data } = job.data as ICommand;
  let cookies = null;
  let webhookUrl = null;

  try {
    const res = await axios.post(url, data, { headers });
    cookies = res.data.cookies;

    if (!cookies) {
      await sendChannelMessage(channelId, BotResponse.LoginFailed);
      return;
    }
  } catch (err) {
    logger.error(err);
    await sendChannelMessage(channelId, BotResponse.LoginFailed);
    return;
  }

  try {
    const channel = (await client.channels.fetch(channelId)) as TextChannel;
    const webhooks = await channel.fetchWebhooks();

    if (!webhooks.size) {
      const webhook = await channel.createWebhook({
        name: `webhook-${uuidv4()}`,
        avatar:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExqxRATJj7WIJbB3FmdJAA-GykdJjWnivkw&s",
      });

      webhookUrl = webhook.url;

      logger.info(`New webhook created: ${webhook.url}`);
    } else {
      const webhook = await webhooks.first();
      webhookUrl = webhook?.url;
    }

    if (!webhookUrl) {
      await sendChannelMessage(channelId, BotResponse.LoginFailed);
      return;
    }
  } catch (err) {
    logger.error(`Failed to connect to channel webhook ${err}`);
    await sendChannelMessage(channelId, BotResponse.LoginFailed);
    return;
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(userTable)
        .values({
          id: userId,
          channelId,
          cookies,
          webhookUrl,
        })
        .onConflictDoUpdate({
          target: [userTable.id],
          set: {
            channelId,
            cookies,
            webhookUrl,
          },
        });
    });
  } catch (err) {
    logger.error(`Transaction failed: ${err}`);
    await sendChannelMessage(channelId, BotResponse.LoginFailed);
    return;
  }

  await sendChannelMessage(channelId, BotResponse.LoginSuccessfully);
};

const handleCreateAlertRequest = async (job: Job) => {
  const { channelId, userId, url, headers, data } = job.data;

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  console.log(userId);
  console.log(user);

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
        case "login":
          await handleLoginRequest(job);
          break;

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
