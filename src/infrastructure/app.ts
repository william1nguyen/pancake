import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { bullBoardPlugin } from "./bullBoard";
import { LIST_QUEUES } from "./jobs";

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

export { app };
