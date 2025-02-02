import { type Static, Type } from "@sinclair/typebox";

export const Condition = Type.Object({
  pleft: Type.Optional(Type.String()),
  pright: Type.Optional(Type.String()),
  op: Type.Optional(Type.String()),
  tleft: Type.Optional(Type.String()),
  tright: Type.Optional(Type.String()),
  qleft: Type.Optional(Type.String()),
  qright: Type.Optional(Type.String()),
});

export type Condition = Static<typeof Condition>;

export const AdditionalInfo = Type.Object({
  trigger: Type.Optional(Type.String()),
  condition: Type.Optional(Condition),
});

export const CreateAlertBody = Type.Object({
  symbol: Type.String(),
  interval: Type.Optional(
    Type.Union([
      Type.Literal("15 minutes"),
      Type.Literal("30 minutes"),
      Type.Literal("1 hour"),
      Type.Literal("4 hours"),
      Type.Literal("1 day"),
      Type.Literal("1 week"),
      Type.Literal("1 year"),
    ]),
  ),
  type: Type.Union([Type.Literal("Buy"), Type.Literal("Sell")]),
  webhook: Type.Optional(
    Type.Object({
      url: Type.String(),
      name: Type.String(),
    }),
  ),
  duration: Type.Optional(
    Type.Union([Type.Literal("1d"), Type.Literal("1w"), Type.Literal("1M")]),
  ),
  addition: Type.Optional(AdditionalInfo),
});

export type CreateAlertBody = Static<typeof CreateAlertBody>;

export const ListAlertQuerystring = Type.Object({
  alertId: Type.Optional(Type.Number()),
});

export type ListAlertQuerystring = Static<typeof ListAlertQuerystring>;

export const RemoveAlertBody = Type.Object({
  alertId: Type.Number(),
});

export type RemoveAlertBody = Static<typeof RemoveAlertBody>;

export const Alert = Type.Object({
  symbol: Type.String(),
  resolution: Type.String(),
  condition: Type.Object({
    type: Type.String(),
    alert_cond_id: Type.Optional(Type.String()),
  }),
  expiration: Type.String(),
  message: Type.String(),
  name: Type.String(),
  alert_id: Type.Number(),
  cross_interval: Type.Boolean(),
  type: Type.String(),
  active: Type.Boolean(),
  create_time: Type.String({ format: "date-time" }),
  last_fire_time: Type.Union([
    Type.Null(),
    Type.String({ format: "date-time" }),
  ]),
  last_fire_bar_time: Type.Union([
    Type.Null(),
    Type.String({ format: "date-time" }),
  ]),
});

export type Alert = Static<typeof Alert>;

export const ListAlertResponse = Type.Object({
  alerts: Type.Array(Alert),
});

export type ListAlertResponse = Static<typeof ListAlertResponse>;

export const RemoveAlertResponse = Type.Object({
  message: Type.String(),
});

export type RemoveAlertResponse = Static<typeof RemoveAlertResponse>;

export const CreateAlertResponse = Type.Object({
  message: Type.Optional(Type.String()),
});

export type CreateAlertResponse = Static<typeof CreateAlertResponse>;

export const ScreenshotBody = Type.Object({
  symbol: Type.String(),
  interval: Type.String(),
});
export type ScreenshotBody = Static<typeof ScreenshotBody>;

export const ScreenshotResponse = Type.Object({
  data: Type.Any(),
});
export type ScreenshotResponse = Static<typeof ScreenshotResponse>;
