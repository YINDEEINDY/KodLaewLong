CREATE TYPE "public"."app_type" AS ENUM('GENERAL', 'ENTERPRISE', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('FREE', 'PAID', 'FREEMIUM', 'TRIAL');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "apps" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"category_id" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"icon_url" varchar(500) NOT NULL,
	"license_type" "license_type" DEFAULT 'FREE' NOT NULL,
	"app_type" "app_type" DEFAULT 'GENERAL' NOT NULL,
	"is_public_free" boolean DEFAULT true NOT NULL,
	"official_website_url" varchar(500) NOT NULL,
	"official_download_url" varchar(500),
	"is_recommended" boolean DEFAULT false,
	"has_install_guide" boolean DEFAULT false NOT NULL,
	"install_guide_title" varchar(200),
	"install_guide_steps" text,
	"install_notes" text,
	"installer_source_url" varchar(500),
	"installer_type" varchar(20),
	"silent_arguments" varchar(500),
	"version" varchar(50),
	"vendor" varchar(200),
	"manual_download_url" varchar(500),
	"manual_download_file_name" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apps" ADD CONSTRAINT "apps_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
