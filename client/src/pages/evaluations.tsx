import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEvaluationSchema, type Task } from "@shared/schema";
import { Calculator, Clock, DollarSign, CheckCircle, AlertCircle, FileText, User, Calendar } from "lucide-react";

type EvaluationData = {
  estimatedHours: number;
  hourlyRate: number;
  totalCost: number;
  notes: string;
  deadline: string;
  complexity: string;
  techStack: string;
};

const complexityLevels = [
  { value: "simple", label: "Simple", hours: "5-15", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderate", hours: "16-40", color: "bg-blue-100 text-blue-800" },
  { value: "complex", label: "Complex", hours: "41-80", color: "bg-orange-100 text-orange-800" },
  { value: "advanced", label: "Advanced", hours: "80+", color: "bg-red-100 text-red-800" },
];

export default function Evaluations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: pendingTasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/pending-evaluation"],
    retry: false,
  });

  const { data: myEvaluations } = useQuery<any[]>({
    queryKey: ["/api/evaluations/my-evaluations"],
    retry: false,
  });

  const form = useForm<EvaluationData>({
    resolver: zodResolver(insertEvaluationSchema),
    defaultValues: {
      estimatedHours: 0,
      hourlyRate: 75,
      totalCost: 0,
      notes: "",
      deadline: "",
      complexity: "moderate",
      techStack: "",
    },
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: async (data: EvaluationData) => {
      if (!selectedTask) throw new Error("No task selected");
      await apiRequest("POST", `/api/tasks/${selectedTask.id}/evaluate`, data);
    },
    onSuccess: () => {
      toast({
        title: "Evaluation Submitted",
        description: "Your evaluation has been sent to the client for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/pending-evaluation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations/my-evaluations"] });
      setSelectedTask(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EvaluationData) => {
    submitEvaluationMutation.mutate(data);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    // Auto-calculate initial estimates based on task complexity
    const complexity = getTaskComplexity(task);
    const baseHours = getBaseHours(complexity);
    const hourlyRate = 75;
    
    form.setValue("estimatedHours", baseHours);
    form.setValue("hourlyRate", hourlyRate);
    form.setValue("totalCost", baseHours * hourlyRate);
    form.setValue("complexity", complexity);
  };

  const getTaskComplexity = (task: Task): string => {
    const description = task.description.toLowerCase();
    if (description.includes("simple") || description.includes("basic")) return "simple";
    if (description.includes("complex") || description.includes("advanced")) return "complex";
    if (description.includes("enterprise") || description.includes("scaling")) return "advanced";
    return "moderate";
  };

  const getBaseHours = (complexity: string): number => {
    switch (complexity) {
      case "simple": return 10;
      case "moderate": return 25;
      case "complex": return 50;
      case "advanced": return 80;
      default: return 25;
    }
  };

  const updateTotalCost = () => {
    const hours = form.watch("estimatedHours");
    const rate = form.watch("hourlyRate");
    form.setValue("totalCost", hours * rate);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Task Evaluations</h1>
          <p className="text-gray-600">Review and evaluate client projects</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Evaluations</TabsTrigger>
          <TabsTrigger value="submitted">My Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Tasks</h2>
              {pendingTasks?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No pending evaluations</p>
                  </CardContent>
                </Card>
              ) : (
                pendingTasks?.map((task) => (
                  <Card 
                    key={task.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedTask?.id === task.id ? "ring-2 ring-primary" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {task.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Client Project
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {task.priority} Priority
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {task.createdAt ? new Date(String(task.createdAt)).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Evaluation Form */}
            <div>
              {selectedTask ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluate: {selectedTask.title}</CardTitle>
                    <CardDescription>
                      Provide detailed cost and time estimation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="estimatedHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Hours</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => {
                                      field.onChange(parseInt(e.target.value));
                                      updateTotalCost();
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hourlyRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hourly Rate ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => {
                                      field.onChange(parseInt(e.target.value));
                                      updateTotalCost();
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="totalCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Cost</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  readOnly 
                                  className="bg-gray-50"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Completion</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="techStack"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recommended Tech Stack</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., React, Node.js, PostgreSQL"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Evaluation Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detailed breakdown of work, potential challenges, deliverables..."
                                  className="min-h-24"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          disabled={submitEvaluationMutation.isPending}
                          className="w-full"
                        >
                          {submitEvaluationMutation.isPending ? "Submitting..." : "Submit Evaluation"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Select a task to start evaluation</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <h2 className="text-xl font-semibold">My Submitted Evaluations</h2>
          {myEvaluations?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No evaluations submitted yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myEvaluations?.map((evaluation) => (
                <Card key={evaluation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{evaluation.task?.title}</h3>
                      <Badge 
                        variant={evaluation.status === "accepted" ? "default" : "secondary"}
                      >
                        {evaluation.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {evaluation.estimatedHours}h
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${evaluation.totalCost}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(evaluation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {evaluation.notes && (
                      <p className="text-gray-600 text-sm mt-2">
                        {evaluation.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}