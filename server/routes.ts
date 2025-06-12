import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema, insertParticipantSchema, insertFeedbackSchema, insertSessionSchema, insertAgendaSchema, insertAgendaPointSchema, insertActionSchema, insertRecordingSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";
import { setupWebRTCSignaling } from "./webrtc-signaling";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  setupWebSocket(httpServer);
  // WebRTC signaling will be integrated into the existing WebSocket

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

  // Session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      // Convert string dates to Date objects before validation
      const processedBody = {
        ...req.body,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null
      };
      
      const sessionData = insertSessionSchema.parse(processedBody);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error: any) {
      console.error("Session creation error:", error);
      
      // Handle different types of errors
      if (error?.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid session data", details: error.issues });
      }
      
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        return res.status(503).json({ error: "Database connection failed", details: "Please try again later" });
      }
      
      res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Convert string dates to Date objects before update
      const processedBody = {
        ...req.body,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : req.body.scheduledAt
      };
      
      const session = await storage.updateSession(id, processedBody);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSession(id);
      if (!success) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  // Agenda routes
  app.post("/api/agendas", async (req, res) => {
    try {
      const agendaData = insertAgendaSchema.parse(req.body);
      const agenda = await storage.createAgenda(agendaData);
      res.json(agenda);
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda data" });
    }
  });

  app.get("/api/agendas", async (req, res) => {
    try {
      const agendas = await storage.getAllAgendas();
      res.json(agendas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agendas" });
    }
  });

  app.get("/api/sessions/:sessionId/agendas", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const agendas = await storage.getAgendasBySession(sessionId);
      res.json(agendas);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  app.get("/api/agendas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agenda = await storage.getAgenda(id);
      if (!agenda) {
        return res.status(404).json({ error: "Agenda not found" });
      }
      res.json(agenda);
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda ID" });
    }
  });

  app.patch("/api/agendas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agenda = await storage.updateAgenda(id, req.body);
      if (!agenda) {
        return res.status(404).json({ error: "Agenda not found" });
      }
      res.json(agenda);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/agendas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgenda(id);
      if (!success) {
        return res.status(404).json({ error: "Agenda not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda ID" });
    }
  });

  // Agenda Point routes
  app.get("/api/agenda-points", async (req, res) => {
    try {
      const agendaPoints = await storage.getAllAgendaPoints();
      res.json(agendaPoints);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agenda points" });
    }
  });

  app.post("/api/agenda-points", async (req, res) => {
    try {
      const agendaPointData = insertAgendaPointSchema.parse(req.body);
      const agendaPoint = await storage.createAgendaPoint(agendaPointData);
      res.json(agendaPoint);
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda point data" });
    }
  });

  app.get("/api/sessions/:sessionId/agenda-points", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const agendas = await storage.getAgendasBySession(sessionId);
      const agendaPoints = [];
      
      for (const agenda of agendas) {
        const points = await storage.getAgendaPointsByAgenda(agenda.id);
        agendaPoints.push(...points);
      }
      
      res.json(agendaPoints);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  app.get("/api/agendas/:agendaId/agenda-points", async (req, res) => {
    try {
      const agendaId = parseInt(req.params.agendaId);
      const agendaPoints = await storage.getAgendaPointsByAgenda(agendaId);
      res.json(agendaPoints);
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda ID" });
    }
  });

  app.get("/api/agenda-points/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agendaPoint = await storage.getAgendaPoint(id);
      if (!agendaPoint) {
        return res.status(404).json({ error: "Agenda point not found" });
      }
      res.json(agendaPoint);
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda point ID" });
    }
  });

  app.patch("/api/agenda-points/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agendaPoint = await storage.updateAgendaPoint(id, req.body);
      if (!agendaPoint) {
        return res.status(404).json({ error: "Agenda point not found" });
      }
      res.json(agendaPoint);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/agenda-points/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgendaPoint(id);
      if (!success) {
        return res.status(404).json({ error: "Agenda point not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda point ID" });
    }
  });

  // Action routes
  app.get("/api/actions", async (req, res) => {
    try {
      const actions = await storage.getAllActions();
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch actions" });
    }
  });

  app.post("/api/actions", async (req, res) => {
    try {
      const actionData = insertActionSchema.parse(req.body);
      const action = await storage.createAction(actionData);
      res.json(action);
    } catch (error) {
      res.status(400).json({ error: "Invalid action data" });
    }
  });

  app.get("/api/sessions/:sessionId/agenda-points", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const agendas = await storage.getAgendasBySession(sessionId);
      const agendaPoints = [];
      
      for (const agenda of agendas) {
        const points = await storage.getAgendaPointsByAgenda(agenda.id);
        agendaPoints.push(...points);
      }
      
      res.json(agendaPoints);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  app.get("/api/sessions/:sessionId/actions", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const agendas = await storage.getAgendasBySession(sessionId);
      const actions = [];
      
      for (const agenda of agendas) {
        const agendaPoints = await storage.getAgendaPointsByAgenda(agenda.id);
        for (const point of agendaPoints) {
          const pointActions = await storage.getActionsByAgendaPoint(point.id);
          actions.push(...pointActions);
        }
      }
      
      res.json(actions);
    } catch (error) {
      res.status(400).json({ error: "Invalid session ID" });
    }
  });

  app.get("/api/agenda-points/:agendaPointId/actions", async (req, res) => {
    try {
      const agendaPointId = parseInt(req.params.agendaPointId);
      const actions = await storage.getActionsByAgendaPoint(agendaPointId);
      res.json(actions);
    } catch (error) {
      res.status(400).json({ error: "Invalid agenda point ID" });
    }
  });

  app.get("/api/actions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const action = await storage.getAction(id);
      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }
      res.json(action);
    } catch (error) {
      res.status(400).json({ error: "Invalid action ID" });
    }
  });

  app.patch("/api/actions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const action = await storage.updateAction(id, req.body);
      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }
      res.json(action);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/actions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAction(id);
      if (!success) {
        return res.status(404).json({ error: "Action not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid action ID" });
    }
  });

  // Recording routes
  app.post("/api/recordings", async (req, res) => {
    try {
      const recordingData = insertRecordingSchema.parse(req.body);
      const recording = await storage.createRecording(recordingData);
      res.json(recording);
    } catch (error) {
      res.status(400).json({ error: "Invalid recording data" });
    }
  });

  app.get("/api/meetings/:meetingId/recordings", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const recordings = await storage.getRecordingsByMeeting(meetingId);
      res.json(recordings);
    } catch (error) {
      res.status(400).json({ error: "Invalid meeting ID" });
    }
  });

  app.get("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recording = await storage.getRecording(id);
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(400).json({ error: "Invalid recording ID" });
    }
  });

  app.patch("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recording = await storage.updateRecording(id, req.body);
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/recordings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRecording(id);
      if (!success) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid recording ID" });
    }
  });

  return httpServer;
}
