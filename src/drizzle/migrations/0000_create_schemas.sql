CREATE TABLE IF NOT EXISTS "dsc_user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"channelId" text,
	CONSTRAINT "dsc_user_id_unique" UNIQUE("id"),
	CONSTRAINT "dsc_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tv_account" (
	"dsc_user_id" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"backup_code" text NOT NULL,
	"cookies" text,
	CONSTRAINT "tv_account_dsc_user_id_unique" UNIQUE("dsc_user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tv_account" ADD CONSTRAINT "tv_account_dsc_user_id_dsc_user_id_fk" FOREIGN KEY ("dsc_user_id") REFERENCES "public"."dsc_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_idx" ON "tv_account" USING btree ("dsc_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_idx" ON "tv_account" USING btree ("dsc_user_id");