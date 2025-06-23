CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agenda_point_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assigned_to" text,
	"due_date" timestamp,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "agenda_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"agenda_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"type" text DEFAULT 'discussion' NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agendas" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"estimated_duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"phase" text NOT NULL,
	"what_went_well" text,
	"challenges" text,
	"action_items" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"room_id" text NOT NULL,
	"current_phase" text DEFAULT 'check-in' NOT NULL,
	"phase_start_time" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_recording" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "meetings_room_id_unique" UNIQUE("room_id")
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"status" text DEFAULT 'waiting' NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recordings" (
	"id" serial PRIMARY KEY NOT NULL,
	"meeting_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"duration" integer,
	"format" text DEFAULT 'webm' NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_at" timestamp,
	"duration" integer,
	"status" text DEFAULT 'planned' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_agenda_point_id_agenda_points_id_fk" FOREIGN KEY ("agenda_point_id") REFERENCES "public"."agenda_points"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_points" ADD CONSTRAINT "agenda_points_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "public"."agendas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;