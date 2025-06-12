import { 
  users, meetings, participants, feedback, sessions, agendas, agendaPoints, actions,
  type User, type Meeting, type Participant, type Feedback, type Session, type Agenda, type AgendaPoint, type Action,
  type InsertUser, type InsertMeeting, type InsertParticipant, type InsertFeedback, type InsertSession, type InsertAgenda, type InsertAgendaPoint, type InsertAction 
} from "@shared/schema";
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
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  
  // Agenda operations
  createAgenda(agenda: InsertAgenda): Promise<Agenda>;
  getAgenda(id: number): Promise<Agenda | undefined>;
  getAgendasBySession(sessionId: number): Promise<Agenda[]>;
  updateAgenda(id: number, updates: Partial<Agenda>): Promise<Agenda | undefined>;
  deleteAgenda(id: number): Promise<boolean>;
  
  // Agenda Point operations
  createAgendaPoint(agendaPoint: InsertAgendaPoint): Promise<AgendaPoint>;
  getAgendaPoint(id: number): Promise<AgendaPoint | undefined>;
  getAgendaPointsByAgenda(agendaId: number): Promise<AgendaPoint[]>;
  updateAgendaPoint(id: number, updates: Partial<AgendaPoint>): Promise<AgendaPoint | undefined>;
  deleteAgendaPoint(id: number): Promise<boolean>;
  
  // Action operations
  createAction(action: InsertAction): Promise<Action>;
  getAction(id: number): Promise<Action | undefined>;
  getActionsByAgendaPoint(agendaPointId: number): Promise<Action[]>;
  updateAction(id: number, updates: Partial<Action>): Promise<Action | undefined>;
  deleteAction(id: number): Promise<boolean>;
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
    try {
      await db.delete(participants).where(eq(participants.id, id));
      return true;
    } catch {
      return false;
    }
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

  // Session operations
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return session || undefined;
  }

  async deleteSession(id: number): Promise<boolean> {
    try {
      await db.delete(sessions).where(eq(sessions.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Agenda operations
  async createAgenda(insertAgenda: InsertAgenda): Promise<Agenda> {
    const [agenda] = await db
      .insert(agendas)
      .values(insertAgenda)
      .returning();
    return agenda;
  }

  async getAgenda(id: number): Promise<Agenda | undefined> {
    const [agenda] = await db.select().from(agendas).where(eq(agendas.id, id));
    return agenda || undefined;
  }

  async getAgendasBySession(sessionId: number): Promise<Agenda[]> {
    return await db.select().from(agendas).where(eq(agendas.sessionId, sessionId));
  }

  async updateAgenda(id: number, updates: Partial<Agenda>): Promise<Agenda | undefined> {
    const [agenda] = await db
      .update(agendas)
      .set(updates)
      .where(eq(agendas.id, id))
      .returning();
    return agenda || undefined;
  }

  async deleteAgenda(id: number): Promise<boolean> {
    try {
      await db.delete(agendas).where(eq(agendas.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Agenda Point operations
  async createAgendaPoint(insertAgendaPoint: InsertAgendaPoint): Promise<AgendaPoint> {
    const [agendaPoint] = await db
      .insert(agendaPoints)
      .values(insertAgendaPoint)
      .returning();
    return agendaPoint;
  }

  async getAgendaPoint(id: number): Promise<AgendaPoint | undefined> {
    const [agendaPoint] = await db.select().from(agendaPoints).where(eq(agendaPoints.id, id));
    return agendaPoint || undefined;
  }

  async getAgendaPointsByAgenda(agendaId: number): Promise<AgendaPoint[]> {
    return await db.select().from(agendaPoints).where(eq(agendaPoints.agendaId, agendaId));
  }

  async updateAgendaPoint(id: number, updates: Partial<AgendaPoint>): Promise<AgendaPoint | undefined> {
    const [agendaPoint] = await db
      .update(agendaPoints)
      .set(updates)
      .where(eq(agendaPoints.id, id))
      .returning();
    return agendaPoint || undefined;
  }

  async deleteAgendaPoint(id: number): Promise<boolean> {
    try {
      await db.delete(agendaPoints).where(eq(agendaPoints.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Action operations
  async createAction(insertAction: InsertAction): Promise<Action> {
    const [action] = await db
      .insert(actions)
      .values(insertAction)
      .returning();
    return action;
  }

  async getAction(id: number): Promise<Action | undefined> {
    const [action] = await db.select().from(actions).where(eq(actions.id, id));
    return action || undefined;
  }

  async getActionsByAgendaPoint(agendaPointId: number): Promise<Action[]> {
    return await db.select().from(actions).where(eq(actions.agendaPointId, agendaPointId));
  }

  async updateAction(id: number, updates: Partial<Action>): Promise<Action | undefined> {
    const [action] = await db
      .update(actions)
      .set(updates)
      .where(eq(actions.id, id))
      .returning();
    return action || undefined;
  }

  async deleteAction(id: number): Promise<boolean> {
    try {
      await db.delete(actions).where(eq(actions.id, id));
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
