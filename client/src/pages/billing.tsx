import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreditCard, Clock, CheckCircle, DollarSign, FileText, AlertCircle } from "lucide-react";

export default function Billing() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    retry: false,
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // Filter tasks that have been evaluated or completed (involve billing)
  const billingTasks = (tasks || []).filter((task: any) => 
    task.status === "evaluated" || 
    task.status === "paid" || 
    task.status === "in_progress" || 
    task.status === "completed"
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "evaluated":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount) || 0);
  };

  const totalSpent = stats?.totalSpent || "0";
  const pendingAmount = billingTasks
    .filter((task: any) => task.status === "evaluated")
    .reduce((sum: number, task: any) => sum + Number(task.totalCost || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex pt-16">
        <Sidebar />
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
                <p className="text-gray-600 mt-1">
                  Track your project costs, payments, and billing history.
                </p>
              </div>

              {/* Billing Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {statsLoading ? "..." : formatCurrency(totalSpent)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {tasksLoading ? "..." : formatCurrency(pendingAmount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {tasksLoading ? "..." : billingTasks.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : billingTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
                      <p className="text-gray-500">
                        Your billing information will appear here once you have tasks with evaluations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {billingTasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{task.title}</h3>
                              {getStatusBadge(task.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                <Clock className="w-4 h-4 inline mr-1" />
                                {task.estimatedHours ? `${task.estimatedHours} hours` : "TBD"}
                              </span>
                              <span>
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                {task.hourlyRate ? `${formatCurrency(task.hourlyRate)}/hr` : "TBD"}
                              </span>
                              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <p className="text-lg font-semibold text-gray-900">
                              {task.totalCost ? formatCurrency(task.totalCost) : "Pending"}
                            </p>
                            {task.status === "evaluated" && (
                              <Button size="sm" className="mt-2 bg-primary hover:bg-blue-700">
                                Pay Now
                              </Button>
                            )}
                            {task.status === "completed" && task.completedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Completed: {new Date(task.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods (placeholder for future enhancement) */}
              {billingTasks.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Default Payment Method</p>
                          <p className="text-sm text-gray-500">•••• •••• •••• 4242</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Secure Payments</p>
                          <p className="text-sm text-blue-700">
                            All payments are processed securely. Your payment information is encrypted and protected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
