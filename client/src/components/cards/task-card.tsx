import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  DollarSign, 
  CheckCircle,
  Play,
  Eye,
  MessageSquare
} from "lucide-react";

interface TaskCardProps {
  task: any;
  userRole: string;
  onUpdate?: () => void;
}

export function TaskCard({ task, userRole, onUpdate }: TaskCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      await apiRequest("PATCH", `/api/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onUpdate?.();
    },
    onError: (error) => {
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
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (status: string) => {
    updateTaskMutation.mutate({ taskId: task.id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "created":
        return <Badge className="bg-gray-100 text-gray-800">Created</Badge>;
      case "evaluating":
        return <Badge className="bg-blue-100 text-blue-800">Evaluating</Badge>;
      case "evaluated":
        return <Badge className="bg-yellow-100 text-yellow-800">Evaluated</Badge>;
      case "paid":
        return <Badge className="bg-purple-100 text-purple-800">Paid</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusIndicatorColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-orange-500";
      case "paid": return "bg-purple-500";
      case "evaluated": return "bg-yellow-500";
      case "evaluating": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };

  const getActionButtons = () => {
    if (userRole === "specialist") {
      if (task.status === "created") {
        return (
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-blue-700"
            onClick={() => {}} // Navigate to evaluation
          >
            Evaluate Task
          </Button>
        );
      } else if (task.status === "paid" && task.specialistId) {
        return (
          <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => handleStatusUpdate("in_progress")}
            disabled={updateTaskMutation.isPending}
          >
            <Play className="mr-2 w-4 h-4" />
            Start Work
          </Button>
        );
      } else if (task.status === "in_progress" && task.specialistId) {
        return (
          <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => handleStatusUpdate("completed")}
            disabled={updateTaskMutation.isPending}
          >
            <CheckCircle className="mr-2 w-4 h-4" />
            Mark Complete
          </Button>
        );
      }
    } else if (userRole === "client") {
      if (task.status === "evaluated") {
        return (
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-blue-700"
            onClick={() => {}} // Navigate to payment
          >
            <DollarSign className="mr-2 w-4 h-4" />
            Pay Now
          </Button>
        );
      }
    }

    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {}} // Navigate to task details
      >
        <Eye className="mr-2 w-4 h-4" />
        View Details
      </Button>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${getStatusIndicatorColor(task.status)}`}></div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {task.category}
                </span>
                
                {task.deadline && (
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
                
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </span>
                
                {userRole === "client" && task.specialistId && (
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    Assigned to specialist
                  </span>
                )}
              </div>

              {/* Cost Information */}
              {task.totalCost && (
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(task.totalCost)}
                  </span>
                  {task.estimatedHours && task.hourlyRate && (
                    <span className="text-xs text-gray-500">
                      ({task.estimatedHours}h × {formatCurrency(task.hourlyRate)}/hr)
                    </span>
                  )}
                </div>
              )}

              {/* Progress for in-progress tasks */}
              {task.status === "in_progress" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Progress</span>
                    <span className="text-xs font-medium text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-6 flex flex-col space-y-2">
            {getActionButtons()}
            
            {(task.status === "in_progress" || task.status === "completed") && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {}} // Navigate to updates/messages
              >
                <MessageSquare className="mr-2 w-4 h-4" />
                Updates
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
