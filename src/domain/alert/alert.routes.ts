import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  ListAlertQuerystring,
  ListAlertResponse,
  RemoveAlertResponse,
  CreateAlertBody,
  CreateAlertResponse,
  RemoveAlertBody,
  ScreenshotBody,
  ScreenshotResponse,
} from "./alert.types";
import { AuthorizationHeaders } from "~/infra/utils/types";
import { ListWorkflow } from "../workflows/alert/list";
import { RemoveWorkflow } from "../workflows/alert/remove";
import { CreateWorkflow } from "../workflows/alert/orbr/create";
import { ScreenshotWorkflow } from "../workflows/alert/screenshot";

const TAGS = ["Alert"];

export const alertRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    "/list",
    {
      schema: {
        tags: TAGS,
        description: "Get list alerts from Trading View",
        querystring: ListAlertQuerystring,
        headers: AuthorizationHeaders,
        response: {
          200: ListAlertResponse,
        },
      },
    },
    async (request) => {
      const workflow = new ListWorkflow();

      const response = await workflow.execute(
        request.query,
        request.headers.cookies,
      );
      return response;
    },
  );

  app.delete(
    "/remove",
    {
      schema: {
        tags: TAGS,
        description: "Remove alert from Trading View",
        body: RemoveAlertBody,
        headers: AuthorizationHeaders,
        response: {
          200: RemoveAlertResponse,
        },
      },
    },
    async (request) => {
      const workflow = new RemoveWorkflow();
      const response = await workflow.execute(
        request.body,
        request.headers.cookies,
      );
      return response;
    },
  );

  app.post(
    "/create/orbr",
    {
      schema: {
        tags: TAGS,
        description: "Create new alert",
        body: CreateAlertBody,
        headers: AuthorizationHeaders,
        response: {
          200: CreateAlertResponse,
        },
      },
    },
    async (request) => {
      const workflow = new CreateWorkflow();
      const response = await workflow.execute(
        request.body,
        request.headers.cookies,
      );
      return response;
    },
  );

  app.post(
    "/screenshot",
    {
      schema: {
        tags: TAGS,
        description: "Screen short chart",
        body: ScreenshotBody,
        headers: AuthorizationHeaders,
        response: {
          200: ScreenshotResponse,
        },
      },
    },
    async (request) => {
      const workflow = new ScreenshotWorkflow();
      const response = await workflow.execute(
        request.body,
        request.headers.cookies,
      );
      return response;
    },
  );
};
