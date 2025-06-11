import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoConferenceProps {
  roomId: string;
}

export default function VideoConference({ roomId }: VideoConferenceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would interact with the Jitsi API
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In a real implementation, this would interact with the Jitsi API
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In a real implementation, this would interact with the Jitsi API
  };

  return (
    <div className="relative w-full h-full">
      {/* Jitsi Meet Iframe */}
      <iframe
        src={`https://meet.jit.si/${roomId}`}
        className="w-full h-full border-0"
        allow="camera; microphone; fullscreen; display-capture"
        allowFullScreen
        title="Video Conference"
      />

      {/* Video Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 video-controls-overlay rounded-lg px-4 py-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleMute}
          className={`p-2 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleVideo}
          className={`p-2 rounded-full transition-colors ${
            isVideoOff 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleScreenShare}
          className={`p-2 rounded-full transition-colors ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
