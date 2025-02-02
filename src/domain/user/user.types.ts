import { type Static, Type } from "@sinclair/typebox";

export const UserCookie = Type.Object({
  domain: Type.String(),
  expirationDate: Type.Number(),
  hostOnly: Type.Boolean(),
  httpOnly: Type.Boolean(),
  name: Type.String(),
  path: Type.String(),
  sameSite: Type.String(),
  secure: Type.Boolean(),
  session: Type.Boolean(),
  storeId: Type.String(),
  value: Type.String(),
});

export type UserCookie = Static<typeof UserCookie>;
