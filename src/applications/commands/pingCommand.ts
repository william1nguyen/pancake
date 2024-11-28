import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { createResponse } from "~/infrastructure/discord/messageHandler";

const command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Ping bot server");

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const responseData = "Pong";
  const response = createResponse(responseData);

  await interaction.editReply(response);
};

export const pingCommand = {
  command,
  execute,
};
