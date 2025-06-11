import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  roomId: text("room_id").notNull().unique(),
  currentPhase: text("current_phase").notNull().default("check-in"),
  phaseStartTime: timestamp("phase_start_time").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  isRecording: boolean("is_recording").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  name: text("name").notNull(),
  avatar: text("avatar"),
  status: text("status").notNull().default("waiting"), // waiting, speaking, next, completed
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  participantId: integer("participant_id").notNull().references(() => participants.id),
  phase: text("phase").notNull(),
  whatWentWell: text("what_went_well"),
  challenges: text("challenges"),
  actionItems: text("action_items"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  joinedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;

export const MEETING_PHASES = ['check-in', 'hot-seat', 'feedback', 'action-steps'] as const;
export const PARTICIPANT_STATUS = ['waiting', 'speaking', 'next', 'completed'] as const;
