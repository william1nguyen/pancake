import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { pgTable, text } from "drizzle-orm/pg-core";

export const dscUserTable = pgTable("dsc_user", {
  id: text("id").primaryKey().notNull().unique(),
  username: text("username").notNull().unique(),
  channelId: text("channelId"),
});

export const tvAccountTable = pgTable(
  "tv_account",
  {
    dscUserId: text("dsc_user_id")
      .notNull()
      .references(() => dscUserTable.id)
      .unique(),
    username: text("username").notNull(),
    password: text("password").notNull(),
    backupCode: text("backup_code").notNull(),
    cookies: text("cookies"),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.dscUserId),
      usernameIdx: index("username_idx").on(table.dscUserId),
    };
  },
);

export const tvAccountUserRelations = relations(tvAccountTable, ({ one }) => ({
  user: one(dscUserTable, {
    fields: [tvAccountTable.dscUserId],
    references: [dscUserTable.id],
  }),
}));
