import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const command = new SlashCommandBuilder()
  .setName("removeAlerts")
  .setDescription("Remove alerts from Trading View")
  .addNumberOption((option) =>
    option
      .setName("alertIds")
      .setDescription("List removing alerts on Trading View")
      .setRequired(true),
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();
};

export const removeAlertsCommand = {
  command,
  execute,
};
