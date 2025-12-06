CREATE TABLE IF NOT EXISTS "user_selections" (
	"user_id" uuid NOT NULL,
	"app_id" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_selections_user_id_app_id_pk" PRIMARY KEY("user_id","app_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_selections" ADD CONSTRAINT "user_selections_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
