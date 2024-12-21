import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

interface Webhook {
  name: string;
  url: string;
}

export const userTable = pgTable("user", {
  id: text("id").primaryKey().notNull().unique(),
  channelId: text("channel_id"),
  cookies: text("cookies"),
  webhook: jsonb("webhook").$type<Webhook>(),
});
