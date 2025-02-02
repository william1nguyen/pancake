import {
  clickElement,
  findAndClickTargetOption,
  focusAndSetInput,
  getTextContent,
  isElementExisted,
  waitForTimeout,
} from "~/infra/puppeteer/pageActions";
import { env } from "~/infra/utils/env";
import { addDays, formatISO } from "date-fns";
import logger from "~/infra/utils/logger";
import type { CreateAlertBody } from "~/domain/alert/alert.types";
import {
  CookiesInvalidError,
  PremiumRequiredError,
  UnauthorizedError,
} from "~/domain/user/user.errors";
import { decodeJWTToken } from "~/domain/user/user.services";
import path from "node:path";
import { PuppeteerService } from "~/infra/puppeteer";

export const OrbrBot = {
  bs: "[orbr.cc] 𝑩𝒖𝒚/𝑺𝒆𝒍𝒍v1.0",
  thp: "[orbr.cc] 𝑻𝒓𝒆𝒏𝒅 𝑯𝒆𝒍𝒑𝒆𝒓 (7, 21, 50, 100, 200)v1.0",
};

const selectors = {
  interval: {
    openOptionButton: "#header-toolbar-intervals > button > div",
    option: "div.menuWrap-Kq3ruQo8 > div > div > div > div > div",
  },

  alertMenuButton: "#header-toolbar-alerts",

  condition: {
    pleft: "div.select-QIZwlRt3.container-rQbXR7sf.select-vRd8Kb7b > span",
    pright: "div.select-QIZwlRt3.container-rQbXR7sf.select-JuXNwxPm > span",
    op: "div.operatorRow-INZ15hnz > div > span",
    tleft:
      "div.conditionSection-INZ15hnz > fieldset:nth-child(3) > div.fieldsColumn-Fddz5wLp > div > div.select-QIZwlRt3.container-rQbXR7sf.bandsSelect-UNjI8HWs > span",
    tright:
      "div.conditionSection-INZ15hnz > fieldset:nth-child(3) > div.fieldsColumn-Fddz5wLp > div > div.range-r38hMtWb.container-rQbXR7sf.bandsRange-UNjI8HWs > span",
    qleft:
      "div.conditionSection-INZ15hnz > fieldset:nth-child(4) > div.fieldsColumn-Fddz5wLp > div > div.select-QIZwlRt3.container-rQbXR7sf.bandsSelect-UNjI8HWs > span",
    qright:
      "div.conditionSection-INZ15hnz > fieldset:nth-child(4) > div.fieldsColumn-Fddz5wLp > div > div.range-r38hMtWb.container-rQbXR7sf.bandsRange-UNjI8HWs > span",
    option: 'div[role="option"]',
  },

  trigger: {
    option:
      "div.fieldsColumn-Fddz5wLp.fieldsColumn-diAuoE4t > span > button > span > span:nth-child(1)",
  },

  expiration: {
    openButton:
      "div.contentWrapper-XZUCVcPz.permanentScroll-XZUCVcPz > div > fieldset:nth-child(5) > div.fieldsColumn-Fddz5wLp > button",
    date: "#alert-editor-expiration-popup div div div:nth-child(1) div div div span input",
    time: "div.time-fpDXgGC1 span input",
    acceptButton: "#alert-editor-expiration-popup > div > div > div > button",
  },

  message: "textarea#alert-message",
  openNotificationMenu:
    "#alert-dialog-tabs__notifications > div > span:nth-child(1)",
  sendEmailCheckbox:
    "div.contentWrapper-XZUCVcPz.permanentScroll-XZUCVcPz > div div:nth-child(7) span.label-vyj6oJxw",
  premiumAds:
    "div.dialog-wH0t6WRN.radius-wH0t6WRN.gopro-wH0t6WRN.dialog-VeoIyDt4.dialog-aRAWUDhF.rounded-aRAWUDhF.shadowed-aRAWUDhF",
  exitPremiumAdButton:
    "div.dialog-wH0t6WRN.radius-wH0t6WRN.gopro-wH0t6WRN.dialog-VeoIyDt4.dialog-aRAWUDhF.rounded-aRAWUDhF.shadowed-aRAWUDhF > div > button",
  webhookCheckbox:
    "div.contentWrapper-XZUCVcPz.permanentScroll-XZUCVcPz div:nth-child(10) span.wrapper-GZajBGIm svg",
  applyWebhookButton:
    "div.contentWrapper-XZUCVcPz.permanentScroll-XZUCVcPz div:nth-child(10) span.label-vyj6oJxw",
  webhookUrlInput: "#webhook-url",
  applyButton: "div.footerWrapper-xhmb_vtW div div button:nth-child(2)",
};

export class CreateWorkflow {
  private baseUrl;
  private ps;
  private retryLimit;
  private forceExit;

