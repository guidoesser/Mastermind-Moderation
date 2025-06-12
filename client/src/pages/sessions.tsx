import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Plus, Calendar, Users, FileText, CheckSquare, Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSessionSchema, type Session, type InsertSession } from "@shared/schema";

// Utility function to handle datetime conversion for local input
function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  // Convert to local timezone for display
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
}

export default function SessionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Fetch all sessions
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: InsertSession) => {
      const response = await apiRequest("/api/sessions", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Session Created",
        description: "New session has been created successfully"
      });
    },
    onError: (error) => {
      console.error("Failed to create session:", error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive"
      });
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Session> }) => {
      const response = await apiRequest(`/api/sessions/${id}`, "PATCH", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setEditingSession(null);
      toast({
        title: "Session Updated",
        description: "Session has been updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive"
      });
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/sessions/${id}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session Deleted",
        description: "Session has been deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  });

  // Form for creating/editing sessions
  const form = useForm<InsertSession>({
    resolver: zodResolver(insertSessionSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledAt: new Date()
    }
  });

  const onSubmit = (data: InsertSession) => {
    // Prevent double submission
    if (createSessionMutation.isPending || updateSessionMutation.isPending) {
      return;
    }
    
    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data });
    } else {
      createSessionMutation.mutate(data);
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    form.reset({
      title: session.title,
      description: session.description || "",
      scheduledAt: session.scheduledAt || new Date()
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this session? This will also delete all associated agendas, agenda points, and actions.")) {
      deleteSessionMutation.mutate(id);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not scheduled";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mastermind sessions, agendas, and action items
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Create a new mastermind session with agenda items and scheduling.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter session title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter session description" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          value={formatDateForInput(field.value || null)}
                          onChange={(e) => {
                            if (e.target.value) {
                              field.onChange(new Date(e.target.value));
                            } else {
                              field.onChange(null);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                    className="flex-1"
                  >
                    {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions Grid */}
      {sessions?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first session to start organizing your mastermind meetings
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions?.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{session.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.scheduledAt)}
                    </div>
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {session.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Agendas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-4 h-4 text-muted-foreground" />
                      <span>Actions</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm" className="flex-1">
                    <Link href={`/sessions/${session.id}`}>
                      <ChevronRight className="w-4 h-4 mr-1" />
                      Manage
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(session)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(session.id)}
                    disabled={deleteSessionMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Session Dialog */}
      <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update the session details, schedule, and description.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter session title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter session description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        value={formatDateForInput(field.value || null)}
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value));
                          } else {
                            field.onChange(null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateSessionMutation.isPending || createSessionMutation.isPending}
                  className="flex-1"
                >
                  {updateSessionMutation.isPending ? "Updating..." : "Update Session"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSession(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}