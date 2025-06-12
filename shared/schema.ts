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

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at"),
  duration: integer("duration"), // in minutes
  status: text("status").notNull().default("planned"), // planned, in-progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const agendas = pgTable("agendas", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessions.id),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  estimatedDuration: integer("estimated_duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const agendaPoints = pgTable("agenda_points", {
  id: serial("id").primaryKey(),
  agendaId: integer("agenda_id").notNull().references(() => agendas.id),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  type: text("type").notNull().default("discussion"), // discussion, decision, information, action
  estimatedDuration: integer("estimated_duration"), // in minutes
  status: text("status").notNull().default("pending"), // pending, in-progress, completed, skipped
  createdAt: timestamp("created_at").defaultNow(),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  agendaPointId: integer("agenda_point_id").notNull().references(() => agendaPoints.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("pending"), // pending, in-progress, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
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

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertAgendaSchema = createInsertSchema(agendas).omit({
  id: true,
  createdAt: true,
});

export const insertAgendaPointSchema = createInsertSchema(agendaPoints).omit({
  id: true,
  createdAt: true,
});

export const insertActionSchema = createInsertSchema(actions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertAgenda = z.infer<typeof insertAgendaSchema>;
export type InsertAgendaPoint = z.infer<typeof insertAgendaPointSchema>;
export type InsertAction = z.infer<typeof insertActionSchema>;

export type User = typeof users.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Agenda = typeof agendas.$inferSelect;
export type AgendaPoint = typeof agendaPoints.$inferSelect;
export type Action = typeof actions.$inferSelect;

export const MEETING_PHASES = ['check-in', 'hot-seat', 'feedback', 'action-steps'] as const;
export const PARTICIPANT_STATUS = ['waiting', 'speaking', 'next', 'completed'] as const;
