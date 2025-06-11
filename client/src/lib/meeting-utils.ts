export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getPhaseColor(phase: string): string {
  switch (phase) {
    case "check-in":
      return "text-secondary";
    case "hot-seat":
      return "text-primary";
    case "feedback":
      return "text-accent";
    case "action-steps":
      return "text-purple-600";
    default:
      return "text-gray-500";
  }
}

export function getPhaseLabel(phase: string): string {
  switch (phase) {
    case "check-in":
      return "Check-in";
    case "hot-seat":
      return "Hot Seat";
    case "feedback":
      return "Feedback";
    case "action-steps":
      return "Action Steps";
    default:
      return "Unknown Phase";
  }
}

export function getNextPhase(currentPhase: string): string | null {
  const phases = ["check-in", "hot-seat", "feedback", "action-steps"];
  const currentIndex = phases.indexOf(currentPhase);
  
  if (currentIndex >= 0 && currentIndex < phases.length - 1) {
    return phases[currentIndex + 1];
  }
  
  return null;
}

export function getPreviousPhase(currentPhase: string): string | null {
  const phases = ["check-in", "hot-seat", "feedback", "action-steps"];
  const currentIndex = phases.indexOf(currentPhase);
  
  if (currentIndex > 0) {
    return phases[currentIndex - 1];
  }
  
  return null;
}

export function generateMockParticipants(meetingId: number): Array<{
  name: string;
  avatar?: string;
  status: string;
  meetingId: number;
}> {
  return [
    {
      name: "Sophie",
      status: "speaking",
      meetingId,
    },
    {
      name: "Michael", 
      status: "next",
      meetingId,
    },
    {
      name: "Emma",
      status: "waiting",
      meetingId,
    },
    {
      name: "Olivia",
      status: "waiting", 
      meetingId,
    },
  ];
}
