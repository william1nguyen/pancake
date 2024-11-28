import { Client, GatewayIntentBits } from "discord.js";
import { pingCommand } from "~/applications/commands/pingCommand";
import { env } from "~/infrastructure/shared/env";
import logger from "../shared/logger";
import {
  commandExecuteFunction,
  loadCommands,
  registerCommands,
} from "./commandHandler";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  logger.info("Discord bot is ready!");

  try {
    await Promise.all([registerCommands(pingCommand), loadCommands()]);

    logger.info("All commands registered successfully");
  } catch (error) {
    logger.error("Error registering commands:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;
  const executeFunction = commandExecuteFunction[commandName];

  if (!executeFunction) {
    throw new Error("Command not found");
  }

  await executeFunction(interaction);
});

client.on("debug", console.log);
