import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Users,
  DollarSign,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";
import type { Task } from "@shared/schema";
interface HelpdeskStats {
  totalTickets: number;
  activeTickets: number;
  overdueTickets: number;
  totalUsers: number;
  activeSpecialists: number;
  totalRevenue: string;
  revenueThisMonth: string;
  newTicketsThisWeek: number;
}
interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: string;
}
export default function HelpdeskDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<HelpdeskStats>({
    queryKey: ["/api/helpdesk/dashboard-stats"],
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: recentActivity = [], isLoading: activityLoading, error: activityError } = useQuery<RecentActivity[]>({
    queryKey: ["/api/helpdesk/recent-activity"],
    retry: false,
    refetchOnWindowFocus: false,
  });
  // Show loading state
  if (statsLoading || tasksLoading || activityLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  // Show error state
  if (statsError || tasksError || activityError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground mb-4">
            {statsError?.message || tasksError?.message || activityError?.message || "An error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  const statusColors = {
    Created: "bg-blue-500",
    "In Progress": "bg-yellow-500",
    Evaluation: "bg-purple-500",
    Completed: "bg-green-500",
    Rejected: "bg-red-500",
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Created":
        return <FileText className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4" />;
      case "Evaluation":
        return <AlertCircle className="h-4 w-4" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const getFilteredTasks = () => {
    if (!tasks) return [];
    switch (filter) {
      case "mine":
        return tasks.filter(
          (task) =>
            task.specialistId === user?.id || task.clientId === user?.id
        );
      case "pending":
        return tasks.filter((task) => task.status === "Created");
      default:
        return tasks;
    }
  };
  const filteredTasks = getFilteredTasks();
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Helpdesk Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All tickets
          </Button>
          <Button
            variant={filter === "mine" ? "default" : "outline"}
            onClick={() => setFilter("mine")}
          >
            Assigned to me
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending review
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newTicketsThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTickets || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overdueTickets || 0} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeSpecialists || 0} active specialists
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(stats?.totalRevenue || "0").toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${parseFloat(stats?.revenueThisMonth || "0").toFixed(2)} this month
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusColors).map(([status, color]) => (
              <div
                key={status}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm font-medium">{status}</span>
                </div>
                <span className="text-2xl font-bold">
                  {statusCounts[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Recent Activity & Tasks */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  recentActivity.slice(0, 10).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(activity.status || activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No tasks found
                  </p>
                ) : (
                  filteredTasks.slice(0, 20).map((task) => (
                    <Link href={`/tasks/${task.id}`} key={task.id}>
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(task.status)}
                          </div>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              #{task.id} • Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.status}</Badge>
                          {task.priority === "high" && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                          {task.deadline && new Date(task.deadline) < new Date() && task.status !== "Completed" && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}