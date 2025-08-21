import { useEffect, startTransition } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/cards/stats-card";
import { TaskCard } from "@/components/cards/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, CreditCard, Headphones, Clock, CheckCircle, AlertCircle, DollarSign, BarChart3, Calculator, Users, Globe, Code } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeTasks: string;
    completedTasks: string;
    pendingTasks: string;
    assignedTasks?: string;
    pendingEvaluations?: string;
    totalSpent?: string;
    totalEarned?: string;
  }>({
    queryKey: ["/api/stats"],
    retry: false,
    enabled: !!user,
  });
  const { data: tasks, isLoading: tasksLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
    retry: false,
    enabled: !!user,
  });
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  const createdTasks = (tasks || []).filter(task => task.status === "created").slice(0, 3);
  const getStatsCards = () => {
    if (user.role === "specialist") {
      return [
        {
          title: "Assigned Tasks",
          value: stats?.assignedTasks || 0,
          icon: Clock,
          color: "blue" as const,
        },
        {
          title: "Completed",
          value: stats?.completedTasks || 0,
          icon: CheckCircle,
          color: "green",
        },
        {
          title: "Pending Evaluations",
          value: stats?.pendingEvaluations || 0,
          icon: AlertCircle,
          color: "yellow" as const,
        },
        {
          title: "Total Earned",
          value: `$${stats?.totalEarned || 0}`,
          icon: DollarSign,
          color: "purple",
        },
      ];
    } else {
      return [
        {
          title: "Active Tasks",
          value: stats?.activeTasks || 0,
          icon: Clock,
          color: "blue",
        },
        {
          title: "Completed",
          value: stats?.completedTasks || 0,
          icon: CheckCircle,
          color: "green",
        },
        {
          title: "Pending Evaluation",
          value: stats?.pendingTasks || 0,
          icon: AlertCircle,
          color: "yellow",
        },
        {
          title: "Total Spent",
          value: `$${stats?.totalSpent || 0}`,
          icon: DollarSign,
          color: "purple",
        },
      ];
    }
  };
  return (
    <>
      <div>
        {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back! Here's what's happening with your {user.role === "specialist" ? "assignments" : "tasks"}.
                </p>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {getStatsCards().map((stat, index) => (
                  <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color as any}
                    loading={statsLoading}
                  />
                ))}
              </div>
              {/* Recent Tasks and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Created {user.role === "specialist" ? "Assignments" : "Tasks"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tasksLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-20 bg-gray-200 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      ) : createdTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No created {user.role === "specialist" ? "assignments" : "tasks"} found</p>
                          {user.role === "client" && (
                          <Button
                            onClick={() => startTransition(() => setIsCreateModalOpen(true))}
                            className="mt-4"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Task
                          </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {createdTasks.map((task: any) => (
                            <TaskCard key={task.id} task={task} userRole={user.role} />
                          ))}
                          <div className="mt-6">
                            <a 
                              href={user.role === "specialist" ? "/assignments" : "/tasks"} 
                              className="text-primary font-medium hover:text-blue-700 transition-colors duration-200 flex items-center"
                            >
                              View all {user.role === "specialist" ? "assignments" : "tasks"}
                              <Plus className="ml-1 w-4 h-4 rotate-45" />
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {/* Quick Actions and Notifications */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {user.role === "client" ? (
                        <>
                          <Button
                            onClick={() => startTransition(() => setIsCreateModalOpen(true))}
                            className="w-full bg-primary text-white hover:bg-blue-700"
                          >
                            <Plus className="mr-2 w-4 h-4" />
                            Create New Task
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
onClick={() => startTransition(() => { window.location.href = "/billing"; })}
                          >
                            <CreditCard className="mr-2 w-4 h-4" />
                            View Billing
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            className="w-full bg-primary text-white hover:bg-blue-700"
onClick={() => startTransition(() => { window.location.href = "/assignments"; })}
                          >
                            <Clock className="mr-2 w-4 h-4" />
                            View Assignments
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
onClick={() => startTransition(() => { window.location.href = "/assignments"; })}
                          >
                            <AlertCircle className="mr-2 w-4 h-4" />
                            Pending Evaluations
                          </Button>
                        </>
                      )}
                      <Button variant="outline" className="w-full">
                        <Headphones className="mr-2 w-4 h-4" />
                        Contact Support
                      </Button>
                    </CardContent>
                  </Card>
                  {/* Notifications Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {createdTasks.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No recent updates
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {createdTasks.slice(0, 2).map((task: any) => (
                            <div key={task.id} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm text-gray-900 font-medium">Task Update</p>
                                <p className="text-xs text-gray-500">{task.title}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(task.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
        
        {/* Create Task Modal */}
        <CreateTaskModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      </div>
    </>
  )
}
