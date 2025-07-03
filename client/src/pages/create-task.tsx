import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { Plus, FileCode, Globe, Smartphone, Database, Settings, Zap } from "lucide-react";
import { z } from "zod";
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().default("web-development"),
  priority: z.string().default("medium"),
  budget: z.string().optional(),
});
type CreateTaskData = z.infer<typeof createTaskSchema>;
const taskCategories = [
  { value: "web-development", label: "Web Development", icon: Globe, color: "bg-blue-500" },
  { value: "mobile-app", label: "Mobile App", icon: Smartphone, color: "bg-green-500" },
  { value: "api-integration", label: "API Integration", icon: Database, color: "bg-purple-500" },
  { value: "bug-fix", label: "Bug Fix", icon: Settings, color: "bg-red-500" },
  { value: "optimization", label: "Performance", icon: Zap, color: "bg-yellow-500" },
  { value: "custom-development", label: "Custom Development", icon: FileCode, color: "bg-indigo-500" },
];
const priorityLevels = [
  { value: "low", label: "Low Priority", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium Priority", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High Priority", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];
export default function CreateTask() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const form = useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "web-development",
      budget: "",
    },
  });
  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      toast({
        title: "Task Created",
        description: "Your task has been submitted for evaluation by our specialists.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
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
  const onSubmit = (data: CreateTaskData) => {
    createTaskMutation.mutate(data);
  };
  const selectedCategoryData = taskCategories.find(cat => cat.value === form.watch("category"));
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Plus className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-gray-600">Submit your web development project for specialist evaluation</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Provide detailed information about your web development project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., E-commerce website with payment integration" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about what you need built or fixed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {taskCategories.map((category) => {
                              const IconComponent = category.icon;
                              return (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${category.color} flex items-center justify-center`}>
                                      <IconComponent className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    {category.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityLevels.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <Badge className={priority.color} variant="secondary">
                                  {priority.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Higher priority tasks receive faster attention
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range (USD)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., $500-1000 or $2500" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide your budget range for accurate specialist evaluation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your project requirements, technical specifications, target audience, and any specific features you need..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include technical requirements, design preferences, integrations needed, and timeline expectations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending}
                    className="w-full"
                  >
                    {createTaskMutation.isPending ? "Submitting..." : "Submit for Evaluation"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedCategoryData && (
                  <div className={`w-6 h-6 rounded ${selectedCategoryData.color} flex items-center justify-center`}>
                    <selectedCategoryData.icon className="w-4 h-4 text-white" />
                  </div>
                )}
                Project Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCategoryData ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">{selectedCategoryData.label}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedCategoryData.value === "web-development" && "Full-stack web applications, websites, and web services"}
                    {selectedCategoryData.value === "mobile-app" && "iOS and Android mobile applications"}
                    {selectedCategoryData.value === "api-integration" && "Third-party API integrations and custom APIs"}
                    {selectedCategoryData.value === "bug-fix" && "Debugging and fixing existing code issues"}
                    {selectedCategoryData.value === "optimization" && "Performance improvements and code optimization"}
                    {selectedCategoryData.value === "custom-development" && "Custom solutions and specialized development"}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Select a category to see details</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Submit Task</h4>
                  <p className="text-sm text-gray-600">Provide project details and requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Specialist Review</h4>
                  <p className="text-sm text-gray-600">Expert evaluation with cost and timeline estimate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Payment & Start</h4>
                  <p className="text-sm text-gray-600">Approve estimate and begin development</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Delivery</h4>
                  <p className="text-sm text-gray-600">Receive completed project with full support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}