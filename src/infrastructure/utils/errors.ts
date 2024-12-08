import { createError } from "../shared/errors";

export enum AlertErrorCode {
  CookieInvalid = "CookieInvalid",
  CookieExpired = "CookieExpired",
  ElementNotFound = "ElementNotFound",
  PageIsNotOpen = "PageIsNotOpen",
}

export const CookieInvalidError = createError(
  AlertErrorCode.CookieInvalid,
  "User cookie is invalid",
  500,
);

export const CookieExpiredError = createError(
  AlertErrorCode.CookieExpired,
  "User cookie is expired",
  500,
);

export const ElementNotFoundError = createError(
  AlertErrorCode.ElementNotFound,
  "Element is not found",
  404,
);

export const PageIsNotOpenError = createError(
  AlertErrorCode.PageIsNotOpen,
  "There is no opened Page",
  404,
);
