import { users, meetings, participants, feedback, type User, type Meeting, type Participant, type Feedback, type InsertUser, type InsertMeeting, type InsertParticipant, type InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Meeting operations
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingByRoomId(roomId: string): Promise<Meeting | undefined>;
  updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined>;
  
  // Participant operations
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantsByMeeting(meetingId: number): Promise<Participant[]>;
  getParticipantByNameAndMeeting(name: string, meetingId: number): Promise<Participant | undefined>;
  updateParticipant(id: number, updates: Partial<Participant>): Promise<Participant | undefined>;
  removeParticipant(id: number): Promise<boolean>;
  
  // Feedback operations
  addFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getFeedbackByMeeting(meetingId: number): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db
      .insert(meetings)
      .values(insertMeeting)
      .returning();
    return meeting;
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting || undefined;
  }

  async getMeetingByRoomId(roomId: string): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.roomId, roomId));
    return meeting || undefined;
  }

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const [meeting] = await db
      .update(meetings)
      .set(updates)
      .where(eq(meetings.id, id))
      .returning();
    return meeting || undefined;
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const [participant] = await db
      .insert(participants)
      .values(insertParticipant)
      .returning();
    return participant;
  }

  async getParticipantsByMeeting(meetingId: number): Promise<Participant[]> {
    return await db.select().from(participants).where(eq(participants.meetingId, meetingId));
  }

  async getParticipantByNameAndMeeting(name: string, meetingId: number): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(and(eq(participants.name, name), eq(participants.meetingId, meetingId)));
    return participant || undefined;
  }

  async updateParticipant(id: number, updates: Partial<Participant>): Promise<Participant | undefined> {
    const [participant] = await db
      .update(participants)
      .set(updates)
      .where(eq(participants.id, id))
      .returning();
    return participant || undefined;
  }

  async removeParticipant(id: number): Promise<boolean> {
    const result = await db.delete(participants).where(eq(participants.id, id));
    return result.length > 0;
  }

  async addFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return feedbackItem;
  }

  async getFeedbackByMeeting(meetingId: number): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.meetingId, meetingId));
  }
}

export const storage = new DatabaseStorage();
