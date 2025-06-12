import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Download, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleRecordingControlsProps {
  meetingId: number;
  isRecording: boolean;
  onRecordingStateChange: (isRecording: boolean) => void;
}

export default function SimpleRecordingControls({
  meetingId,
  isRecording,
  onRecordingStateChange,
}: SimpleRecordingControlsProps) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      startTimeRef.current = new Date();
      
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
          setRecordingDuration(elapsed);
        }
      }, 1000);

      onRecordingStateChange(true);
      toast({
        title: "Recording Started",
        description: "Screen recording has begun",
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Recording Failed",
        description: "Could not start screen recording. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [onRecordingStateChange, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setMediaRecorder(null);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      onRecordingStateChange(false);
      setRecordingDuration(0);
      toast({
        title: "Recording Stopped",
        description: "Recording is ready for download",
      });
    }
  }, [mediaRecorder, onRecordingStateChange, toast]);

  const downloadRecording = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting-${meetingId}-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Recording download has begun",
      });
    }
  }, [recordedBlob, meetingId, toast]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isRecording ? (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="sm"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  variant="default"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              )}
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="animate-pulse">
                  <Mic className="w-3 h-3 mr-1" />
                  REC
                </Badge>
                <span className="text-sm font-mono">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>
          
          {recordedBlob && !isRecording && (
            <Button
              onClick={downloadRecording}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}