CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'audio', 'video', 'file');--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "type" "message_type" DEFAULT 'text' NOT NULL;