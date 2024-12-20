import axios from "axios";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import type { Alert } from "~/domain/alert/alert.types";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import {
  createListResponse,
  createResponse,
} from "~/infrastructure/discord/messageHandler";
import { env } from "~/infrastructure/shared/env";
import logger from "~/infrastructure/shared/logger";
import { BotResponse } from "~/infrastructure/utils/botResponse";

const command = new SlashCommandBuilder()
  .setName("list")
  .setDescription("List all alerts from Trading View");

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply({ ephemeral: true });

  const userId = await interaction.user.id;
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  if (!user) {
    const botResponse = createResponse(BotResponse.UserNotFound);
    interaction.editReply(botResponse);
    return;
  }

  const cookies = user.cookies;

  if (!cookies) {
    const botResponse = createResponse(BotResponse.UserNotFound);
    interaction.editReply(botResponse);
    return;
  }

  try {
    const url = `${env.HANDLER_API_URL}/alert/list`;
    const headers = {
      tv_cookies: cookies,
    };
    const res = await axios.get(url, { headers });
    const alerts = res.data.alerts as Alert[];

    const botResponse = createListResponse(
      alerts.map((alert) => {
        return {
          id: alert.alert_id,
          name: alert.name,
          exp: alert.expiration,
        };
      }),
    );

    await interaction.editReply(botResponse);
  } catch (err) {
    logger.error(err);
    await interaction.editReply(createResponse(BotResponse.ListAlertsFailed));
  }
};

export const listAlertCommand = {
  command,
  execute,
};
