import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Phone,
  Settings,
  Users,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebRTC } from "@/hooks/use-webrtc";

interface VideoConferenceProps {
  roomId: string;
}

export default function VideoConference({ roomId }: VideoConferenceProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const { toast } = useToast();

  // Use WebRTC hook for real peer-to-peer connections
  const {
    participants,
    localStream,
    isConnected,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    disconnect,
  } = useWebRTC({
    roomId,
    participantName: "You",
  });

  // Handle media controls
  const handleToggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    toggleAudio(newState);
    
    toast({
      title: newState ? "Microphone Unmuted" : "Microphone Muted",
      description: newState ? "Your microphone is now on" : "Your microphone is now off"
    });
  };

  const handleToggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    toggleVideo(newState);
    
    toast({
      title: newState ? "Camera On" : "Camera Off",
      description: newState ? "Your camera is now on" : "Your camera is now off"
    });
  };

  const handleStartScreenShare = async () => {
    try {
      await startScreenShare();
      setIsScreenSharing(true);
      toast({
        title: "Screen Sharing Started",
        description: "You are now sharing your screen"
      });
    } catch (error) {
      toast({
        title: "Screen Share Failed",
        description: "Could not start screen sharing",
        variant: "destructive"
      });
    }
  };

  const handleStopScreenShare = async () => {
    try {
      await stopScreenShare();
      setIsScreenSharing(false);
      toast({
        title: "Screen Sharing Stopped",
        description: "Switched back to camera"
      });
    } catch (error) {
      console.error("Failed to stop screen sharing:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Disconnected",
      description: "Left the video conference"
    });
  };

  // Initialize media on component mount
  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  // Update local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 p-2 flex flex-col">
        {/* Primary Video Display */}
        <div className="flex-1 mb-2">
          <Card className="w-full h-full relative overflow-hidden bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12" />
                  </div>
                  <p className="text-xl font-medium">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge variant="secondary" className="bg-black/70 text-white px-3 py-1">
                <span className="font-medium">You</span>
              </Badge>
              {!isAudioEnabled && (
                <Badge variant="destructive" className="bg-red-500/90 px-2 py-1">
                  <MicOff className="w-4 h-4 mr-1" />
                  Muted
                </Badge>
              )}
              {isScreenSharing && (
                <Badge variant="default" className="bg-blue-500/90 px-2 py-1">
                  <Monitor className="w-4 h-4 mr-1" />
                  Sharing
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Participant Thumbnails */}
        {participants.length > 0 && (
          <div className="h-20 flex gap-2 overflow-x-auto">
            {participants.map((participant) => (
              <Card key={participant.id} className="w-28 h-full relative overflow-hidden bg-black flex-shrink-0">
                {participant.videoEnabled ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {participant.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <User className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs truncate px-1">{participant.name.split(' ')[0]}</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <Badge variant="secondary" className="bg-black/70 text-white text-xs px-1">
                    {participant.name.split(' ')[0]}
                  </Badge>
                </div>
                <div className="absolute top-1 right-1 flex gap-1">
                  {!participant.audioEnabled && (
                    <MicOff className="w-3 h-3 text-red-400" />
                  )}
                  {participant.isScreenSharing && (
                    <Monitor className="w-3 h-3 text-blue-400" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <Button
          onClick={handleToggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          onClick={handleToggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          onClick={isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
          variant={isScreenSharing ? "default" : "outline"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </Button>

        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant={isMuted ? "destructive" : "outline"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>

        <div className="mx-4 h-8 w-px bg-gray-600" />

        <div className="flex items-center gap-2 text-white">
          <Users className="w-4 h-4" />
          <span>{participants.length + 1}</span>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleDisconnect}
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
}
