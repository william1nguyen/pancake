import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Ajv } from "ajv";
import addFormats from "ajv-formats";
import Fastify from "fastify";

const ajv = new Ajv({ coerceTypes: true });
addFormats(ajv);

const app = Fastify({
  logger: true,
})
  .withTypeProvider<TypeBoxTypeProvider>()
  .setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
  });

export { app };
