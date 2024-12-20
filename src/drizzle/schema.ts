import { pgTable, text } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: text("id").primaryKey().notNull().unique(),
  channelId: text("channel_id"),
  cookies: text("cookies"),
  webhookUrl: text("webhook_url"),
});
