import kleur from "kleur";
import type { Page } from "puppeteer";
import type { ElementHandle } from "puppeteer";
import { env } from "../utils/env";
import logger from "../utils/logger";
import { ElementNotFoundError } from "./errors";

const BASE_DELAY = env.BASE_DELAY || 1000;

export const waitForTimeout = async (
  millsOrMultplier: number,
  message = "",
) => {
  const multiplier = millsOrMultplier;
  const waitTime = Math.round(((BASE_DELAY * millsOrMultplier) / 1000) * 1000);
  logger.info(
    kleur.gray(
      `...waiting ${kleur.bold().white(waitTime)}ms = ${kleur.yellow(
        `${multiplier} x`,
      )} ${kleur.white(BASE_DELAY)}  ${message}`,
    ),
  );
  return new Promise((resolve) => {
    setTimeout(resolve, waitTime);
  });
};

export const waitForElement = async (
  page: Page,
  selector: string,
  timeout = 5000,
): Promise<void> => {
  await page.waitForSelector(selector, { timeout });
};

export const getElementContent = async (
  page: Page,
  element: ElementHandle<Element>,
) => {
  return await page.evaluate((el: Element) => {
    return (
      (el as HTMLInputElement).textContent || (el as HTMLInputElement).value
    );
  }, element);
};

export const fetchFirstSelector = async (
  page: Page,
  selector: string,
  wait = true,
) => {
  if (wait) {
    await waitForElement(page, selector);
  }
  const element = await page.$(`${selector}`);
  return element;
};

export const fetchAllSelector = async (page: Page, selector: string) => {
  await waitForElement(page, selector);
  const element = await page.$$(`${selector}`);
  return element;
};

export const isElementExisted = async (page: Page, selector: string) => {
  const element = await fetchFirstSelector(page, selector, false);
  return element !== null;
};

export const focusAndSetInput = async (
  page: Page,
  selector: string,
  content: string,
) => {
  const element = await fetchFirstSelector(page, selector);
  if (!element) {
    logger.error(`Element ${element} is empty`);
    return;
  }

  await element.focus();
  await page.evaluate(
    (el: Element, content: string) => {
      (el as HTMLInputElement).value = "";
      (el as HTMLInputElement).textContent = content;
    },
    element,
    content,
  );
  await element.type(content);
};

export const clickElement = async (
  page: Page,
  selector: string,
): Promise<void> => {
  const element = await fetchFirstSelector(page, selector);
  if (!element) {
    logger.error(`Element not found for selector: ${selector}`);
    throw new ElementNotFoundError();
  }
  await element.click();
};

export const getTextContent = async (
  page: Page,
  selector: string,
): Promise<string> => {
  const element = await fetchFirstSelector(page, selector);

  if (!element) {
    logger.error(`Element not found for selector: ${selector}`);
    throw new ElementNotFoundError();
  }

  const text = await getElementContent(page, element);
  return text ? text.trim() : "";
};

export const isHasAriaExpanded = async (page: Page, selector: string) => {
  const element = await fetchFirstSelector(page, selector);
  const hasAriaExpanded = await element?.evaluate((el) =>
    el.hasAttribute("aria-expanded"),
  );
  return hasAriaExpanded;
};

export const findAndClickTargetOption = async (
  page: Page,
  selector: string,
  target: string,
) => {
  const elements = await fetchAllSelector(page, selector);

  await Promise.all(
    elements.map(async (el) => {
      const elContent = await getElementContent(page, el);
      if (elContent === target) {
        await el.click();
        return;
      }
    }),
  );
};
