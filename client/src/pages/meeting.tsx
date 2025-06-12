import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { Users, Archive, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import VideoConference from "@/components/video-conference";
import AgendaProgress from "@/components/agenda-progress";
import ParticipantsList from "@/components/participants-list";
import FeedbackForm from "@/components/feedback-form";
import SimpleRecordingControls from "@/components/simple-recording-controls";
import type { Meeting as MeetingType, Participant } from "@shared/schema";

export default function Meeting() {
  const { roomId } = useParams();
  const { toast } = useToast();
  const [currentRoomId] = useState(roomId || "default-mastermind-room");
  const [isRecording, setIsRecording] = useState(false);

  // WebSocket connection
  const { 
    meeting, 
    participants, 
    phaseTimer, 
    updatePhase, 
    updateParticipantStatus,
    isConnected 
  } = useWebSocket(currentRoomId);

  // Fetch meeting data
  const { data: meetingData, isLoading: meetingLoading } = useQuery({
    queryKey: [`/api/meetings/room/${currentRoomId}`],
    enabled: !meeting, // Only fetch if not already received via WebSocket
  });

  // Create meeting if it doesn't exist
  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: { title: string; roomId: string }) => {
      const response = await apiRequest("POST", "/api/meetings", meetingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/meetings/room/${currentRoomId}`] });
      toast({
        title: "Meeting Created",
        description: "Your mastermind meeting has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize meeting if it doesn't exist
  useEffect(() => {
    if (!meetingLoading && !meetingData && !meeting && !createMeetingMutation.isPending) {
      createMeetingMutation.mutate({
        title: "Weekly Strategy Session",
        roomId: currentRoomId,
      });
    }
  }, [meetingData, meeting, meetingLoading, createMeetingMutation, currentRoomId]);



  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording Stopped" : "Recording Started",
      description: isRecording 
        ? "Meeting recording has been stopped." 
        : "Meeting recording has been started.",
    });
  };

  const handleEndMeeting = () => {
    if (window.confirm("Are you sure you want to end the meeting?")) {
      toast({
        title: "Meeting Ended",
        description: "The meeting has been ended successfully.",
      });
      // In a real app, this would redirect or close the meeting
    }
  };

  const currentMeeting = meeting || meetingData as MeetingType;
  const [participantsInitialized, setParticipantsInitialized] = useState(false);

  // Add participants when meeting is created (only once)
  const addParticipantsMutation = useMutation({
    mutationFn: async (participants: Array<{ name: string; meetingId: number; status?: string }>) => {
      const promises = participants.map(p => 
        apiRequest("POST", "/api/participants", p).then(res => res.json())
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      setParticipantsInitialized(true);
    },
  });

  useEffect(() => {
    if (currentMeeting?.id && participants.length === 0 && !participantsInitialized && !addParticipantsMutation.isPending) {
      // Add participants including the current user
      addParticipantsMutation.mutate([
        { name: "You", meetingId: currentMeeting.id, status: "waiting" },
        { name: "Sophie", meetingId: currentMeeting.id, status: "speaking" },
        { name: "Michael", meetingId: currentMeeting.id, status: "next" },
        { name: "Emma", meetingId: currentMeeting.id, status: "waiting" },
        { name: "Olivia", meetingId: currentMeeting.id, status: "waiting" },
      ]);
    }
  }, [currentMeeting?.id, participants.length, participantsInitialized, addParticipantsMutation]);

  if (meetingLoading || createMeetingMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-2 rounded-lg">
              <Users className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Moderation Tool for Mastermind Meetings
              </h1>
              <p className="text-sm text-gray-500">
                {currentMeeting?.title || "Weekly Strategy Session"} - Room #{currentRoomId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleRecording}
              className="flex items-center space-x-2"
            >
              <Archive className={`h-4 w-4 ${isRecording ? 'text-red-500' : 'text-gray-600'}`} />
              <span>{isRecording ? "Stop Recording" : "Archive"}</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndMeeting}
              className="flex items-center space-x-2"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End Meeting</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Conference Area */}
        <div className="flex-1 bg-gray-900 relative min-h-[400px] lg:min-h-0">
          <VideoConference roomId={currentRoomId} />
        </div>

        {/* Control Panel */}
        <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Recording Controls */}
          <div className="p-4 border-b border-gray-200">
            <SimpleRecordingControls
              meetingId={currentMeeting?.id || 1}
              isRecording={isRecording}
              onRecordingStateChange={setIsRecording}
            />
          </div>

          {/* Agenda Progress */}
          <AgendaProgress
            currentPhase={currentMeeting?.currentPhase || "check-in"}
            phaseTimer={phaseTimer}
            onPhaseChange={updatePhase}
          />

          {/* Participants Section */}
          <ParticipantsList
            participants={participants}
            meetingId={currentMeeting?.id}
            currentPhase={currentMeeting?.currentPhase || "check-in"}
            onParticipantStatusChange={updateParticipantStatus}
          />

          {/* Feedback Section */}
          <FeedbackForm
            meetingId={currentMeeting?.id}
            currentPhase={currentMeeting?.currentPhase || "check-in"}
          />
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg">
          Reconnecting...
        </div>
      )}
    </div>
  );
}
