import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { 
  ArrowLeft, Plus, Edit, Trash2, ChevronDown, ChevronRight, 
  FileText, Target, CheckSquare, Clock, User, Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  insertAgendaSchema, insertAgendaPointSchema, insertActionSchema,
  type Session, type Agenda, type AgendaPoint, type Action,
  type InsertAgenda, type InsertAgendaPoint, type InsertAction
} from "@shared/schema";

export default function SessionDetailPage() {
  const [, params] = useRoute("/sessions/:id");
  const sessionId = params?.id ? parseInt(params.id) : null;
  
  const [expandedAgendas, setExpandedAgendas] = useState<Set<number>>(new Set());
  const [expandedPoints, setExpandedPoints] = useState<Set<number>>(new Set());
  const [isCreateAgendaOpen, setIsCreateAgendaOpen] = useState(false);
  const [createPointForAgenda, setCreatePointForAgenda] = useState<number | null>(null);
  const [createActionForPoint, setCreateActionForPoint] = useState<number | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [editingPoint, setEditingPoint] = useState<AgendaPoint | null>(null);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  
  const { toast } = useToast();

  // Fetch session details
  const { data: session } = useQuery<Session>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId
  });

  // Fetch agendas for this session
  const { data: agendas, isLoading } = useQuery<Agenda[]>({
    queryKey: ["/api/sessions", sessionId, "agendas"],
    enabled: !!sessionId
  });

  // Fetch agenda points for all agendas
  const { data: allAgendaPoints } = useQuery<AgendaPoint[]>({
    queryKey: ["/api/agenda-points"],
    enabled: !!sessionId
  });

  // Fetch all actions
  const { data: allActions } = useQuery<Action[]>({
    queryKey: ["/api/actions"],
    enabled: !!sessionId
  });

  // Create mutations
  const createAgendaMutation = useMutation({
    mutationFn: (data: InsertAgenda) => apiRequest("/api/agendas", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "agendas"] });
      setIsCreateAgendaOpen(false);
      toast({ title: "Agenda Created", description: "New agenda has been created successfully" });
    }
  });

  const createAgendaPointMutation = useMutation({
    mutationFn: (data: InsertAgendaPoint) => apiRequest("/api/agenda-points", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-points"] });
      setCreatePointForAgenda(null);
      toast({ title: "Agenda Point Created", description: "New agenda point has been created successfully" });
    }
  });

  const createActionMutation = useMutation({
    mutationFn: (data: InsertAction) => apiRequest("/api/actions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] });
      setCreateActionForPoint(null);
      toast({ title: "Action Created", description: "New action has been created successfully" });
    }
  });

  // Update mutations
  const updateAgendaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Agenda> }) => 
      apiRequest(`/api/agendas/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "agendas"] });
      setEditingAgenda(null);
      toast({ title: "Agenda Updated", description: "Agenda has been updated successfully" });
    }
  });

  const updateAgendaPointMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AgendaPoint> }) => 
      apiRequest(`/api/agenda-points/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-points"] });
      setEditingPoint(null);
      toast({ title: "Agenda Point Updated", description: "Agenda point has been updated successfully" });
    }
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Action> }) => 
      apiRequest(`/api/actions/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] });
      setEditingAction(null);
      toast({ title: "Action Updated", description: "Action has been updated successfully" });
    }
  });

  // Delete mutations
  const deleteAgendaMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/agendas/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "agendas"] });
      toast({ title: "Agenda Deleted", description: "Agenda has been deleted successfully" });
    }
  });

  const deleteAgendaPointMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/agenda-points/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-points"] });
      toast({ title: "Agenda Point Deleted", description: "Agenda point has been deleted successfully" });
    }
  });

  const deleteActionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/actions/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] });
      toast({ title: "Action Deleted", description: "Action has been deleted successfully" });
    }
  });

  // Forms
  const agendaForm = useForm<InsertAgenda>({
    resolver: zodResolver(insertAgendaSchema),
    defaultValues: { title: "", description: "", sessionId: sessionId || 0 }
  });

  const agendaPointForm = useForm<InsertAgendaPoint>({
    resolver: zodResolver(insertAgendaPointSchema),
    defaultValues: { title: "", description: "", agendaId: 0 }
  });

  const actionForm = useForm<InsertAction>({
    resolver: zodResolver(insertActionSchema),
    defaultValues: { 
      title: "", 
      description: "", 
      agendaPointId: 0, 
      assignedTo: "", 
      status: "pending",
      priority: "medium"
    }
  });

  // Helper functions
  const toggleAgenda = (agendaId: number) => {
    const newExpanded = new Set(expandedAgendas);
    if (newExpanded.has(agendaId)) {
      newExpanded.delete(agendaId);
    } else {
      newExpanded.add(agendaId);
    }
    setExpandedAgendas(newExpanded);
  };

  const togglePoint = (pointId: number) => {
    const newExpanded = new Set(expandedPoints);
    if (newExpanded.has(pointId)) {
      newExpanded.delete(pointId);
    } else {
      newExpanded.add(pointId);
    }
    setExpandedPoints(newExpanded);
  };

  const getAgendaPoints = (agendaId: number) => {
    return allAgendaPoints?.filter(point => point.agendaId === agendaId) || [];
  };

  const getPointActions = (pointId: number) => {
    return allActions?.filter(action => action.agendaPointId === pointId) || [];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(date));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "default";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  if (!sessionId || !session) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <Button asChild>
            <Link href="/sessions">Back to Sessions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sessions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{session.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(session.scheduledAt)}
            </div>
            <Badge variant={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
        </div>
        
        <Dialog open={isCreateAgendaOpen} onOpenChange={setIsCreateAgendaOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Agenda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agenda</DialogTitle>
              <DialogDescription>
                Add a new agenda item to organize your session topics and discussions.
              </DialogDescription>
            </DialogHeader>
            <Form {...agendaForm}>
              <form onSubmit={agendaForm.handleSubmit((data) => createAgendaMutation.mutate({ ...data, sessionId }))} className="space-y-4">
                <FormField
                  control={agendaForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agenda Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter agenda title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={agendaForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter agenda description" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createAgendaMutation.isPending} className="flex-1">
                    {createAgendaMutation.isPending ? "Creating..." : "Create Agenda"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateAgendaOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {session.description && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{session.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Agendas */}
      {isLoading ? (
        <div className="text-center py-8">Loading agendas...</div>
      ) : agendas?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Agendas Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first agenda to structure this session
            </p>
            <Button onClick={() => setIsCreateAgendaOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Agenda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agendas?.map((agenda) => {
            const agendaPoints = getAgendaPoints(agenda.id);
            const isExpanded = expandedAgendas.has(agenda.id);
            
            return (
              <Card key={agenda.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleAgenda(agenda.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? 
                            <ChevronDown className="w-5 h-5" /> : 
                            <ChevronRight className="w-5 h-5" />
                          }
                          <div>
                            <CardTitle className="text-lg">{agenda.title}</CardTitle>
                            {agenda.description && (
                              <p className="text-sm text-muted-foreground mt-1">{agenda.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {agendaPoints.length} {agendaPoints.length === 1 ? 'point' : 'points'}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            setEditingAgenda(agenda);
                            agendaForm.reset(agenda);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Delete this agenda and all its points and actions?")) {
                              deleteAgendaMutation.mutate(agenda.id);
                            }
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Agenda Points */}
                        {agendaPoints.map((point) => {
                          const pointActions = getPointActions(point.id);
                          const isPointExpanded = expandedPoints.has(point.id);
                          
                          return (
                            <Card key={point.id} className="ml-4">
                              <Collapsible open={isPointExpanded} onOpenChange={() => togglePoint(point.id)}>
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="cursor-pointer hover:bg-muted/50 py-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {isPointExpanded ? 
                                          <ChevronDown className="w-4 h-4" /> : 
                                          <ChevronRight className="w-4 h-4" />
                                        }
                                        <div>
                                          <CardTitle className="text-base">{point.title}</CardTitle>
                                          {point.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{point.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                          {pointActions.length} {pointActions.length === 1 ? 'action' : 'actions'}
                                        </Badge>
                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingPoint(point);
                                          agendaPointForm.reset(point);
                                        }}>
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                          e.stopPropagation();
                                          if (window.confirm("Delete this agenda point and all its actions?")) {
                                            deleteAgendaPointMutation.mutate(point.id);
                                          }
                                        }}>
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <CardContent className="pt-0">
                                    {/* Actions */}
                                    <div className="space-y-2">
                                      {pointActions.map((action) => (
                                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg ml-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                              <h4 className="font-medium">{action.title}</h4>
                                              <Badge variant={getPriorityColor(action.priority)}>
                                                {action.priority}
                                              </Badge>
                                              <Badge variant={getStatusColor(action.status)}>
                                                {action.status}
                                              </Badge>
                                            </div>
                                            {action.description && (
                                              <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                              {action.assignedTo && (
                                                <div className="flex items-center gap-1">
                                                  <User className="w-3 h-3" />
                                                  {action.assignedTo}
                                                </div>
                                              )}
                                              {action.dueDate && (
                                                <div className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  Due: {formatDate(action.dueDate)}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                              setEditingAction(action);
                                              actionForm.reset(action);
                                            }}>
                                              <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                              if (window.confirm("Delete this action?")) {
                                                deleteActionMutation.mutate(action.id);
                                              }
                                            }}>
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                      
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="ml-4"
                                        onClick={() => {
                                          setCreateActionForPoint(point.id);
                                          actionForm.reset({ 
                                            title: "", 
                                            description: "", 
                                            agendaPointId: point.id, 
                                            assignedTo: "", 
                                            status: "pending",
                                            priority: "medium"
                                          });
                                        }}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Action
                                      </Button>
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          );
                        })}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-4"
                          onClick={() => {
                            setCreatePointForAgenda(agenda.id);
                            agendaPointForm.reset({ title: "", description: "", agendaId: agenda.id });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Agenda Point
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Agenda Point Dialog */}
      <Dialog open={!!createPointForAgenda} onOpenChange={() => setCreatePointForAgenda(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agenda Point</DialogTitle>
            <DialogDescription>
              Add a specific discussion point or topic to this agenda item.
            </DialogDescription>
          </DialogHeader>
          <Form {...agendaPointForm}>
            <form onSubmit={agendaPointForm.handleSubmit((data) => createAgendaPointMutation.mutate(data))} className="space-y-4">
              <FormField
                control={agendaPointForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Point Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agenda point title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={agendaPointForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter point description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createAgendaPointMutation.isPending} className="flex-1">
                  {createAgendaPointMutation.isPending ? "Creating..." : "Create Point"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setCreatePointForAgenda(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Action Dialog */}
      <Dialog open={!!createActionForPoint} onOpenChange={() => setCreateActionForPoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Action</DialogTitle>
            <DialogDescription>
              Create an actionable task with priority, assignee, and due date for this agenda point.
            </DialogDescription>
          </DialogHeader>
          <Form {...actionForm}>
            <form onSubmit={actionForm.handleSubmit((data) => createActionMutation.mutate(data))} className="space-y-4">
              <FormField
                control={actionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter action title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={actionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter action description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={actionForm.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl>
                        <Input placeholder="Person responsible" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={actionForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={actionForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={actionForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createActionMutation.isPending} className="flex-1">
                  {createActionMutation.isPending ? "Creating..." : "Create Action"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setCreateActionForPoint(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialogs - Similar structure for editing agenda, points, and actions */}
      {/* Edit Agenda Dialog */}
      <Dialog open={!!editingAgenda} onOpenChange={() => setEditingAgenda(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agenda</DialogTitle>
          </DialogHeader>
          <Form {...agendaForm}>
            <form onSubmit={agendaForm.handleSubmit((data) => {
              if (editingAgenda) {
                updateAgendaMutation.mutate({ id: editingAgenda.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={agendaForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agenda Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agenda title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={agendaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter agenda description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateAgendaMutation.isPending} className="flex-1">
                  {updateAgendaMutation.isPending ? "Updating..." : "Update Agenda"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingAgenda(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Agenda Point Dialog */}
      <Dialog open={!!editingPoint} onOpenChange={() => setEditingPoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agenda Point</DialogTitle>
          </DialogHeader>
          <Form {...agendaPointForm}>
            <form onSubmit={agendaPointForm.handleSubmit((data) => {
              if (editingPoint) {
                updateAgendaPointMutation.mutate({ id: editingPoint.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={agendaPointForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Point Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter agenda point title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={agendaPointForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter point description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateAgendaPointMutation.isPending} className="flex-1">
                  {updateAgendaPointMutation.isPending ? "Updating..." : "Update Point"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingPoint(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Action Dialog */}
      <Dialog open={!!editingAction} onOpenChange={() => setEditingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Action</DialogTitle>
          </DialogHeader>
          <Form {...actionForm}>
            <form onSubmit={actionForm.handleSubmit((data) => {
              if (editingAction) {
                updateActionMutation.mutate({ id: editingAction.id, data });
              }
            })} className="space-y-4">
              <FormField
                control={actionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter action title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={actionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter action description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={actionForm.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl>
                        <Input placeholder="Person responsible" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={actionForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={actionForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={actionForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateActionMutation.isPending} className="flex-1">
                  {updateActionMutation.isPending ? "Updating..." : "Update Action"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingAction(null)}>
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