import { type Static, Type } from "@sinclair/typebox";

export const Alert = Type.Object({
  symbol: Type.String(),
  resolution: Type.String(),
  condition: Type.Object({
    type: Type.String(),
    frequency: Type.String(),
    series: Type.Array(Type.Any()),
    alert_cond_id: Type.Optional(Type.String()),
  }),
  expiration: Type.String(),
  auto_deactivate: Type.Boolean(),
  message: Type.String(),
  sound_file: Type.String(),
  popup: Type.Boolean(),
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
