import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { Meeting, Participant } from "@shared/schema";

export function useWebSocket(roomId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [phaseTimer, setPhaseTimer] = useState(300); // 5 minutes default
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const newSocket = io({
      transports: ['websocket', 'polling']
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
      newSocket.emit("join-meeting", roomId);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    });

    newSocket.on("meeting-state", (data: { meeting: Meeting; participants: Participant[] }) => {
      setMeeting(data.meeting);
      setParticipants(data.participants);
      
      // Calculate phase timer based on phase start time
      if (data.meeting.phaseStartTime) {
        const phaseStartTime = new Date(data.meeting.phaseStartTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - phaseStartTime.getTime()) / 1000);
        const remainingTime = Math.max(300 - elapsedSeconds, 0); // 5 minutes per phase
        setPhaseTimer(remainingTime);
      }
    });

    newSocket.on("phase-updated", (data: { phase: string; phaseStartTime: Date }) => {
      setMeeting(prev => prev ? { ...prev, currentPhase: data.phase, phaseStartTime: data.phaseStartTime } : null);
      setPhaseTimer(300); // Reset timer to 5 minutes
    });

    newSocket.on("participant-updated", (participant: Participant) => {
      setParticipants(prev => 
        prev.map(p => p.id === participant.id ? participant : p)
      );
    });

    newSocket.on("timer-updated", (data: { timeRemaining: number }) => {
      setPhaseTimer(data.timeRemaining);
    });

    setSocket(newSocket);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      newSocket.close();
    };
  }, [roomId]);

  // Phase timer countdown
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setPhaseTimer(prev => {
        const newTime = Math.max(prev - 1, 0);
        
        // Sync timer with other clients occasionally
        if (socket && newTime % 10 === 0) {
          socket.emit("timer-sync", { roomId, timeRemaining: newTime });
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [socket, roomId]);

  const updatePhase = (phase: string) => {
    if (socket) {
      socket.emit("phase-change", { roomId, phase });
    }
  };

  const updateParticipantStatus = (participantId: number, status: string) => {
    if (socket) {
      socket.emit("participant-status-change", { roomId, participantId, status });
    }
  };

  return {
    socket,
    isConnected,
    meeting,
    participants,
    phaseTimer,
    updatePhase,
    updateParticipantStatus,
  };
}
