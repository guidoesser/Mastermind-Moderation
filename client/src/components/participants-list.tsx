import { ArrowUp, Plus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Participant } from "@shared/schema";

interface ParticipantsListProps {
  participants: Participant[];
  meetingId: number | undefined;
  currentPhase: string;
  onParticipantStatusChange: (participantId: number, status: string) => void;
}

export default function ParticipantsList({
  participants,
  meetingId,
  currentPhase,
  onParticipantStatusChange,
}: ParticipantsListProps) {
  const currentSpeaker = participants.find(p => p.status === "speaking");
  const nextSpeaker = participants.find(p => p.status === "next");
  const waitingParticipants = participants.filter(p => p.status === "waiting");

  const handleMakeNextSpeaker = (participantId: number) => {
    // Clear current "next" status
    if (nextSpeaker) {
      onParticipantStatusChange(nextSpeaker.id, "waiting");
    }
    // Set new next speaker
    onParticipantStatusChange(participantId, "next");
  };

  const handleAddToQueue = (participantId: number) => {
    onParticipantStatusChange(participantId, "next");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-6 border-b border-gray-200 flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">PARTICIPANTS</h3>
        <span className="text-sm text-gray-500">{participants.length}</span>
      </div>

      {/* Current Hot Seat */}
      {currentSpeaker && (
        <div className="mb-4 p-3 hot-seat-indicator rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 participant-avatar speaking">
                <AvatarImage src={currentSpeaker.avatar || undefined} />
                <AvatarFallback>{getInitials(currentSpeaker.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {currentSpeaker.name}
                  </span>
                  <Badge className="bg-primary text-white text-xs">Hot Seat</Badge>
                </div>
              </div>
            </div>
            <Mic className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}

      {/* Other Participants */}
      <div className="space-y-2">
        {/* Next Speaker */}
        {nextSpeaker && (
          <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Avatar className="w-7 h-7 participant-avatar next">
                <AvatarImage src={nextSpeaker.avatar || undefined} />
                <AvatarFallback>{getInitials(nextSpeaker.name)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {nextSpeaker.name}
                </span>
                <div className="flex items-center space-x-1">
                  <Badge className="next-turn-badge text-xs">Next Turn</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onParticipantStatusChange(nextSpeaker.id, "waiting")}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Waiting Participants */}
        {waitingParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-7 h-7 participant-avatar">
                <AvatarImage src={participant.avatar || undefined} />
                <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {participant.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddToQueue(participant.id)}
              className="text-gray-400 hover:text-primary p-1"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No participants yet</p>
          <p className="text-xs mt-1">Participants will appear here when they join the meeting</p>
        </div>
      )}
    </div>
  );
}
