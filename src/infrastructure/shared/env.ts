import { type Static, Type } from "@fastify/type-provider-typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import dotenv from "dotenv";
import { createError } from "./errors";

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("production"),
  ]),

  LOG_LEVEL: Type.Union([
    Type.Literal("debug"),
    Type.Literal("info"),
    Type.Literal("error"),
    Type.Literal("silent"),
  ]),

  DISCORD_BOT_TOKEN: Type.String(),
  DISCORD_BOT_CLIENT_ID: Type.String(),
  DISCORD_BOT_GUILD_ID: Type.String(),

  DATABASE_URL: Type.String(),
  DATABASE_MAX_CONNECTIONS: Type.Number(),
  DATABASE_IDLE_TIMEOUT_MS: Type.Number(),

  HANDLER_API_URL: Type.String(),
  JWT_SECRET: Type.String(),
  REDIS_URL: Type.String(),

  BULL_BOARD_USERNAME: Type.String(),
  BULL_BOARD_PASSWORD: Type.String(),
  BULL_REDIS_DB: Type.Number(),
});

type Env = Static<typeof EnvSchema>;
const coerceInt = (x: string | null | undefined) => {
  if (!x) {
    return null;
  }
  return Number.parseInt(x, 10);
};

const InvalidEnvError = createError("INVALID_ENV", "Invalid env vars: %s");

const validateEnv = (): Env => {
  console.info("Validating environment variables.");
  dotenv.config();

  const validator = TypeCompiler.Compile(EnvSchema);

  const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    LOG_LEVEL: process.env.LOG_LEVEL,

    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_BOT_CLIENT_ID: process.env.DISCORD_BOT_CLIENT_ID,
    DISCORD_BOT_GUILD_ID: process.env.DISCORD_BOT_GUILD_ID,

    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_MAX_CONNECTIONS: coerceInt(process.env.DATABASE_MAX_CONNECTIONS),
    DATABASE_IDLE_TIMEOUT_MS: coerceInt(process.env.DATABASE_IDLE_TIMEOUT_MS),

    HANDLER_API_URL: process.env.HANDLER_API_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,

    BULL_BOARD_USERNAME: process.env.BULL_BOARD_USERNAME,
    BULL_BOARD_PASSWORD: process.env.BULL_BOARD_PASSWORD,
    BULL_REDIS_DB: coerceInt(process.env.BULL_REDIS_DB),
  };

  if (!validator.Check(env)) {
    const errors = [...validator.Errors(env)];
    throw new InvalidEnvError(JSON.stringify(errors, null, 2));
  }

  return env;
};

export const env = validateEnv();
