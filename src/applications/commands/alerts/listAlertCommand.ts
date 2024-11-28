import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const command = new SlashCommandBuilder()
  .setName("listAlerts")
  .setDescription("List alerts from Trading View");

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();
};

export const listAlertsCommand = {
  command,
  execute,
};
