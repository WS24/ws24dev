import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertEvaluationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, DollarSign } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";

const formSchema = insertEvaluationSchema.extend({
  estimatedHours: z.number().min(1, "Must be at least 1 hour"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  totalCost: z.string().min(1, "Total cost is required"),
});

interface EvaluateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onSuccess?: () => void;
}

export function EvaluateTaskModal({ isOpen, onClose, task, onSuccess }: EvaluateTaskModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calculatedTotal, setCalculatedTotal] = useState<string>("0.00");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estimatedHours: 1,
      hourlyRate: "75.00",
      totalCost: "75.00",
      notes: "",
    },
  });

  const watchedHours = form.watch("estimatedHours");
  const watchedRate = form.watch("hourlyRate");

  // Calculate total cost when hours or rate changes
  useEffect(() => {
    const hours = Number(watchedHours) || 0;
    const rate = Number(watchedRate) || 0;
    const total = (hours * rate).toFixed(2);
    setCalculatedTotal(total);
    form.setValue("totalCost", total);
  }, [watchedHours, watchedRate, form]);

  const evaluateTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", `/api/tasks/${task.id}/evaluate`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task evaluation submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      form.reset();
      onSuccess?.();
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
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    evaluateTaskMutation.mutate(data);
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Evaluate Task</span>
          </DialogTitle>
        </DialogHeader>

        {/* Task Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
              <div className="flex items-center space-x-3 mb-2">
                <Badge className={getPriorityBadgeColor(task.priority)}>
                  {task.priority} Priority
                </Badge>
                <span className="text-sm text-gray-500">Category: {task.category}</span>
                {task.deadline && (
                  <span className="text-sm text-gray-500">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{task.description}</p>
            </div>
          </div>
          
          {task.attachments && task.attachments.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 px-2 py-1 bg-white rounded border text-sm">
                    <span className="text-gray-700">{attachment.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Estimated Hours</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        step="0.5"
                        placeholder="Enter estimated hours"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                    <FormLabel className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Hourly Rate (USD)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter hourly rate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost Calculation Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Project Cost</p>
                  <p className="text-xs text-blue-700">
                    {watchedHours || 0} hours × {formatCurrency(watchedRate || 0)}/hour
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(calculatedTotal)}
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="totalCost"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
<Textarea
                      placeholder="Provide any additional details about your approach, timeline, or requirements..."
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Evaluation Guidelines</p>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                    <li>• Provide realistic time estimates based on the task complexity</li>
                    <li>• Include time for testing, debugging, and revisions</li>
                    <li>• Consider any additional requirements or edge cases</li>
                    <li>• Be transparent about your approach and methodology</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-blue-700"
                disabled={evaluateTaskMutation.isPending}
              >
                {evaluateTaskMutation.isPending ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
