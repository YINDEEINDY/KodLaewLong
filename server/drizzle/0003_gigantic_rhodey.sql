CREATE TABLE IF NOT EXISTS "app_stats" (
	"app_id" varchar(50) PRIMARY KEY NOT NULL,
	"selection_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"last_selected_at" timestamp,
	"last_downloaded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "build_apps" (
	"build_id" varchar(50) NOT NULL,
	"app_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "build_apps_build_id_app_id_pk" PRIMARY KEY("build_id","app_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "build_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"build_id" varchar(50) NOT NULL,
	"app_count" integer NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_download_at" timestamp,
	CONSTRAINT "build_stats_build_id_unique" UNIQUE("build_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_stats" ADD CONSTRAINT "app_stats_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "build_apps" ADD CONSTRAINT "build_apps_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
