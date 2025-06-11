import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { storage } from "./storage";

export function setupWebSocket(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-meeting", async (roomId: string) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined meeting room: ${roomId}`);
      
      // Send current meeting state
      try {
        const meeting = await storage.getMeetingByRoomId(roomId);
        if (meeting) {
          const participants = await storage.getParticipantsByMeeting(meeting.id);
          socket.emit("meeting-state", { meeting, participants });
        }
      } catch (error) {
        console.error("Error getting meeting state:", error);
      }
    });

    socket.on("leave-meeting", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Client ${socket.id} left meeting room: ${roomId}`);
    });

    socket.on("phase-change", async (data: { roomId: string, phase: string }) => {
      try {
        const meeting = await storage.getMeetingByRoomId(data.roomId);
        if (meeting) {
          const updatedMeeting = await storage.updateMeeting(meeting.id, {
            currentPhase: data.phase,
            phaseStartTime: new Date()
          });
          
          // Broadcast to all clients in the room
          io.to(data.roomId).emit("phase-updated", {
            phase: data.phase,
            phaseStartTime: updatedMeeting?.phaseStartTime
          });
        }
      } catch (error) {
        console.error("Error updating phase:", error);
      }
    });

    socket.on("participant-status-change", async (data: { roomId: string, participantId: number, status: string }) => {
      try {
        const updatedParticipant = await storage.updateParticipant(data.participantId, {
          status: data.status
        });
        
        if (updatedParticipant) {
          // Broadcast to all clients in the room
          io.to(data.roomId).emit("participant-updated", updatedParticipant);
        }
      } catch (error) {
        console.error("Error updating participant:", error);
      }
    });

    socket.on("timer-sync", (data: { roomId: string, timeRemaining: number }) => {
      // Broadcast timer state to all clients in the room
      socket.to(data.roomId).emit("timer-updated", { timeRemaining: data.timeRemaining });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}
