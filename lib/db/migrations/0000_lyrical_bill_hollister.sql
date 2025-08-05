CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(100) NOT NULL,
	"details" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"author" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"approved" boolean DEFAULT true,
	"flagged" boolean DEFAULT false,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "event_proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"municipality" varchar(100) NOT NULL,
	"department" varchar(100) NOT NULL,
	"organizer" text,
	"website" text,
	"description" text,
	"category" varchar(50) DEFAULT 'Running',
	"registration_fee" varchar(50),
	"distances" jsonb DEFAULT '[]'::jsonb,
	"submitted_by" varchar(100) DEFAULT 'public_form',
	"submitted_at" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" varchar(100),
	"reviewed_at" timestamp,
	"review_notes" text,
	"published_event_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" varchar(50) DEFAULT 'Running' NOT NULL,
	"snippet" text,
	"altitude" varchar(20),
	"event_date" timestamp NOT NULL,
	"registration_deadline" timestamp,
	"municipality" varchar(100) NOT NULL,
	"department" varchar(100) NOT NULL,
	"organizer" text,
	"website" text,
	"registration_fee" varchar(50),
	"content" text,
	"content_html" text,
	"cover" text,
	"distances" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"author" varchar(100) DEFAULT 'Luis Hincapie',
	"publish_date" timestamp DEFAULT now(),
	"draft" boolean DEFAULT false,
	"featured" boolean DEFAULT false,
	"markdown_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"views" integer DEFAULT 0,
	"comments_count" integer DEFAULT 0,
	CONSTRAINT "events_event_id_unique" UNIQUE("event_id"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_stats_key_unique" UNIQUE("key")
);
