CREATE TYPE "role_scope" AS ENUM('platform', 'vendor', 'driver', 'customer');--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"key" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"scope" "role_scope" NOT NULL,
	"vendor_id" uuid,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "roles_key_system_unique" ON "roles" ("key") WHERE "vendor_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "roles_vendor_key_unique" ON "roles" ("vendor_id","key") WHERE "vendor_id" is not null;