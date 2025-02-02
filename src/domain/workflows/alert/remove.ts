import { env } from "~/infra/utils/env";
import path from "node:path";
import type { RemoveAlertBody } from "~/domain/alert/alert.types";
import axios from "axios";
import { UnauthorizedError } from "~/domain/user/user.errors";
import logger from "~/infra/utils/logger";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import { eq } from "drizzle-orm";
import { decodeAndStringifyToken } from "~/domain/user/user.services";

export class RemoveWorkflow {
  private apiRoot;
  private retryLimit;

  constructor(retryLimit = 5) {
    this.apiRoot = env.TRADINGVIEW_PRICEALERT_API_ROOT;
    this.retryLimit = retryLimit;
  }

  execute = async ({ alertId }: RemoveAlertBody, token: string) => {
    if (!token) {
      throw new UnauthorizedError();
    }

    for (let i = 0; i < this.retryLimit; ++i) {
      try {
        const url = path.join(this.apiRoot, "delete_alerts");
        const headers = {
          accept: "application/json",
          cookie: await decodeAndStringifyToken(token),
          Referer: env.TRADINGVIEW_URL,
        };

        const data = { payload: { alert_ids: [alertId] } };

        const response = await axios.post(url, data, { headers });
        const message = response.data.s;

        return { message };
      } catch (err) {
        logger.error(`Failed to remove alert : ${err}`);
      }
    }
  };
}
