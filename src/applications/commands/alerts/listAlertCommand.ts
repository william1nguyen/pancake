import axios from "axios";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import type { Alert } from "~/domain/alert/alert.types";
import { db } from "~/drizzle/db";
import { tvAccountTable } from "~/drizzle/schema";
import {
  createListResponse,
  createResponse,
} from "~/infrastructure/discord/messageHandler";
import { env } from "~/infrastructure/shared/env";

const command = new SlashCommandBuilder()
  .setName("list")
  .setDescription("List all alerts from Trading View");

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();
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

  try {
    const url = `${env.HANDLER_API_URL}/alert/list`;
    const headers = {
      tv_cookies: tvCookies,
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
    await interaction.editReply(createResponse("Something wrong!"));
  }
};

export const listAlertCommand = {
  command,
  execute,
};
