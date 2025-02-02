import { app } from "./infra/app";
import { client } from "./infra/discord";
import { setupBackgroundJobs } from "./infra/jobs";
import { env } from "./infra/utils/env";
import logger from "./infra/utils/logger";

const startApp = async () => {
  app.listen({ port: 8000 }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`Fastify server running at ${address}`);
  });
  await client.login(env.DISCORD_BOT_TOKEN);
  logger.info("Discord bot logged in");
  await setupBackgroundJobs();
};

startApp();
