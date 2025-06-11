import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema, insertParticipantSchema, insertFeedbackSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  setupWebSocket(httpServer);

  // Meeting routes
  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting data" });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting ID" });
    }
  });

  app.get("/api/meetings/room/:roomId", async (req, res) => {
    try {
      const meeting = await storage.getMeetingByRoomId(req.params.roomId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: "Invalid room ID" });
    }
  });

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const meeting = await storage.updateMeeting(id, updates);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Participant routes
  app.post("/api/participants", async (req, res) => {
    try {
      const participantData = insertParticipantSchema.parse(req.body);
      const participant = await storage.addParticipant(participantData);
      res.json(participant);
    } catch (error) {
      res.status(400).json({ error: "Invalid participant data" });
    }
  });

  app.get("/api/meetings/:meetingId/participants", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const participants = await storage.getParticipantsByMeeting(meetingId);
      res.json(participants);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting ID" });
    }
  });

  app.get("/api/meetings/:meetingId/participants/check/:name", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const name = req.params.name;
      const participant = await storage.getParticipantByNameAndMeeting(name, meetingId);
      res.json({ exists: !!participant, participant });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const participant = await storage.updateParticipant(id, updates);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.json(participant);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/participants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeParticipant(id);
      if (!success) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid participant ID" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.addFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ error: "Invalid feedback data" });
    }
  });

  app.get("/api/meetings/:meetingId/feedback", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const feedback = await storage.getFeedbackByMeeting(meetingId);
      res.json(feedback);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting ID" });
    }
  });

  return httpServer;
}
