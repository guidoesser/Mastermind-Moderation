import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface Participant {
  id: string;
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
}

interface UseWebRTCProps {
  roomId: string;
  participantName: string;
}

export function useWebRTC({ roomId, participantName }: UseWebRTCProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string, MediaStream>>(new Map());

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("join-room", { roomId, participantName });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Handle room joined
    newSocket.on("room-joined", ({ participants: existingParticipants }) => {
      setParticipants(existingParticipants);
      // Create peer connections for existing participants
      existingParticipants.forEach((participant: Participant) => {
        createPeerConnection(participant.id, true);
      });
    });

    // Handle new participant joined
    newSocket.on("participant-joined", (participant: Participant) => {
      setParticipants(prev => [...prev, participant]);
      createPeerConnection(participant.id, false);
    });

    // Handle participant left
    newSocket.on("participant-left", ({ participantId }) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      const pc = peerConnections.current.get(participantId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(participantId);
      }
      remoteStreams.current.delete(participantId);
    });

    // Handle media state updates
    newSocket.on("participant-media-updated", ({ participantId, audioEnabled, videoEnabled, isScreenSharing }) => {
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, audioEnabled, videoEnabled, isScreenSharing }
            : p
        )
      );
    });

    // WebRTC signaling handlers
    newSocket.on("webrtc-offer", handleWebRTCOffer);
    newSocket.on("webrtc-answer", handleWebRTCAnswer);
    newSocket.on("webrtc-ice-candidate", handleWebRTCIceCandidate);

    return () => {
      newSocket.disconnect();
      // Close all peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
    };
  }, [roomId, participantName]);

  // Create peer connection
  const createPeerConnection = useCallback((participantId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.current.set(participantId, pc);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      remoteStreams.current.set(participantId, remoteStream);
      
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, stream: remoteStream }
            : p
        )
      );
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc-ice-candidate", {
          targetId: participantId,
          candidate: event.candidate,
        });
      }
    };

    // If we're the initiator, create offer
    if (isInitiator) {
      pc.createOffer()
        .then(offer => {
          pc.setLocalDescription(offer);
          socket?.emit("webrtc-offer", {
            targetId: participantId,
            offer,
          });
        })
        .catch(console.error);
    }

    return pc;
  }, [localStream, socket]);

  // Handle WebRTC offer
  const handleWebRTCOffer = useCallback(async ({ fromId, offer }: { fromId: string; offer: RTCSessionDescriptionInit }) => {
    let pc = peerConnections.current.get(fromId);
    if (!pc) {
      pc = createPeerConnection(fromId, false);
    }

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket?.emit("webrtc-answer", {
      targetId: fromId,
      answer,
    });
  }, [createPeerConnection, socket]);

  // Handle WebRTC answer
  const handleWebRTCAnswer = useCallback(async ({ fromId, answer }: { fromId: string; answer: RTCSessionDescriptionInit }) => {
    const pc = peerConnections.current.get(fromId);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }, []);

  // Handle ICE candidate
  const handleWebRTCIceCandidate = useCallback(async ({ fromId, candidate }: { fromId: string; candidate: RTCIceCandidateInit }) => {
    const pc = peerConnections.current.get(fromId);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  }, []);

  // Initialize local media
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      
      setLocalStream(stream);
      
      // Add tracks to existing peer connections
      peerConnections.current.forEach(pc => {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });
      
      return stream;
    } catch (error) {
      console.error("Failed to access media devices:", error);
      throw error;
    }
  }, []);

  // Update media state
  const updateMediaState = useCallback((audioEnabled: boolean, videoEnabled: boolean, isScreenSharing: boolean) => {
    socket?.emit("update-media-state", {
      audioEnabled,
      videoEnabled,
      isScreenSharing,
    });
  }, [socket]);

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      updateMediaState(enabled, localStream.getVideoTracks()[0]?.enabled || false, false);
    }
  }, [localStream, updateMediaState]);

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      updateMediaState(localStream.getAudioTracks()[0]?.enabled || false, enabled, false);
    }
  }, [localStream, updateMediaState]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };

      updateMediaState(localStream?.getAudioTracks()[0]?.enabled || false, true, true);
      return screenStream;
    } catch (error) {
      console.error("Failed to start screen sharing:", error);
      throw error;
    }
  }, [localStream, updateMediaState]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      
      // Replace screen share with camera in all peer connections
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });

      updateMediaState(localStream.getAudioTracks()[0]?.enabled || false, true, false);
    }
  }, [localStream, updateMediaState]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    
    socket?.disconnect();
    setIsConnected(false);
    setParticipants([]);
  }, [localStream, socket]);

  return {
    participants,
    localStream,
    isConnected,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    disconnect,
  };
}