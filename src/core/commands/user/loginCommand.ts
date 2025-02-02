import {
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  ModalBuilder,
  type ModalSubmitInteraction,
  SlashCommandBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { decodeJWTToken } from "~/domain/user/user.services";
import { BotResponse } from "~/infra/utils/botResponse";
import logger from "~/infra/utils/logger";
import { v4 as uuidv4 } from "uuid";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";

interface IWebhook {
  name: string;
  url: string;
}

const command = new SlashCommandBuilder()
  .setName("login")
  .setDescription("Login into Trading View");

const execute = async (interaction: ChatInputCommandInteraction) => {
  const login_modal = new ModalBuilder()
    .setCustomId("login_modal")
    .setTitle("Login");

  const token = new TextInputBuilder()
    .setCustomId("token")
    .setLabel("token")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter your token")
    .setRequired(true);

  const jwtSecret = new TextInputBuilder()
    .setCustomId("jwtSecret")
    .setLabel("jwtSecret")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter your jwtSecret")
    .setRequired(true);

  const tokenActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    token,
  );

  const jwtSecretActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(jwtSecret);

  login_modal.addComponents(tokenActionRow);
  login_modal.addComponents(jwtSecretActionRow);

  await interaction.showModal(login_modal);
};

export const loginCommand = {
  command,
  execute,
};

export const loginCommandSubmitHandler = async (
  interaction: ModalSubmitInteraction,
) => {
  await interaction.deferReply();
  const { customId } = interaction;

  if (customId === "login_modal") {
    const token = interaction.fields.getTextInputValue("token");
    const jwtSecret = interaction.fields.getTextInputValue("jwtSecret");
    try {
      const cookies = await decodeJWTToken(token, jwtSecret);
      const userId = interaction.user.id as string;
      const client = interaction.client;
      const channelId = interaction.channelId as string;
      let webhook: IWebhook;

      if (!cookies) {
        await interaction.editReply(BotResponse.CookiesMissed);
        return;
      }

      try {
        const channel = (await client.channels.fetch(channelId)) as TextChannel;
        const webhooks = await channel.fetchWebhooks();

        if (!webhooks.size) {
          const wh = await channel.createWebhook({
            name: `webhook-${uuidv4()}`,
            avatar:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExqxRATJj7WIJbB3FmdJAA-GykdJjWnivkw&s",
          });

          webhook = {
            name: wh.name,
            url: wh.url,
          };

          logger.info(`New webhook created: ${webhook.url}`);
        } else {
          const wh = (await webhooks.first()) as IWebhook;
          webhook = {
            name: wh.name,
            url: wh.url,
          };
        }

        if (!webhook || !webhook.url) {
          await interaction.editReply(BotResponse.WebhookMissed);
          return;
        }
      } catch (err) {
        logger.error(`Failed to connect to channel webhook ${err}`);
        await interaction.editReply(BotResponse.CreateNewWebhookFailed);
        return;
      }

      try {
        await db.transaction(async (tx) => {
          await tx
            .insert(userTable)
            .values({
              id: userId,
              channelId,
              cookies: token,
              jwtSecret,
              webhook,
            })
            .onConflictDoUpdate({
              target: [userTable.id],
              set: {
                channelId,
                cookies: token,
                jwtSecret,
                webhook,
              },
            });
        });
      } catch (err) {
        logger.error(`Transaction failed: ${err}`);
        await interaction.editReply(BotResponse.StoreUserCookiesFailed);
        return;
      }

      await interaction.editReply(BotResponse.LoginSuccessfully);
    } catch (err) {
      logger.error(err);
      await interaction.editReply(BotResponse.LoginFailed);
    }
  }
};
