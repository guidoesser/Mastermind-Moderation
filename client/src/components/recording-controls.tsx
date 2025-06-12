import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Download, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RecordingControlsProps {
  meetingId: number;
  isRecording: boolean;
  onRecordingStateChange: (isRecording: boolean) => void;
}

export default function RecordingControls({
  meetingId,
  isRecording,
  onRecordingStateChange,
}: RecordingControlsProps) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
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

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedChunks([blob]);
        await saveRecording(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordedChunks([]);
      startTimeRef.current = new Date();
      
      // Start duration timer
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
  }, [meetingId, onRecordingStateChange, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setMediaRecorder(null);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      onRecordingStateChange(false);
      toast({
        title: "Recording Stopped",
        description: "Processing recording...",
      });
    }
  }, [mediaRecorder, onRecordingStateChange, toast]);

  const saveRecording = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const endTime = new Date();
      const duration = startTimeRef.current 
        ? Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000)
        : 0;

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `meeting-${meetingId}-${timestamp}.webm`;
      
      // Create recording metadata
      const recordingData = {
        meetingId,
        fileName,
        filePath: `/recordings/${fileName}`,
        fileSize: blob.size,
        duration,
        format: "webm",
        status: "ready",
        startedAt: startTimeRef.current?.toISOString() || new Date().toISOString(),
        endedAt: endTime.toISOString(),
      };

      await apiRequest("/api/recordings", {
        method: "POST",
        body: JSON.stringify(recordingData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Recording Saved",
        description: `Recording saved as ${fileName}`,
      });
    } catch (error) {
      console.error("Failed to save recording:", error);
      toast({
        title: "Save Failed",
        description: "Could not save recording metadata",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  const downloadRecording = useCallback(() => {
    if (recordedChunks.length > 0) {
      const blob = recordedChunks[0];
      const url = URL.createObjectURL(blob);
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
  }, [recordedChunks, meetingId, toast]);

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
                  disabled={isProcessing}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  variant="default"
                  size="sm"
                  disabled={isProcessing}
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
            
            {isProcessing && (
              <Badge variant="secondary">
                Processing...
              </Badge>
            )}
          </div>
          
          {recordedChunks.length > 0 && !isRecording && (
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