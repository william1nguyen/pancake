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
      .setDescription("The trading symbol for the alert (e.g., AAPL)")
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
      .setName("expDate")
      .setDescription("Expiration date in YYYY-MM-DD format")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("expTime")
      .setDescription("Expiration time in HH:mm format (24-hour clock)")
      .setRequired(false),
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const symbol = interaction.options.getString("symbol");
  const trigger = interaction.options.getString("trigger");
  const exp = {
    date: interaction.options.getString("expDate"),
    time: interaction.options.getString("expTime"),
  };

  const alert = {
    symbol,
    condition: {},
    trigger: trigger,
    expiration: exp,
  };
};

export const addOrbrSellAlertCommand = {
  command,
  execute,
};
