import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

const command = new SlashCommandBuilder()
  .setName("getAlert")
  .setDescription("Get alert information from Trading View");

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();
};

export const getAlertCommand = {
  command,
  execute,
};
