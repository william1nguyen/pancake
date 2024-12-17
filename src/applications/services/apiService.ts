import type { EmbedBuilder, TextChannel } from "discord.js";
import { client } from "~/infrastructure/discord/bot";
import logger from "~/infrastructure/shared/logger";

export const sendChannelMessage = async (
  channelId: string,
  message: string | { embeds: EmbedBuilder[] },
) => {
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await (channel as TextChannel).send(message);
    }
  } catch (err) {
    logger.error(`Failed to send message to channel: ${err}`);
  }
};
