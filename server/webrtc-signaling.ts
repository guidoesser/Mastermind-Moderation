import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

interface Participant {
  id: string;
  name: string;
  roomId: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
}

interface Room {
  id: string;
  participants: Map<string, Participant>;
}

export function setupWebRTCSignaling(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map<string, Room>();

  io.on("connection", (socket) => {
    console.log("WebRTC client connected:", socket.id);

    // Join a video conference room
    socket.on("join-room", ({ roomId, participantName }) => {
      // Leave any existing room first
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
          const existingRoom = rooms.get(room);
          if (existingRoom) {
            existingRoom.participants.delete(socket.id);
            socket.to(room).emit("participant-left", { participantId: socket.id });
          }
        }
      });

      // Join the new room
      socket.join(roomId);

      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: new Map()
        });
      }

      const room = rooms.get(roomId)!;
      const participant: Participant = {
        id: socket.id,
        name: participantName || `Participant ${socket.id.slice(0, 6)}`,
        roomId,
        audioEnabled: true,
        videoEnabled: true,
        isScreenSharing: false
      };

      room.participants.set(socket.id, participant);

      // Notify existing participants about the new participant
      socket.to(roomId).emit("participant-joined", participant);

      // Send existing participants to the new participant
      const existingParticipants = Array.from(room.participants.values())
        .filter(p => p.id !== socket.id);
      
      socket.emit("room-joined", {
        roomId,
        participants: existingParticipants
      });

      console.log(`Participant ${participant.name} joined room ${roomId}`);
    });

    // WebRTC signaling: offer
    socket.on("webrtc-offer", ({ targetId, offer }) => {
      socket.to(targetId).emit("webrtc-offer", {
        fromId: socket.id,
        offer
      });
    });

    // WebRTC signaling: answer
    socket.on("webrtc-answer", ({ targetId, answer }) => {
      socket.to(targetId).emit("webrtc-answer", {
        fromId: socket.id,
        answer
      });
    });

    // WebRTC signaling: ICE candidate
    socket.on("webrtc-ice-candidate", ({ targetId, candidate }) => {
      socket.to(targetId).emit("webrtc-ice-candidate", {
        fromId: socket.id,
        candidate
      });
    });

    // Update participant media state
    socket.on("update-media-state", ({ audioEnabled, videoEnabled, isScreenSharing }) => {
      const roomId = Array.from(socket.rooms).find(room => room !== socket.id);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room && room.participants.has(socket.id)) {
          const participant = room.participants.get(socket.id)!;
          participant.audioEnabled = audioEnabled;
          participant.videoEnabled = videoEnabled;
          participant.isScreenSharing = isScreenSharing;

          // Broadcast the update to other participants
          socket.to(roomId).emit("participant-media-updated", {
            participantId: socket.id,
            audioEnabled,
            videoEnabled,
            isScreenSharing
          });
        }
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("WebRTC client disconnected:", socket.id);

      // Remove from all rooms
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          const room = rooms.get(roomId);
          if (room) {
            room.participants.delete(socket.id);
            socket.to(roomId).emit("participant-left", { participantId: socket.id });

            // Clean up empty rooms
            if (room.participants.size === 0) {
              rooms.delete(roomId);
            }
          }
        }
      });
    });

    // Request to get room participants
    socket.on("get-room-participants", (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        const participants = Array.from(room.participants.values());
        socket.emit("room-participants", { roomId, participants });
      } else {
        socket.emit("room-participants", { roomId, participants: [] });
      }
    });
  });

  return io;
}