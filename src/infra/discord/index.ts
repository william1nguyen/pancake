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
} from "~/core/commands/user/loginCommand";
import { pingCommand } from "~/core/commands/pingCommand";
import logger from "../utils/logger";
import {
  commandExecuteFunction,
  loadCommands,
  registerCommands,
} from "./commandHandler";
import { listAlertCommand } from "~/core/commands/alerts/listAlertCommand";
import { getAlertCommand } from "~/core/commands/alerts/getAlertCommand";
import { removeAlertCommand } from "~/core/commands/alerts/removeAlertCommand";
import { orbrCreateAlertCommand } from "~/core/commands/orbr/createAlertCommand";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

export const handleModalSubmit = async (
  interaction: ModalSubmitInteraction,
) => {
  if (interaction.customId === "login_modal") {
    await loginCommandSubmitHandler(interaction);
  }
};

export const handleChatInputCommand = async (
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
      registerCommands(listAlertCommand),
      registerCommands(getAlertCommand),
      registerCommands(removeAlertCommand),
      registerCommands(orbrCreateAlertCommand),
      loadCommands(),
    ]);

    logger.info("All commands registered successfully");
  } catch (err) {
    logger.error("Error registering commands:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleChatInputCommand(interaction);
    }

    if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    }
  } catch (err) {
    logger.error(`Error handling interaction: ${err}`);

    if (interaction.isRepliable()) {
      await interaction.reply({
        content: "An error occurred while processing your request.",
        ephemeral: true,
      });
    }
  }
});

client.on("debug", console.log);
