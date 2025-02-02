import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { alertRoutes } from "./alert.routes";

export const alertModule: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(alertRoutes, { prefix: "/alert" });
};
