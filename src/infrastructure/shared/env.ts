import { type Static, Type } from "@fastify/type-provider-typebox";
import { TypeCompiler } from "@sinclair/typebox/compiler";
import dotenv from "dotenv";

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
});

type Env = Static<typeof EnvSchema>;
const coerceInt = (x: string | null | undefined) => {
  if (!x) {
    return null;
  }
  return Number.parseInt(x, 10);
};

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
  };

  if (!validator.Check(env)) {
    const errors = [...validator.Errors(env)];
    throw new Error("Invalid env vars");
  }

  return env;
};

export const env = validateEnv();
