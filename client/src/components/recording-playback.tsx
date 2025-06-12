import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Trash2, Calendar, Clock, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Recording } from "@shared/schema";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "N/A";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface RecordingPlaybackProps {
  meetingId: number;
}

export default function RecordingPlayback({ meetingId }: RecordingPlaybackProps) {
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recordings = [], isLoading, refetch } = useQuery({
    queryKey: ["recordings", meetingId],
    queryFn: async (): Promise<Recording[]> => {
      const response = await apiRequest(`/api/meetings/${meetingId}/recordings`, "GET");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (recordingId: number) => {
      const response = await apiRequest(`/api/recordings/${recordingId}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordings", meetingId] });
      toast({
        title: "Recording Deleted",
        description: "Recording has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete recording",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const handleDownload = async (recording: Recording) => {
    try {
      // In a real application, you would fetch the actual file from storage
      toast({
        title: "Download Started",
        description: `Downloading ${recording.fileName}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download recording",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (recording: Recording) => {
    try {
      await apiRequest(`/api/recordings/${recording.id}`, "DELETE");
      
      toast({
        title: "Recording Deleted",
        description: `${recording.fileName} has been deleted`,
      });
      
      refetch();
      if (selectedRecording?.id === recording.id) {
        setSelectedRecording(null);
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete recording",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "processing":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Meeting Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading recordings...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Meeting Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recordings available for this meeting
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Meeting Recordings ({recordings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recordings.map((recording: Recording) => (
              <div
                key={recording.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRecording?.id === recording.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedRecording(recording)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{recording.fileName}</h3>
                      <Badge variant={getStatusColor(recording.status)}>
                        {recording.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(recording.startedAt as any)}
                      </div>
                      
                      {recording.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(recording.duration)}
                        </div>
                      )}
                      
                      {recording.fileSize && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-4 h-4" />
                          {formatFileSize(recording.fileSize)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecording(recording);
                      }}
                      variant="outline"
                      size="sm"
                      disabled={recording.status !== "ready"}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(recording);
                      }}
                      variant="outline"
                      size="sm"
                      disabled={recording.status !== "ready"}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recording);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRecording && selectedRecording.status === "ready" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Video Player</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {/* In a real application, you would load the actual video file */}
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Video player would display {selectedRecording.fileName}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Duration: {selectedRecording.duration ? formatDuration(selectedRecording.duration) : "Unknown"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{selectedRecording.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Recorded on {formatDate(selectedRecording.startedAt)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload(selectedRecording)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}