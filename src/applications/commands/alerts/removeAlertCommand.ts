import axios from "axios";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { tvAccountTable } from "~/drizzle/schema";
import { createResponse } from "~/infrastructure/discord/messageHandler";
import { env } from "~/infrastructure/shared/env";
import logger from "~/infrastructure/shared/logger";

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

  const dscUserId = await interaction.user.id;
  const tvAccount = await db.query.tvAccountTable.findFirst({
    where: eq(tvAccountTable.dscUserId, dscUserId),
  });

  if (!tvAccount || !tvAccount.cookies) {
    const response = "You need to login first!";
    const botResponse = createResponse(response);
    await interaction.editReply(botResponse);
    return;
  }

  const tvCookies = tvAccount.cookies;
  const alertId = interaction.options.getNumber("alert_id");

  try {
    const url = `${env.HANDLER_API_URL}/alert/remove`;
    const headers = {
      tv_cookies: tvCookies,
      "Content-Type": "application/json",
    };
    const data = {
      alertId,
    };
    const res = await axios.delete(url, { headers, data });
    const message = res.data.message;
    const botResponse = createResponse(message);
    await interaction.editReply(botResponse);
  } catch (err) {
    logger.info(err);
    await interaction.editReply(createResponse("Something wrong!"));
  }
};

export const removeAlertCommand = {
  command,
  execute,
};
