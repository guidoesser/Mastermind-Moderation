import { meetings, participants, feedback, type Meeting, type Participant, type Feedback, type InsertMeeting, type InsertParticipant, type InsertFeedback } from "@shared/schema";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private meetings: Map<number, Meeting>;
  private participants: Map<number, Participant>;
  private feedback: Map<number, Feedback>;
  private currentMeetingId: number;
  private currentParticipantId: number;
  private currentFeedbackId: number;

  constructor() {
    this.meetings = new Map();
    this.participants = new Map();
    this.feedback = new Map();
    this.currentMeetingId = 1;
    this.currentParticipantId = 1;
    this.currentFeedbackId = 1;
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentMeetingId++;
    const meeting: Meeting = {
      id,
      title: insertMeeting.title,
      roomId: insertMeeting.roomId,
      currentPhase: insertMeeting.currentPhase || "check-in",
      phaseStartTime: new Date(),
      isActive: insertMeeting.isActive ?? true,
      isRecording: insertMeeting.isRecording ?? false,
      createdAt: new Date(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingByRoomId(roomId: string): Promise<Meeting | undefined> {
    return Array.from(this.meetings.values()).find(
      (meeting) => meeting.roomId === roomId
    );
  }

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...updates };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.currentParticipantId++;
    const participant: Participant = {
      id,
      name: insertParticipant.name,
      meetingId: insertParticipant.meetingId,
      avatar: insertParticipant.avatar || null,
      status: insertParticipant.status || "waiting",
      joinedAt: new Date(),
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipantsByMeeting(meetingId: number): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.meetingId === meetingId
    );
  }

  async getParticipantByNameAndMeeting(name: string, meetingId: number): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.name === name && participant.meetingId === meetingId
    );
  }

  async updateParticipant(id: number, updates: Partial<Participant>): Promise<Participant | undefined> {
    const participant = this.participants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, ...updates };
    this.participants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async removeParticipant(id: number): Promise<boolean> {
    return this.participants.delete(id);
  }

  async addFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentFeedbackId++;
    const feedbackItem: Feedback = {
      id,
      meetingId: insertFeedback.meetingId,
      participantId: insertFeedback.participantId,
      phase: insertFeedback.phase,
      whatWentWell: insertFeedback.whatWentWell || null,
      challenges: insertFeedback.challenges || null,
      actionItems: insertFeedback.actionItems || null,
      createdAt: new Date(),
    };
    this.feedback.set(id, feedbackItem);
    return feedbackItem;
  }

  async getFeedbackByMeeting(meetingId: number): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(
      (feedback) => feedback.meetingId === meetingId
    );
  }
}

export const storage = new MemStorage();
