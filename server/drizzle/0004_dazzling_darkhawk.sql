CREATE TABLE IF NOT EXISTS "app_changelogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar(50) NOT NULL,
	"version" varchar(50) NOT NULL,
	"release_date" timestamp NOT NULL,
	"change_type" varchar(20) DEFAULT 'update' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"changes" text,
	"download_url" varchar(500),
	"is_highlighted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_changelogs" ADD CONSTRAINT "app_changelogs_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
