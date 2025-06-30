import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navigation } from "@/components/layout/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Shield, 
  Users, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  ListTodo,
  UserPlus,
  Wallet,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Edit,
  Save
} from "lucide-react";

interface AdminStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalUsers: number;
  totalSpecialists: number;
  totalClients: number;
  totalRevenue: string;
  platformMarkupRate: string;
  pendingPayments: number;
  activeAssignments: number;
}

interface BalanceAdjustment {
  id: number;
  userId: string;
  adminId: string;
  amount: string;
  previousBalance: string;
  newBalance: string;
  reason: string;
  type: string;
  createdAt: string;
}

interface PlatformSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedUserId, setSelectedUserId] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});

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

  // Check admin access
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  // Fetch admin dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    retry: false,
    enabled: !!user && user.role === "admin",
  });

  // Fetch all users
  const { data: users } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
    enabled: !!user && user.role === "admin",
  });

  // Fetch all tasks
  const { data: tasks } = useQuery<any[]>({
    queryKey: ["/api/admin/tasks"],
    retry: false,
    enabled: !!user && user.role === "admin",
  });

  // Fetch specialists
  const specialists = users?.filter(u => u.role === "specialist") || [];

  // Fetch balance adjustments
  const { data: adjustments } = useQuery<BalanceAdjustment[]>({
    queryKey: ["/api/admin/balance-adjustments"],
    retry: false,
    enabled: !!user && user.role === "admin",
  });

  // Fetch platform settings
  const { data: settings } = useQuery<PlatformSetting[]>({
    queryKey: ["/api/admin/platform-settings"],
    retry: false,
    enabled: !!user && user.role === "admin",
  });

  // Balance adjustment mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/adjust-balance", {
        userId: selectedUserId,
        amount: adjustmentAmount,
        reason: adjustmentReason,
        type: adjustmentType,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance adjusted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/balance-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUserId("");
      setAdjustmentAmount("");
      setAdjustmentReason("");
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
        description: "Failed to adjust balance. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Task assignment mutation
  const assignTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/assign-task", {
        taskId: parseInt(selectedTaskId),
        specialistId: selectedSpecialistId,
        notes: assignmentNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task assigned successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
      setSelectedTaskId("");
      setSelectedSpecialistId("");
      setAssignmentNotes("");
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
        description: "Failed to assign task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Platform settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/admin/platform-settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Setting updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
      setEditingSettings({});
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
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleBalanceAdjustment = () => {
    if (!selectedUserId || !adjustmentAmount || !adjustmentReason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    adjustBalanceMutation.mutate();
  };

  const handleTaskAssignment = () => {
    if (!selectedTaskId || !selectedSpecialistId) {
      toast({
        title: "Error",
        description: "Please select both task and specialist",
        variant: "destructive",
      });
      return;
    }
    assignTaskMutation.mutate();
  };

  const handleSettingUpdate = (key: string) => {
    const value = editingSettings[key];
    if (value !== undefined) {
      updateSettingMutation.mutate({ key, value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
                  <p className="text-gray-600">Complete control over platform operations</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{stats.totalSpecialists} Specialists</Badge>
                          <Badge variant="secondary">{stats.totalClients} Clients</Badge>
                        </div>
                      </div>
                      <Users className="w-8 h-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{stats.activeTasks} Active</Badge>
                          <Badge variant="secondary">{stats.completedTasks} Completed</Badge>
                        </div>
                      </div>
                      <ListTodo className="w-8 h-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{stats.pendingPayments} Pending</Badge>
                        </div>
                      </div>
                      <DollarSign className="w-8 h-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Platform Markup</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.platformMarkupRate}%</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{stats.activeAssignments} Assignments</Badge>
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Tabs */}
            <Tabs defaultValue="balance" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="balance">Balance Management</TabsTrigger>
                <TabsTrigger value="assignments">Task Assignments</TabsTrigger>
                <TabsTrigger value="settings">Platform Settings</TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TabsList>

              {/* Balance Management Tab */}
              <TabsContent value="balance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Adjust User Balance</CardTitle>
                    <CardDescription>
                      Manually adjust user balances with audit logging
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select User</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users?.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email} - Balance: ${user.balance || '0.00'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Adjustment Type</Label>
                        <Select value={adjustmentType} onValueChange={(value: "credit" | "debit") => setAdjustmentType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit">Credit (Add Funds)</SelectItem>
                            <SelectItem value="debit">Debit (Remove Funds)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Reason</Label>
                        <Input
                          placeholder="Enter reason for adjustment"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleBalanceAdjustment}
                      disabled={adjustBalanceMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Apply Adjustment
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Adjustments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Balance Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adjustments && adjustments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Balance Change</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Admin</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adjustments.map(adj => (
                              <TableRow key={adj.id}>
                                <TableCell>{new Date(adj.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{adj.userId}</TableCell>
                                <TableCell>
                                  <Badge variant={adj.type === 'credit' ? 'default' : 'destructive'}>
                                    {adj.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>${adj.amount}</TableCell>
                                <TableCell>
                                  ${adj.previousBalance} → ${adj.newBalance}
                                </TableCell>
                                <TableCell>{adj.reason}</TableCell>
                                <TableCell>{adj.adminId}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No balance adjustments yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Task Assignments Tab */}
              <TabsContent value="assignments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Assign Task to Specialist</CardTitle>
                    <CardDescription>
                      Manually assign tasks to specialists for evaluation and execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select Task</Label>
                        <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a task" />
                          </SelectTrigger>
                          <SelectContent>
                            {tasks?.filter(t => t.status === 'created' || !t.specialistId).map(task => (
                              <SelectItem key={task.id} value={task.id.toString()}>
                                {task.title} - {task.status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Specialist</Label>
                        <Select value={selectedSpecialistId} onValueChange={setSelectedSpecialistId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a specialist" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialists.map(spec => (
                              <SelectItem key={spec.id} value={spec.id}>
                                {spec.email} - {spec.specialization || 'General'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Assignment Notes (Optional)</Label>
                        <Textarea
                          placeholder="Add any special instructions or notes"
                          value={assignmentNotes}
                          onChange={(e) => setAssignmentNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleTaskAssignment}
                      disabled={assignTaskMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Task
                    </Button>
                  </CardContent>
                </Card>

                {/* Active Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Task Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tasks && tasks.filter(t => t.specialistId).length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Specialist</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tasks.filter(t => t.specialistId).map(task => (
                              <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>{task.clientId}</TableCell>
                                <TableCell>{task.specialistId}</TableCell>
                                <TableCell>
                                  <Badge>{task.status}</Badge>
                                </TableCell>
                                <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No active assignments</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platform Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                    <CardDescription>
                      Configure global platform settings and markup rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {settings && settings.map(setting => (
                        <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{setting.key.replace(/_/g, ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {editingSettings[setting.key] !== undefined ? (
                              <>
                                <Input
                                  value={editingSettings[setting.key]}
                                  onChange={(e) => setEditingSettings({
                                    ...editingSettings,
                                    [setting.key]: e.target.value
                                  })}
                                  className="w-32"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSettingUpdate(setting.key)}
                                  disabled={updateSettingMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newSettings = { ...editingSettings };
                                    delete newSettings[setting.key];
                                    setEditingSettings(newSettings);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="font-mono">{setting.value}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSettings({
                                    ...editingSettings,
                                    [setting.key]: setting.value
                                  })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {(!settings || settings.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No platform settings configured</p>
                          <Button
                            className="mt-4"
                            onClick={() => updateSettingMutation.mutate({
                              key: 'platform_markup_rate',
                              value: '50'
                            })}
                          >
                            Initialize Default Settings
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Audit Log Tab */}
              <TabsContent value="audit" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Audit Log</CardTitle>
                    <CardDescription>
                      Track all administrative actions and system changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 border rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">Balance Adjustment</p>
                          <p className="text-sm text-gray-600">Admin adjusted user balance by $50.00</p>
                        </div>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                      </div>

                      <div className="flex items-center p-4 border rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">Task Assignment</p>
                          <p className="text-sm text-gray-600">Admin assigned task to specialist</p>
                        </div>
                        <span className="text-sm text-gray-500">5 hours ago</span>
                      </div>

                      <div className="flex items-center p-4 border rounded-lg">
                        <Settings className="w-5 h-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">Settings Update</p>
                          <p className="text-sm text-gray-600">Platform markup rate changed to 50%</p>
                        </div>
                        <span className="text-sm text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}