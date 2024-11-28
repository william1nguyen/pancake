import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const command = new SlashCommandBuilder()
  .setName("addOrbrSellAlert")
  .setDescription("Add Sell alert from Orbr Trading Bot on Trading View")
  .addStringOption((option) =>
    option
      .setName("symbol")
      .setDescription("The trading symbol for the alert (e.g., BONK)")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("trigger")
      .setDescription("Trigger type (e.g., Once Per Bar)")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("duration")
      .setDescription("Alert duration")
      .setRequired(true),
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const symbol = interaction.options.getString("symbol");
  const trigger = interaction.options.getString("trigger");
  const duration = interaction.options.getString("duration");
};

export const addOrbrSellAlertCommand = {
  command,
  execute,
};
