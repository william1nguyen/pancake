CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text,
	"cookies" text,
	"webhook_url" text,
	CONSTRAINT "user_id_unique" UNIQUE("id")
);
