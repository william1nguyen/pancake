import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import { createResponse } from "~/infrastructure/discord/messageHandler";
import { commandQueue } from "~/infrastructure/jobs/command";
import { env } from "~/infrastructure/shared/env";
import { BotResponse } from "~/infrastructure/utils/botResponse";

const intervalChoices = [
  { name: "15m", value: "15 minutes" },
  { name: "30m", value: "30 minutes" },
  { name: "1h", value: "1 hour" },
  { name: "4h", value: "4 hours" },
  { name: "1d", value: "1 day" },
  { name: "1w", value: "1 week" },
  { name: "1y", value: "1 year" },
];

const typeChoices = [
  { name: "buy", value: "Buy" },
  { name: "sell", value: "Sell" },
];

const durationChoices = [
  { name: "1d", value: "1d" },
  { name: "1w", value: "1w" },
  { name: "1M", value: "1M" },
];

const triggerChoices = [
  { name: "Only Once", value: "Only Once" },
  { name: "Once Per Bar", value: "Once Per Bar" },
  { name: "Once Per Bar Close", value: "Once Per Bar Close" },
  { name: "Once Per Minute", value: "Once Per Minute" },
];

const optional = (value: string | null) => {
  if (!value) return undefined;
  return value;
};

const command = new SlashCommandBuilder()
  .setName("orbr_alert")
  .setDescription("Create Trading View alert for Orbr.cc")
  .addStringOption((option) =>
    option
      .setName("symbol")
      .setDescription(
        "Alert Symbol based on Trading View symbol, e.g: BTCUSDT, ETHUSDT,..",
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Orbr type command, e.g: buy, sell")
      .addChoices(typeChoices)
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("interval")
      .setDescription("Trading view interval screen, e.g: 15m, 30m, 1h, ...")
      .addChoices(intervalChoices),
  )
  .addStringOption((option) =>
    option
      .setName("duration")
      .setDescription("Alert duration, e.g: 1d, 1w, 1M")
      .addChoices(durationChoices),
  )
  .addStringOption((option) =>
    option
      .setName("trigger")
      .setDescription("Alert trigger, e.g: Only Once, Once Per Bar Close, ...")
      .addChoices(triggerChoices),
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const userId = await interaction.user.id;
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
  });

  if (!user) {
    const botResponse = createResponse(BotResponse.UserNotFound);
    interaction.reply(botResponse);
    return;
  }

  const cookies = user.cookies;

  if (!cookies) {
    const botResponse = createResponse(BotResponse.UserNotFound);
    interaction.reply(botResponse);
    return;
  }

  const symbol = optional(interaction.options.getString("symbol"));
  const interval = optional(interaction.options.getString("interval"));
  const type = optional(interaction.options.getString("type"));
  const duration = optional(interaction.options.getString("duration"));
  const trigger = optional(interaction.options.getString("trigger"));

  const url = `${env.HANDLER_API_URL}/alert/create/orbr`;
  const headers = {
    tv_cookies: cookies,
  };
  const data = {
    symbol,
    interval,
    type,
    webhookUrl: user.webhookUrl,
    duration,
    addtion: {
      trigger,
    },
  };

  await interaction.reply(createResponse("Acknowledge"));

  const channelId = interaction.channelId;
  if (!channelId) return;

  await commandQueue.add("create_alert", {
    channelId,
    userId,
    url,
    headers,
    data,
  });
};

export const orbrCreateAlertCommand = {
  command,
  execute,
};
