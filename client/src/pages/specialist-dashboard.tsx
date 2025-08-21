import { useQuery, useMutation } from "@tanstack/react-query";
import { startTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, DollarSign, FileText, Calendar, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, TaskEvaluation } from "@shared/schema";
interface SpecialistStats {
  assignedTasks: number;
  completedTasks: number;
  pendingEvaluations: number;
  totalEarned: string;
  averageRating: number;
  specializations: string[];
}
export default function SpecialistDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading } = useQuery<SpecialistStats>({
    queryKey: ["/api/specialist/stats"],
    enabled: !!user,
  });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/specialist/tasks"],
    enabled: !!user,
  });
  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery<TaskEvaluation[]>({
    queryKey: ["/api/specialist/evaluations"],
    enabled: !!user,
  });
  const submitEvaluationMutation = useMutation({
    mutationFn: async (data: { taskId: number; hours: number; cost: number; notes: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/evaluate`, {
        estimatedHours: data.hours,
        estimatedCost: data.cost,
        evaluationNotes: data.notes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Evaluation Submitted",
        description: "Your pricing and timeline have been sent to the client.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/specialist/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/specialist/evaluations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("PUT", `/api/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Task Completed",
        description: "Task has been marked as complete and submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/specialist/tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      created: "secondary",
      evaluating: "outline",
      evaluated: "default",
      paid: "default",
      in_progress: "default",
      completed: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };
  if (statsLoading || tasksLoading || evaluationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  const pendingEvaluations = tasks.filter(task => task.status === "created" && task.specialistId === user?.id);
  const activeTasks = tasks.filter(task => task.status === "in_progress" && task.specialistId === user?.id);
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Specialist Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your tasks and track earnings</p>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assignedTasks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingEvaluations || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalEarned || "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {stats?.specializations?.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              )) || <span className="text-gray-500">None</span>}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Evaluation
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Active Tasks
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Earnings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Pending Evaluation</CardTitle>
              <CardDescription>Set pricing and estimated delivery time for these tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingEvaluations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tasks pending evaluation
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvaluations.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg">{task.title}</h4>
                          <p className="text-gray-600 mt-1">{task.description}</p>
                          <div className="flex gap-4 mt-2">
                            <Badge variant="outline">{task.category}</Badge>
                            <span className="text-sm text-gray-500">
                              Priority: {task.priority}
                            </span>
                          </div>
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            submitEvaluationMutation.mutate({
                              taskId: task.id,
                              hours: Number(formData.get("hours")),
                              cost: Number(formData.get("cost")),
                              notes: formData.get("notes") as string,
                            });
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`hours-${task.id}`}>Estimated Hours</Label>
                              <Input
                                id={`hours-${task.id}`}
                                name="hours"
                                type="number"
                                required
                                min="1"
                                placeholder="e.g., 10"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`cost-${task.id}`}>Total Cost ($)</Label>
                              <Input
                                id={`cost-${task.id}`}
                                name="cost"
                                type="number"
                                required
                                min="1"
                                step="0.01"
                                placeholder="e.g., 500.00"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`notes-${task.id}`}>Evaluation Notes</Label>
                            <Textarea
                              id={`notes-${task.id}`}
                              name="notes"
                              required
                              placeholder="Explain your pricing and approach..."
                              rows={3}
                            />
                          </div>
                          <Button type="submit" disabled={submitEvaluationMutation.isPending}>
                            Submit Evaluation
                          </Button>
                        </form>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>Tasks currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>Client #{task.clientId.slice(-6)}</TableCell>
                      <TableCell>{task.category}</TableCell>
<TableCell>${task.totalCost || "TBD"}</TableCell>
                      <TableCell>
                        {task.deadline 
                          ? formatDistanceToNow(new Date(task.deadline), { addSuffix: true })
                          : "No deadline"
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => completeTaskMutation.mutate(task.id)}
                          disabled={completeTaskMutation.isPending}
                        >
                          Mark Complete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activeTasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No active tasks
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>Your completed work history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Earned</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks
                    .filter(task => task.status === "completed" && task.specialistId === user?.id)
                    .map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <p className="font-medium">{task.title}</p>
                        </TableCell>
                        <TableCell>{task.category}</TableCell>
                        <TableCell>
                          {task.completedAt 
                            ? new Date(task.completedAt).toLocaleDateString()
                            : "N/A"
                          }
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
${((Number(task.totalCost) || 0) * 0.5).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Pending</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Track your income and commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">$0.00</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Last Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">$0.00</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">${stats?.totalEarned || "0.00"}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Detailed earning reports coming soon</p>
                  <p className="text-sm mt-2">You receive 50% commission on all completed tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}