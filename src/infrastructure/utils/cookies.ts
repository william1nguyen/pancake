import type { Cookie } from "puppeteer";
import { env } from "../shared/env";
import { CookieExpiredError, CookieInvalidError } from "./errors";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { addMonths, isAfter } from "date-fns";

const requiredCookieKeys = [
  "_sp_ses.cf1a",
  "device_t",
  "sessionid",
  "sessionid_sign",
  "tv_ecuid",
  "cookiePrivacyPreferenceBannerProduction",
  "_sp_id.cf1a",
];
const secretKey = env.JWT_SECRET;

const hasAllRequiredValues = async (cookies: Cookie[]) => {
  return requiredCookieKeys.every((key) =>
    cookies.some((cookie) => cookie.name === key && cookie.value),
  );
};

export const isCookiesValid = async (cookies: Cookie[]) => {
  return cookies && hasAllRequiredValues(cookies);
};

export const validateCookies = async (decoded: JwtPayload) => {
  const data = decoded.payload;

  if (!data || !data.exp || !data.sub) {
    throw new CookieInvalidError();
  }

  const expiresTime = data.exp as number;
  const now = new Date().getTime();

  if (isAfter(now, expiresTime)) {
    throw new CookieExpiredError();
  }

  const cookies = data.sub.tv_cookies as Cookie[];

  if (!(await isCookiesValid(cookies))) {
    throw new CookieInvalidError();
  }

  return cookies;
};

export const encodeCookies = async (cookies: Cookie[]) => {
  const now = new Date();
  const payload = {
    sub: {
      tv_cookies: cookies,
    },
    exp: addMonths(now, 1).getTime(),
    name: "tradingview_cookies",
  };
  const encoded = jwt.sign(payload, secretKey);
  return encoded;
};

export const decodeJWTToken = async (token: string) => {
  const decoded = jwt.verify(token, secretKey, { complete: true });
  const cookies = await validateCookies(decoded);
  return cookies;
};

export const stringifyJWTCookies = async (cookies: Cookie[]) => {
  if (!isCookiesValid(cookies)) {
    throw new CookieInvalidError();
  }
  const stringfiedCookies = cookies.reduce((acc, cookie) => {
    return requiredCookieKeys.includes(cookie.name)
      ? `${acc}${cookie.name}=${cookie.value}; `
      : `${acc}`;
  }, "");

  return stringfiedCookies;
};

export const decodeAndStringifyToken = async (token: string) => {
  const decoded = await decodeJWTToken(token);
  return await stringifyJWTCookies(decoded);
};