  constructor(retryLimit = 5) {
    this.baseUrl = env.TRADINGVIEW_URL;
    this.ps = new PuppeteerService();
    this.retryLimit = retryLimit;
    this.forceExit = false;
  }

  openTradingViewChart = async (symbol: string, token?: string) => {
    await this.ps.openPage(path.join(this.baseUrl, `/chart/?symbol=${symbol}`));

    if (token) {
      try {
        await this.ps.loadCookie(await decodeJWTToken(token));
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

  openAlertMenu = async () => {
    await clickElement(this.ps.validatePage(), selectors.alertMenuButton);
  };

  setCondition = async (type: string) => {
    const page = this.ps.validatePage();
    await clickElement(page, selectors.condition.pleft);
    await findAndClickTargetOption(
      page,
      selectors.condition.option,
      OrbrBot.bs,
    );

    await clickElement(page, selectors.condition.op);
    await findAndClickTargetOption(page, selectors.condition.option, type);
  };

  setTrigger = async (trigger?: string) => {
    if (!trigger) return;

    const page = this.ps.validatePage();
    await findAndClickTargetOption(page, selectors.trigger.option, trigger);
  };

  updateExpirationDate = (date: string, duration: string) => {
    const current = new Date(date);
    const days: Record<string, number> = {
      "1d": 1,
      "1w": 7,
      "1M": 30,
    };

    const after = addDays(current, days[duration]);
    return formatISO(after, { representation: "date" });
  };

  setDuration = async (duration: string) => {
    const page = this.ps.validatePage();

    await clickElement(page, selectors.expiration.openButton);

    const date = await getTextContent(page, selectors.expiration.date);

    const newDate = this.updateExpirationDate(date, duration);

    await focusAndSetInput(page, selectors.expiration.date, newDate);
    await clickElement(page, selectors.expiration.acceptButton);
  };

  setMessage = async (message: string) => {
    const page = this.ps.validatePage();
    await focusAndSetInput(page, selectors.message, message);
  };

  openNotificationMenu = async () => {
    const page = this.ps.validatePage();
    await clickElement(page, selectors.openNotificationMenu);
  };

  setSendEmail = async () => {
    const page = this.ps.validatePage();
    await clickElement(page, selectors.sendEmailCheckbox);
  };

  isPremiumAdsPopup = async () => {
    const page = this.ps.validatePage();
    return await isElementExisted(page, selectors.premiumAds);
  };

  exitPremiumAds = async () => {
    const page = this.ps.validatePage();
    if (!(await this.isPremiumAdsPopup)) return;
    await clickElement(page, selectors.exitPremiumAdButton);

    this.forceExit = true; // premium plan is required
    throw new PremiumRequiredError();
  };

  setWebhookUrl = async (webhookUrl: string) => {
    const page = this.ps.validatePage();

    const isWebhookEnabled = await isElementExisted(
      page,
      selectors.webhookCheckbox,
    );
    if (!isWebhookEnabled) {
      await clickElement(page, selectors.applyWebhookButton);
      await this.exitPremiumAds();
    }

    await focusAndSetInput(page, selectors.webhookUrlInput, webhookUrl);
  };

  apply = async () => {
    const page = this.ps.validatePage();
    await clickElement(page, selectors.applyButton);
  };

  execute = async (
    {
      symbol,
      interval = "4 hours",
      type,
      webhook = undefined,
      duration = "1M",
      addition,
    }: CreateAlertBody,
    token: string,
  ) => {
    if (!token) {
      throw new UnauthorizedError();
    }

    for (let i = 0; i < this.retryLimit; ++i) {
      if (this.forceExit) {
        return {
          error: "Premium plans are required!",
        };
      }

      try {
        await this.openTradingViewChart(symbol, !i ? token : undefined);
        await this.setInterval(interval);
        await this.openAlertMenu();
        await this.setCondition(type);
        await this.setTrigger(addition?.trigger || "Once Per Bar");
        await this.setDuration(duration);
        const message = JSON.stringify({
          content: `Orbr ${type} alert for ${symbol}
        On {{exchange}}:{{ticker}} {{interval}} @ {{close}}
        Time: {{time}}
      `,
          username: webhook?.name,
        });
        await this.setMessage(message);
        await this.openNotificationMenu();
        await this.setSendEmail();
        if (webhook) {
          await this.setWebhookUrl(webhook.url);
        }
        await this.apply();
        await waitForTimeout(1);
        return {
          message: `Sucessfully created Orbr ${type} alert`,
        };
      } catch (err) {
        logger.error(`Failed to create alert ${err}`);
      } finally {
        await this.ps.closeBrowser();
      }
    }

    return {
      error: "Failed to create alert! Please wait for 30s!",
    };
  };
}
