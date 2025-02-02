import { createError } from "~/infra/utils/errors";

export enum ErrorCode {
  CookiesMissed = "CookiesMissed",
  CookiesInvalid = "CookiesInvalid",
  CookiesExpired = "CookiesExpired",
  UnauthorizedError = "Unauthorized",
  LoginFailedError = "LoginFailed",
  PremiumRequiredError = "PremiumRequired",
}

export const UnauthorizedError = createError(
  ErrorCode.UnauthorizedError,
  "User cookies is empty!",
  403,
);

export const LoginFailedError = createError(
  ErrorCode.LoginFailedError,
  "Login failed!",
  400,
);

export const PremiumRequiredError = createError(
  ErrorCode.PremiumRequiredError,
  "Premium plans are required!",
  400,
);

export const CookiesMissedError = createError(
  ErrorCode.CookiesMissed,
  "User cookies is missed!",
  404,
);

export const CookiesInvalidError = createError(
  ErrorCode.CookiesInvalid,
  "User cookies is invalid",
  500,
);

export const CookiesExpiredError = createError(
  ErrorCode.CookiesExpired,
  "User cookies is expired",
  500,
);
