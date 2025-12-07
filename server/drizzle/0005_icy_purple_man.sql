CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100),
	"entity_name" varchar(200),
	"user_id" uuid NOT NULL,
	"user_email" varchar(200) NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
