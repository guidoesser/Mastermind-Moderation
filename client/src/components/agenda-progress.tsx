import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/meeting-utils";
import { MEETING_PHASES } from "@shared/schema";

interface AgendaProgressProps {
  currentPhase: string;
  phaseTimer: number;
  onPhaseChange: (phase: string) => void;
}

export default function AgendaProgress({
  currentPhase,
  phaseTimer,
  onPhaseChange,
}: AgendaProgressProps) {
  const phases = [
    { id: "check-in", label: "Check-in" },
    { id: "hot-seat", label: "Hot Seat" },
    { id: "feedback", label: "Feedback" },
    { id: "action-steps", label: "Action Steps" },
  ];

  const currentPhaseIndex = phases.findIndex(phase => phase.id === currentPhase);

  const handlePreviousPhase = () => {
    if (currentPhaseIndex > 0) {
      onPhaseChange(phases[currentPhaseIndex - 1].id);
    }
  };

  const handleNextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      onPhaseChange(phases[currentPhaseIndex + 1].id);
    }
  };

  const getPhaseStatus = (index: number) => {
    if (index < currentPhaseIndex) return "completed";
    if (index === currentPhaseIndex) return "active";
    return "pending";
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">AGENDA</h2>
        <div className="flex items-center space-x-2 timer-display px-3 py-1 rounded-full">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{formatTime(phaseTimer)}</span>
        </div>
      </div>

      {/* Phase Progress Bar */}
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(index);
          return (
            <div key={phase.id} className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full phase-indicator ${
                  status === "completed"
                    ? "phase-completed"
                    : status === "active"
                    ? "phase-active"
                    : "phase-pending"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  status === "active"
                    ? "text-primary"
                    : status === "completed"
                    ? "text-secondary"
                    : "text-gray-500"
                }`}
              >
                {phase.label}
              </span>
              <div
                className={`flex-1 h-1 rounded-full ${
                  status === "completed"
                    ? "bg-secondary"
                    : status === "active"
                    ? "bg-primary"
                    : "bg-gray-200"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Phase Controls */}
      <div className="flex space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPhase}
          disabled={currentPhaseIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          size="sm"
          onClick={handleNextPhase}
          disabled={currentPhaseIndex === phases.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
