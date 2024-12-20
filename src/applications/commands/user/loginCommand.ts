import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ModalBuilder,
  type ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { createResponse } from "~/infrastructure/discord/messageHandler";
import { commandQueue } from "~/infrastructure/jobs/command";
import { env } from "~/infrastructure/shared/env";
import { BotResponse } from "~/infrastructure/utils/botResponse";

const command = new SlashCommandBuilder()
  .setName("login")
  .setDescription("Login into Trading View");

const execute = async (interaction: ChatInputCommandInteraction) => {
  const login_modal = new ModalBuilder()
    .setCustomId("login_modal")
    .setTitle("Login");

  const username = new TextInputBuilder()
    .setCustomId("username")
    .setLabel("Username")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter your email/username")
    .setRequired(true);

  const password = new TextInputBuilder()
    .setCustomId("password")
    .setLabel("Password")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter your password")
    .setRequired(true);

  const backupCode = new TextInputBuilder()
    .setCustomId("backupCode")
    .setLabel("Backup Code / Authentication Code")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter your backup code")
    .setRequired(true);

  const usernameActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(username);
  const passwordActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(password);
  const backupCodeActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(backupCode);

  login_modal.addComponents(
    usernameActionRow,
    passwordActionRow,
    backupCodeActionRow,
  );

  await interaction.showModal(login_modal);
};

export const loginCommand = {
  command,
  execute,
};

export const loginCommandSubmitHandler = async (
  interaction: ModalSubmitInteraction,
) => {
  await interaction.reply(createResponse("Acknowledge"));
  const { customId } = interaction;

  if (customId === "login_modal") {
    const username = interaction.fields.getTextInputValue("username");
    const password = interaction.fields.getTextInputValue("password");
    const backupCode = interaction.fields.getTextInputValue("backupCode");

    try {
      const url = `${env.HANDLER_API_URL}/user/login`;
      const data = {
        username,
        password,
        backupCode,
      };
      const headers = {
        "Content-Type": "application/json",
      };

      const userId = interaction.user.id;
      const channelId = interaction.channelId;
      if (!channelId) return;

      await commandQueue.add("login", {
        channelId,
        userId,
        url,
        headers,
        data,
      });
    } catch (err) {
      await interaction.reply(createResponse(BotResponse.LoginFailed));
    }
  }
};
