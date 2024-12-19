import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import { db } from "~/drizzle/db";
import { tvAccountTable } from "~/drizzle/schema";
import { createResponse } from "~/infrastructure/discord/messageHandler";
import { commandQueue } from "~/infrastructure/jobs/command";
import { env } from "~/infrastructure/shared/env";

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
  await interaction.reply(createResponse("Acknowledge"));

  const dscUserId = await interaction.user.id;
  const tvAccount = await db.query.tvAccountTable.findFirst({
    where: eq(tvAccountTable.dscUserId, dscUserId),
  });
  const tvCookies = tvAccount?.cookies;

  if (!tvAccount || !tvCookies) {
    const response = "You need to login first!";
    const botResponse = createResponse(response);
    await interaction.editReply(botResponse);
    return;
  }

  const symbol = interaction.options.getString("symbol") ?? undefined;
  const interval = interaction.options.getString("interval") ?? undefined;
  const type = interaction.options.getString("type") ?? undefined;
  const duration = interaction.options.getString("duration") ?? undefined;
  const trigger = interaction.options.getString("trigger") ?? undefined;

  const url = `${env.HANDLER_API_URL}/alert/create/orbr`;
  const headers = {
    tv_cookies: tvCookies,
  };
  const data = {
    symbol,
    interval,
    type,
    duration,
    addtion: {
      trigger,
    },
  };

  await commandQueue.add("create_alert", {
    channelId: interaction.channelId,
    url,
    headers,
    data,
  });
};

export const orbrCreateAlertCommand = {
  command,
  execute,
};
