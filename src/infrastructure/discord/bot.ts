import {
  type CacheType,
  type ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  type ModalSubmitInteraction,
} from "discord.js";
import {
  loginCommand,
  loginCommandSubmitHandler,
} from "~/applications/commands/alerts/loginCommand";
import { pingCommand } from "~/applications/commands/pingCommand";
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

const handleModalSubmit = async (interaction: ModalSubmitInteraction) => {
  if (interaction.customId === "login_modal") {
    await loginCommandSubmitHandler(interaction);
  }
};

const handleChatInputCommand = async (
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  const commandName = interaction.commandName;
  const executeFunction = commandExecuteFunction[commandName];

  if (!executeFunction) {
    throw new Error("Command not found");
  }

  await executeFunction(interaction);
};

client.once("ready", async () => {
  logger.info("Discord bot is ready!");

  try {
    await Promise.all([
      registerCommands(pingCommand),
      registerCommands(loginCommand),
      loadCommands(),
    ]);

    logger.info("All commands registered successfully");
  } catch (error) {
    logger.error("Error registering commands:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isModalSubmit()) {
    await handleModalSubmit(interaction);
  }

  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  }
});

client.on("debug", console.log);
