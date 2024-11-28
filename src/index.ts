import { app } from "./infrastructure/app";
import { client } from "./infrastructure/discord/bot";
import { env } from "./infrastructure/shared/env";
import logger from "./infrastructure/shared/logger";

const startApp = async () => {
  app.listen({ port: 8080 }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`Fastify server running at ${address}`);
  });
  await client.login(env.DISCORD_BOT_TOKEN);
  logger.info("Discord bot logged in");
};

startApp();
