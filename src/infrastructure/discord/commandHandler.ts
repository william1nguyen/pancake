import {
  REST,
  Routes,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";

import { env } from "../shared/env";
import logger from "../shared/logger";

import type {
  CommandExecuteFunctionMap,
  CommandModuleType,
} from "../shared/types";

const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);

export const commandExecuteFunction: CommandExecuteFunctionMap = {};
const commands: (SlashCommandBuilder | SlashCommandOptionsOnlyBuilder)[] = [];

export const registerCommands = async (module: CommandModuleType) => {
  if (!module) {
    throw new Error("No module registered!");
  }

  commandExecuteFunction[module.command.name] = module.execute;
  commands.push(module.command);

  logger.info(`Register Command For ${module.command.name}`);
};

export const loadCommands = async () => {
  if (!commands) {
    throw new Error("No command loaded!");
  }

  try {
    await rest.put(Routes.applicationCommands(env.DISCORD_BOT_CLIENT_ID), {
      body: [],
    });
    logger.info("Cleared all existing commands");

    await rest.put(Routes.applicationCommands(env.DISCORD_BOT_CLIENT_ID), {
      body: commands.map((command) => command.toJSON()),
    });

    logger.info("Successfully load all commands");
  } catch (err) {
    logger.info(`Failed to load command ${err}`);
  }
};
