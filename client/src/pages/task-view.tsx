import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Clock, DollarSign, User, Calendar, MessageSquare, FileText } from "lucide-react";
import { Link } from "wouter";

export default function TaskView() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { id } = useParams();
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery<any>({
    queryKey: ["/api/tasks", id],
    retry: false,
    enabled: !!user && !!id,
  });

  // Fetch task comments/updates
  const { data: comments, isLoading: commentsLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks", id, "updates"],
    retry: false,
    enabled: !!user && !!id,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { content: string }) => {
      const response = await apiRequest("POST", `/api/tasks/${id}/updates`, commentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", id, "updates"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
              <p className="text-gray-600 mb-6">The task you're looking for doesn't exist or you don't have permission to view it.</p>
              <Link href={user.role === "specialist" ? "/assignments" : "/tasks"}>
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tasks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "evaluating":
        return "bg-yellow-100 text-yellow-800";
      case "evaluated":
        return "bg-purple-100 text-purple-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addCommentMutation.mutate({
      content: comment.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={user.role === "specialist" ? "/assignments" : "/tasks"}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
              </div>
              <Badge className={getStatusColor(task.status)}>
                {task.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Task Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority} Priority
                      </Badge>
                      <Badge variant="outline">{task.category}</Badge>
                    </div>
                  </div>
                  {task.budget && (
                    <div className="text-right">
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <DollarSign className="w-5 h-5 mr-1" />
                        ${task.budget}
                      </div>
                      <p className="text-sm text-gray-500">Budget</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{task.description}</p>
                </div>
                
                {task.requirements && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Requirements</Label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{task.requirements}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-gray-600">{task.clientId}</p>
                    </div>
                  </div>
                  
                  {task.specialistId && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Specialist</p>
                        <p className="text-sm text-gray-600">{task.specialistId}</p>
                      </div>
                    </div>
                  )}
                  
                  {task.deadline && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Deadline</p>
                        <p className="text-sm text-gray-600">
                          {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments & Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Comments */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((update: any) => (
                      <div key={update.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {update.userId?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {update.userId === user.id ? "You" : update.userId}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(update.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {update.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No comments yet. Be the first to add a comment!</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div>
                    <Label htmlFor="comment">Add a comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Write your comment here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={!comment.trim() || addCommentMutation.isPending}
                    >
                      {addCommentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}