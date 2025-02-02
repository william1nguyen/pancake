import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { bullBoardPlugin } from "./bullBoard";
import { LIST_QUEUES } from "./jobs";
import { env } from "./utils/env";
import { alertModule } from "~/domain/alert/alert.module";
import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";

const ajv = new Ajv({ coerceTypes: true });
addFormats(ajv);

const app = Fastify({
  logger: true,
})
  .withTypeProvider<TypeBoxTypeProvider>()
  .setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
  });

app.register(fastifyCors, { origin: "*" });
app.register(bullBoardPlugin, { queues: LIST_QUEUES, path: "/bullboard" });

app.register(fastifyCookie, {
  secret: "cookiesecret",
  parseOptions: {},
});

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.setErrorHandler((error, request, reply) => {
  if (reply.statusCode === 429) {
    error.message = "You hit the rate limit! Slow down please!";
  }
  reply.send(error);
});

if (env.NODE_ENV !== "production") {
  app.register(swagger, {
    openapi: {
      info: {
        title: "TNE 5.0",
        version: "0.0.1",
      },
    },
  });

  app.register(scalar, { routePrefix: "/api-reference" });
}

app.register(alertModule);

export { app };
