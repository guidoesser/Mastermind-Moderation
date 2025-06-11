import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FeedbackFormProps {
  meetingId: number | undefined;
  currentPhase: string;
}

export default function FeedbackForm({ meetingId, currentPhase }: FeedbackFormProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState({
    whatWentWell: "",
    challenges: "",
    actionItems: "",
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const response = await apiRequest("POST", "/api/feedback", feedbackData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      setFeedback({
        whatWentWell: "",
        challenges: "",
        actionItems: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingId) {
      toast({
        title: "Error",
        description: "Meeting not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll use a mock participant ID
    // In a real app, this would come from user authentication
    const mockParticipantId = 1;

    submitFeedbackMutation.mutate({
      meetingId,
      participantId: mockParticipantId,
      phase: currentPhase,
      ...feedback,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-6 feedback-section">
      <h3 className="text-base font-semibold text-gray-900 mb-4">FEEDBACK</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="whatWentWell" className="text-sm font-medium text-gray-700 mb-2">
            What went well
          </Label>
          <Textarea
            id="whatWentWell"
            placeholder="Share positive observations..."
            value={feedback.whatWentWell}
            onChange={(e) => handleInputChange("whatWentWell", e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="challenges" className="text-sm font-medium text-gray-700 mb-2">
            What was challenging
          </Label>
          <Textarea
            id="challenges"
            placeholder="Identify areas for improvement..."
            value={feedback.challenges}
            onChange={(e) => handleInputChange("challenges", e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="actionItems" className="text-sm font-medium text-gray-700 mb-2">
            What you can do
          </Label>
          <Textarea
            id="actionItems"
            placeholder="Suggest actionable next steps..."
            value={feedback.actionItems}
            onChange={(e) => handleInputChange("actionItems", e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={submitFeedbackMutation.isPending}
        >
          {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </div>
  );
}
