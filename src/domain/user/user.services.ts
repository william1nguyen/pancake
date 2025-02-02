import jwt, { type JwtPayload } from "jsonwebtoken";

import {
  CookiesExpiredError,
  CookiesInvalidError,
  CookiesMissedError,
  UnauthorizedError,
} from "./user.errors";
import { isBefore } from "date-fns";
import { UserCookie } from "./user.types";
import { type Cookie, CookieSameSite } from "puppeteer";
import { db } from "~/drizzle/db";
import { userTable } from "~/drizzle/schema";
import { eq } from "drizzle-orm";

const requiredKeys = [
  "_sp_ses.cf1a",
  "device_t",
  "sessionid",
  "sessionid_sign",
  "cookiePrivacyPreferenceBannerProduction",
  "_sp_id.cf1a",
];

export const isCookiesValid = async (cookies: Cookie[]) => {
  return requiredKeys.every((key) =>
    cookies.some((cookie) => cookie.name === key && cookie.value),
  );
};

const convertSameSite = (sameSite: string): CookieSameSite | undefined => {
  const sameSiteLower = sameSite.toLowerCase();
  switch (sameSiteLower) {
    case "strict":
      return "Strict";
    case "lax":
      return "Lax";
    case "none":
      return "None";
    default:
      return undefined;
  }
};

const convertToPuppeteerCookie = (cookies: UserCookie[]) => {
  return cookies.map((cookie: UserCookie) => {
    return {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      expires: cookie.expirationDate,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: convertSameSite(cookie.sameSite),
    };
  }) as Cookie[];
};

export const validateCookies = async (decoded: JwtPayload) => {
  const data = decoded.payload;

  if (!data || !data.cookies) {
    throw new CookiesMissedError();
  }

  const cookies = convertToPuppeteerCookie(data.cookies);
  const now = new Date().getTime();

  if (!cookies.some((cookie) => isBefore(cookie.expires, now))) {
    throw new CookiesExpiredError();
  }

  if (!(await isCookiesValid(cookies))) {
    throw new CookiesInvalidError();
  }

  return cookies;
};

export const decodeJWTToken = async (token: string, jwtScret?: string) => {
  const secretKey = jwtScret
    ? jwtScret
    : (
        await db.query.userTable.findFirst({
          where: eq(userTable.cookies, token),
        })
      )?.jwtSecret;

  if (!secretKey) {
    throw new UnauthorizedError();
  }

  const decoded = jwt.verify(token, secretKey, { complete: true });
  const cookies = await validateCookies(decoded);
  return cookies;
};

export const stringifyJWTCookies = async (cookies: Cookie[]) => {
  if (!isCookiesValid(cookies)) {
    throw new CookiesInvalidError();
  }
  const stringfiedCookies = cookies.reduce((acc, cookie) => {
    return requiredKeys.includes(cookie.name)
      ? `${acc}${cookie.name}=${cookie.value}; `
      : `${acc}`;
  }, "");

  return stringfiedCookies;
};

export const decodeAndStringifyToken = async (token: string) => {
  const decoded = await decodeJWTToken(token);
  return await stringifyJWTCookies(decoded);
};
