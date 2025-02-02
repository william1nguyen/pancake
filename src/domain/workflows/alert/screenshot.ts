import {
  clickElement,
  findAndClickTargetOption,
  waitForTimeout,
} from "~/infra/puppeteer/pageActions";
import { env } from "~/infra/utils/env";
import logger from "~/infra/utils/logger";
import { CookiesInvalidError } from "~/domain/user/user.errors";
import { UnauthorizedError } from "~/domain/user/user.errors";
import { decodeJWTToken } from "~/domain/user/user.services";
import path from "node:path";
import type { ScreenshotBody } from "~/domain/alert/alert.types";
import { PuppeteerService } from "~/infra/puppeteer";

const selectors = {
  interval: {
    openOptionButton: "#header-toolbar-intervals > button > div",
    option: "div.menuWrap-Kq3ruQo8 > div > div > div > div > div",
  },
};

export class ScreenshotWorkflow {
  private baseUrl;
  private ps;
  private retryLimit;

  constructor(retryLimit = 5) {
    this.baseUrl = env.TRADINGVIEW_URL;
    this.ps = new PuppeteerService();
    this.retryLimit = retryLimit;
  }

  openTradingViewChart = async (symbol: string, token?: string) => {
    await this.ps.openPage(path.join(this.baseUrl, `/chart/?symbol=${symbol}`));

    if (token) {
      try {
        const cookies = await decodeJWTToken(token);
        await this.ps.loadCookie(cookies);
      } catch (error) {
        throw new CookiesInvalidError();
      }
    }
  };

  setInterval = async (interval: string) => {
    const page = this.ps.validatePage();

    await clickElement(page, selectors.interval.openOptionButton);
    await findAndClickTargetOption(page, selectors.interval.option, interval);
  };

  screenshot = async () => {
    const page = this.ps.validatePage();

    const screenshot = await page.screenshot({
      optimizeForSpeed: true,
      type: "jpeg",
      encoding: "base64",
    });

    return screenshot;
  };

  execute = async (
    { symbol, interval = "4 hours" }: ScreenshotBody,
    cookies: string,
  ) => {
    if (!cookies) {
      throw new UnauthorizedError();
    }

    for (let i = 0; i < this.retryLimit; ++i) {
      try {
        await this.openTradingViewChart(symbol, !i ? cookies : undefined);
        await this.setInterval(interval);
        await waitForTimeout(1);
        const screenshot = await this.screenshot();
        return {
          data: screenshot,
        };
      } catch (err) {
        logger.error("Failed to screenshot");
      } finally {
        await this.ps.closeBrowser();
      }
    }
  };
}
