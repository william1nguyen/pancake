import { env } from "~/infra/utils/env";
import axios from "axios";
import path from "node:path";
import type { Alert, ListAlertQuerystring } from "~/domain/alert/alert.types";
import { UnauthorizedError } from "~/domain/user/user.errors";
import logger from "~/infra/utils/logger";
import { decodeAndStringifyToken } from "~/domain/user/user.services";
import { db } from "~/drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "~/drizzle/schema";
import { P } from "pino";

export class ListWorkflow {
  private apiRoot;
  private retryLimit;

  constructor(retryLimit = 5) {
    this.apiRoot = env.TRADINGVIEW_PRICEALERT_API_ROOT;
    this.retryLimit = retryLimit;
  }

  execute = async ({ alertId }: ListAlertQuerystring, token: string) => {
    if (!token) {
      throw new UnauthorizedError();
    }

    for (let i = 0; i < this.retryLimit; ++i) {
      try {
        const url = path.join(this.apiRoot, "list_alerts");
        const headers = {
          accept: "application/json",
          cookies: await decodeAndStringifyToken(token),
          Referer: env.TRADINGVIEW_URL,
        };

        const response = await axios.get(url, { headers });
        const alerts = response.data.r as Alert[];

        if (!alertId) {
          return { alerts };
        }

        return {
          alerts: alerts.filter((alert) => alert.alert_id === alertId),
        };
      } catch (err) {
        logger.error(`Failed to list alert : ${err}`);
      }
    }
  };
}
