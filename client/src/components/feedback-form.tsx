import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";

interface FeedbackFormProps {
  meetingId: number | undefined;
  currentPhase: string;
}

export default function FeedbackForm({ meetingId, currentPhase }: FeedbackFormProps) {
  const [currentActionItemIndex, setCurrentActionItemIndex] = useState(0);

  // Action items for each phase
  const phaseActionItems = {
    "check-in": [
      {
        title: "Personal Updates",
        description: "Share what's happening in your life and business since last meeting",
        actions: ["Share 1-2 key personal updates", "Mention any challenges you're facing", "Celebrate recent wins"]
      },
      {
        title: "Goal Progress Review",
        description: "Review progress on goals set in previous session",
        actions: ["Report on 30-day goal progress", "Identify obstacles encountered", "Share lessons learned"]
      }
    ],
    "hot-seat": [
      {
        title: "Problem Presentation",
        description: "Present your most pressing business challenge",
        actions: ["Clearly define the problem", "Provide relevant context", "Share what you've tried so far"]
      },
      {
        title: "Goal Setting",
        description: "Establish specific 30-day goals",
        actions: ["Set 1-3 measurable goals", "Define success criteria", "Identify potential obstacles"]
      }
    ],
    "feedback": [
      {
        title: "Constructive Feedback",
        description: "Provide thoughtful feedback on hot seat presentations",
        actions: ["Share specific observations", "Suggest actionable solutions", "Ask clarifying questions"]
      },
      {
        title: "Resource Sharing",
        description: "Share relevant resources and connections",
        actions: ["Recommend helpful tools/books", "Offer introductions to contacts", "Share similar experiences"]
      }
    ],
    "action-steps": [
      {
        title: "Commitment Creation",
        description: "Define specific next steps and accountability",
        actions: ["Write down 3-5 specific action items", "Set deadlines for each action", "Choose accountability partner"]
      },
      {
        title: "Follow-up Planning",
        description: "Plan follow-up and check-in schedule",
        actions: ["Schedule next meeting", "Set mid-week check-in", "Exchange contact information"]
      }
    ]
  };

  const currentPhaseItems = phaseActionItems[currentPhase as keyof typeof phaseActionItems] || [];
  const currentItem = currentPhaseItems[currentActionItemIndex];

  const handlePreviousItem = () => {
    setCurrentActionItemIndex(prev => 
      prev > 0 ? prev - 1 : currentPhaseItems.length - 1
    );
  };

  const handleNextItem = () => {
    setCurrentActionItemIndex(prev => 
      prev < currentPhaseItems.length - 1 ? prev + 1 : 0
    );
  };



  return (
    <div className="p-6 feedback-section">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        {currentPhase.toUpperCase().replace('-', ' ')} AGENDA
      </h3>
      
      {/* Current Action Item Display */}
      {currentItem && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-gray-900">{currentItem.title}</h4>
            </div>
            <span className="text-xs text-gray-500">
              {currentActionItemIndex + 1} of {currentPhaseItems.length}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{currentItem.description}</p>
          
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Action Items:
            </h5>
            <ul className="space-y-1">
              {currentItem.actions.map((action, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-600">{action}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Navigation Buttons */}
          {currentPhaseItems.length > 1 && (
            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousItem}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextItem}
                className="flex-1"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
      

    </div>
  );
}
