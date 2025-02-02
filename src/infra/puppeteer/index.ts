import path from "node:path";
import puppeteer, { Cookie, type Browser, type Page } from "puppeteer";
import logger from "../utils/logger";
import { PageIsNotOpenError } from "./errors";

export class PuppeteerService {
  private browser: Browser | null = null;
  public page: Page | null = null;

  validatePage = () => {
    const page = this.page;
    if (!page) {
      logger.error("Page is not open to any site!");
      throw new PageIsNotOpenError();
    }

    return page;
  };

  config = async (page: Page) => {
    if (!page) {
      return;
    }

    await page.setRequestInterception(true);
    await page.setViewport({ width: 1280, height: 720 });

    const blockingResources = ["image", "font"];

    page.on("request", (request) => {
      if (blockingResources.includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
  };

  launchBrowser = async (proxy?: string): Promise<Browser> => {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-extensions",
          "--hide-scrollbars",
          "--mute-audio",
          "--disable-features=site-per-process",
          "--single-process",
          proxy ? `--proxy-server=${proxy}` : "",
        ],
        defaultViewport: null,
        timeout: 3000,
      });
    }
    return this.browser;
  };

  openPage = async (url: string, proxy?: string): Promise<Page> => {
    const browser = await this.launchBrowser(proxy);

    const pages = await browser.pages();
    if (!pages) {
      this.page = await browser.newPage();
    } else {
      this.page = pages[0];
    }

    await this.config(this.page);

    await this.page.goto(url, {
      waitUntil: "networkidle2",
    });

    return this.page;
  };

  navigatePath = async (urlPath: string): Promise<Page> => {
    if (!this.page) {
      throw new PageIsNotOpenError();
    }

    await this.page.goto(path.join(await this.page.url(), urlPath), {
      waitUntil: "networkidle2",
    });
    return this.page;
  };

  loadCookie = async (cookies: Cookie[]) => {
    this.page = this.validatePage();
    await this.page.setCookie(...cookies);
    await this.page.reload();
  };

  closePage = async (): Promise<void> => {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  };

  closeBrowser = async (): Promise<void> => {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  };
}
