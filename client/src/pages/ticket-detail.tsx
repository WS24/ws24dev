import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Types for ticket details and related data
type TicketDetails = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  category?: string;
  clientId?: string;
  specialistId?: string | null;
  estimatedHours?: number | null;
  createdAt?: string | Date | null;
  completedAt?: string | Date | null;
  deadline?: string | Date | null;
  quotedCost?: string | number | null;
  adminApproval?: boolean | null;
  clientName?: string | null;
  specialistName?: string | null;
  rating?: number | null;
  budget?: string | number | null;
};

type MessageItem = {
  id: number;
  message: string;
  userId: string;
  userName?: string;
  createdAt: string | Date;
  isInternal?: boolean;
};

type AttachmentItem = {
  id: number;
  name: string;
  size: string;
  url?: string;
  createdAt: string | Date;
};

type ChangeLogItem = {
  description: string;
  userName?: string;
  createdAt: string | Date;
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import {
  MessageSquare,
  Paperclip,
  History,
  Settings,
  Send,
  Download,
  Upload,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Flag
} from "lucide-react";
export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
const { data: ticket, isLoading } = useQuery<TicketDetails>({
    queryKey: [`/api/tickets/${id}`],
  });
const { data: messages = [] } = useQuery<MessageItem[]>({
    queryKey: [`/api/tickets/${id}/messages`],
  });
const { data: changeLog = [] } = useQuery<ChangeLogItem[]>({
    queryKey: [`/api/tickets/${id}/changelog`],
  });
const { data: attachments = [] } = useQuery<AttachmentItem[]>({
    queryKey: [`/api/tickets/${id}/attachments`],
  });
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; isInternal: boolean }) => {
      await apiRequest("POST", `/api/tickets/${id}/messages`, messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}/messages`] });
      setMessage("");
      setInternalNote("");
      toast({ title: "Message sent successfully" });
    },
  });
  const updateTicketMutation = useMutation({
    mutationFn: async (updates: any) => {
      await apiRequest("PATCH", `/api/tickets/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}/changelog`] });
      toast({ title: "Ticket updated successfully" });
    },
  });
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest("POST", `/api/tickets/${id}/attachments`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}/attachments`] });
      setSelectedFile(null);
      toast({ title: "File uploaded successfully" });
    },
  });
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate({ message, isInternal: false });
    }
  };
  const handleSendInternalNote = () => {
    if (internalNote.trim()) {
      sendMessageMutation.mutate({ message: internalNote, isInternal: true });
    }
  };
  const handleFileUpload = () => {
    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile);
    }
  };
  const getStatusColor = (status: string) => {
    const colors = {
      Created: "bg-blue-500",
      "In Progress": "bg-yellow-500",
      Evaluation: "bg-purple-500",
      Completed: "bg-green-500",
      Rejected: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-red-600",
    };
    return colors[priority as keyof typeof colors] || "text-gray-600";
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }
const isOverdue = (ticket as any).deadline && new Date((ticket as any).deadline) < new Date();
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Ticket #{ticket.id}</span>
              <span>•</span>
<span>Created {ticket.createdAt ? format(new Date(ticket.createdAt as any), "MMM d, yyyy") : "-"}</span>
              {isOverdue && (
                <>
                  <span>•</span>
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Overdue
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
              {ticket.status}
            </Badge>
<Flag className={`h-5 w-5 ${getPriorityColor((ticket as any).priority || "low")}`} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="files">
                <Paperclip className="h-4 w-4 mr-2" />
                Files
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.userId === user?.id ? "flex-row-reverse" : ""}`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                            <User className="h-4 w-4" />
                          </div>
                        </div>
                        <div className={`flex-1 ${msg.userId === user?.id ? "text-right" : ""}`}>
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              msg.userId === user?.id
                                ? "bg-primary text-white"
                                : msg.isInternal
                                ? "bg-yellow-100 border border-yellow-300"
                                : "bg-gray-100"
                            }`}
                          >
                            {msg.isInternal && (
                              <p className="text-xs font-semibold mb-1">Internal Note</p>
                            )}
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.userName} • {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Send Message</Label>
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                          rows={2}
                        />
                        <Button onClick={handleSendMessage} disabled={!message.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {(user?.role === "admin" || user?.role === "specialist") && (
                      <div>
                        <Label>Internal Note</Label>
                        <div className="flex gap-2 mt-2">
                          <Textarea
                            value={internalNote}
                            onChange={(e) => setInternalNote(e.target.value)}
                            placeholder="Add internal note (not visible to client)..."
                            className="flex-1"
                            rows={2}
                          />
                          <Button 
                            onClick={handleSendInternalNote} 
                            disabled={!internalNote.trim()}
                            variant="outline"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="files" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Upload File</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <Button 
                          onClick={handleFileUpload} 
                          disabled={!selectedFile}
                          variant="outline"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {attachments?.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {file.size} • Uploaded {format(new Date(file.createdAt), "MMM d")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {!attachments?.length && (
                        <p className="text-center text-muted-foreground py-4">No files attached</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {changeLog?.map((log: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{log.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.userName} • {format(new Date(log.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!changeLog?.length && (
                      <p className="text-center text-muted-foreground py-4">No changes recorded</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              {(user?.role === "admin" || user?.id === ticket.specialistId) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => updateTicketMutation.mutate({ status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Created">Created</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Evaluation">Evaluation</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={ticket.priority}
                            onValueChange={(value) => updateTicketMutation.mutate({ priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Deadline</Label>
                        <Input
                          type="date"
value={ticket.deadline ? format(new Date(ticket.deadline as any), "yyyy-MM-dd") : ""}
                          onChange={(e) => updateTicketMutation.mutate({ deadline: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Quoted Cost</Label>
                        <Input
                          type="number"
                          value={ticket.quotedCost || ""}
                          onChange={(e) => updateTicketMutation.mutate({ quotedCost: e.target.value })}
                          placeholder="Enter amount"
                        />
                      </div>
                      {user?.role === "admin" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="adminApproval"
                            checked={ticket.adminApproval || false}
                            onChange={(e) => updateTicketMutation.mutate({ adminApproval: e.target.checked })}
                          />
                          <Label htmlFor="adminApproval">Admin Approval</Label>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{ticket.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Specialist</p>
                <p className="font-medium">{ticket.specialistName || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{ticket.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Hours</p>
                <p className="font-medium">{ticket.estimatedHours || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">${ticket.budget || "0"}</p>
              </div>
              {ticket.status === "Completed" && ticket.rating && (
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
i < (ticket.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{ticket.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}