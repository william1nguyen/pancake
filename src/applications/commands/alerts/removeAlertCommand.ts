import axios from "axios";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import { createResponse } from "~/infrastructure/discord/messageHandler";
import { env } from "~/infrastructure/shared/env";
import logger from "~/infrastructure/shared/logger";
import { BotResponse } from "~/infrastructure/utils/botResponse";

const command = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Remove alert from Trading View")
  .addNumberOption((option) =>
    option
      .setName("alert_id")
      .setDescription("Remove alert by alert id")
      .setRequired(true),
  );

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

  const alertId = interaction.options.getNumber("alert_id");

  try {
    const url = `${env.HANDLER_API_URL}/alert/remove`;
    const headers = {
      "Content-Type": "application/json",
      tv_cookies: cookies,
    };

    const res = await axios.delete(url, { headers, data: { alertId } });

    if (res.status === 200) {
      await interaction.editReply(
        createResponse(BotResponse.RemoveAlertSuccessfully),
      );
    } else {
      await interaction.editReply(
        createResponse(BotResponse.RemoveAlertFailed),
      );
    }
  } catch (err) {
    logger.info(err);
    await interaction.editReply(createResponse(BotResponse.RemoveAlertFailed));
  }
};

export const removeAlertCommand = {
  command,
  execute,
};
