import { createError } from "../utils/errors";

export enum ErrorCode {
  ElementNotFound = "ElementNotFound",
  PageIsNotOpen = "PageIsNotOpen",
}

export const ElementNotFoundError = createError(
  "ElementNotFoundError",
  "Element is not found",
  404,
);

export const PageIsNotOpenError = createError(
  ErrorCode.PageIsNotOpen,
  "There is no opened Page",
  404,
);
