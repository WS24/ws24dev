import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { TaskCard } from "@/components/cards/task-card";
import { EvaluateTaskModal } from "@/components/modals/evaluate-task-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, Filter, Eye, Calculator, Play } from "lucide-react";
export default function Assignments() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
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
  // Check if user is specialist
  useEffect(() => {
    if (user && user.role !== "specialist") {
      toast({
        title: "Access Denied",
        description: "This page is only available to specialists.",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [user, toast]);
  const { data: assignedTasks, isLoading: assignedLoading, refetch: refetchAssigned } = useQuery({
    queryKey: ["/api/tasks"],
    retry: false,
    enabled: !!user && user.role === "specialist",
  });
  const { data: pendingTasks, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ["/api/tasks/pending"],
    retry: false,
    enabled: !!user && user.role === "specialist",
  });
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }
  if (user.role !== "specialist") {
    return null;
  }
  // Combine assigned and pending tasks
  const allTasks = [...(assignedTasks || []), ...(pendingTasks || [])];
  // Filter tasks based on search and filters
  const filteredTasks = allTasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  const handleEvaluateTask = (task: any) => {
    setSelectedTask(task);
    setIsEvaluateModalOpen(true);
  };
  const handleTakeTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (!response.ok) {
        throw new Error("Failed to take task");
      }
      toast({
        title: "Success",
        description: "Task assigned to you successfully!",
      });
      refetchAssigned();
      refetchPending();
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to take task. Please try again.",
        variant: "destructive",
      });
    }
  };
  const getActionButtons = (task: any) => {
    if (task.status === "created") {
      return (
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-blue-700"
            onClick={() => handleEvaluateTask(task)}
          >
            <Calculator className="mr-2 w-4 h-4" />
            Evaluate Task
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {}} // View details functionality
          >
            <Eye className="mr-2 w-4 h-4" />
            View Details
          </Button>
        </div>
      );
    } else if (task.status === "evaluated" && task.specialistId === user.id) {
      return (
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => handleTakeTask(task.id)}
          >
            <Play className="mr-2 w-4 h-4" />
            Start Work
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {}} // View details functionality
          >
            <Eye className="mr-2 w-4 h-4" />
            View Details
          </Button>
        </div>
      );
    } else if (task.specialistId === user.id) {
      return (
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {}} // Add update functionality
          >
            Add Update
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {}} // View details functionality
          >
            <Eye className="mr-2 w-4 h-4" />
            View Details
          </Button>
        </div>
      );
    }
    return null;
  };
  return (
    <>
      <div className="flex">
        <div className="flex-1">
          <div className="p-6">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Task Assignments</h1>
                <p className="text-gray-600 mt-1">
                  Evaluate and manage client tasks assigned to you.
                </p>
              </div>
              {/* Filters and Search */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="created">Pending Evaluation</SelectItem>
                        <SelectItem value="evaluated">Evaluated</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              {/* Task Cards */}
              {assignedLoading || pendingLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-48 bg-white rounded-xl border shadow-sm"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                        ? "No tasks match your filters" 
                        : "No assignments yet"
                      }
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your search criteria or filters."
                        : "New task assignments will appear here when clients create tasks."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredTasks.map((task: any) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                              <Badge 
                                className={
                                  task.status === "created" ? "bg-yellow-100 text-yellow-800" :
                                  task.status === "evaluated" ? "bg-blue-100 text-blue-800" :
                                  task.status === "in_progress" ? "bg-orange-100 text-orange-800" :
                                  task.status === "completed" ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"
                                }
                              >
                                {task.status === "created" ? "Pending Evaluation" :
                                 task.status === "evaluated" ? "Evaluated" :
                                 task.status === "in_progress" ? "In Progress" :
                                 task.status === "completed" ? "Completed" :
                                 task.status}
                              </Badge>
                              <Badge 
                                className={
                                  task.priority === "high" ? "bg-red-100 text-red-800" :
                                  task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-green-100 text-green-800"
                                }
                              >
                                {task.priority} Priority
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Category: {task.category}</span>
                              {task.deadline && (
                                <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                              )}
                              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                            {task.totalCost && (
                              <div className="mt-2">
                                <span className="text-lg font-semibold text-green-600">
                                  ${task.totalCost} ({task.estimatedHours}h × ${task.hourlyRate}/hr)
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-6">
                            {getActionButtons(task)}
                          </div>
                        </div>
                        {/* Attachments */}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                            <div className="flex space-x-3">
                              {task.attachments.map((attachment: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                                  <span className="text-sm text-gray-700">{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
      {/* Evaluate Task Modal */}
      <EvaluateTaskModal
        isOpen={isEvaluateModalOpen}
        onClose={() => {
          setIsEvaluateModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSuccess={() => {
          refetchAssigned();
          refetchPending();
          setIsEvaluateModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
}
