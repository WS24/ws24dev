import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Search, Edit, Save, X, UserCheck, UserX, Crown, Briefcase } from "lucide-react";
interface UserRole {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
export default function UserRoles() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const queryClient = useQueryClient();
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
        description: "Admin access required to manage user roles.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<UserRole[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
    enabled: !!user && user.role === "admin",
  });
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully!",
      });
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Failed to update user role. Please try again.",
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
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4" />;
      case "specialist":
        return <Briefcase className="w-4 h-4" />;
      case "client":
        return <UserCheck className="w-4 h-4" />;
      case "blocked":
        return <UserX className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };
  const getRoleBadge = (role: string) => {
    const baseClasses = "flex items-center space-x-1";
    switch (role) {
      case "admin":
        return (
          <Badge className={`${baseClasses} bg-purple-100 text-purple-800`}>
            {getRoleIcon(role)}
            <span>Admin</span>
          </Badge>
        );
      case "specialist":
        return (
          <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}>
            {getRoleIcon(role)}
            <span>Специалист</span>
          </Badge>
        );
      case "client":
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800`}>
            {getRoleIcon(role)}
            <span>Заказчик</span>
          </Badge>
        );
      case "blocked":
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800`}>
            {getRoleIcon(role)}
            <span>Заблокирован</span>
          </Badge>
        );
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {getRoleIcon(role)}
            <span>{role}</span>
          </Badge>
        );
    }
  };
  const filteredUsers = users ? users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];
  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUser(userId);
    setSelectedRole(currentRole);
  };
  const handleSaveRole = (userId: string) => {
    if (selectedRole && selectedRole !== users?.find(u => u.id === userId)?.role) {
      updateRoleMutation.mutate({ userId, role: selectedRole });
    } else {
      setEditingUser(null);
    }
  };
  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole("");
  };
  return (
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Roles</h1>
                  <p className="text-gray-600">Manage user roles and permissions</p>
                </div>
              </div>
            </div>
            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Role Descriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-purple-800">Admin</h3>
                        <p className="text-sm text-gray-600">
                          Full system access. Can assign tasks to specialists, manage users, and configure system settings.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-800">Специалист</h3>
                        <p className="text-sm text-gray-600">
                          Evaluates tasks, provides estimates, executes work, and earns 50% of task value upon completion.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">Заказчик</h3>
                        <p className="text-sm text-gray-600">
                          Creates tasks, reviews specialist evaluations, makes payments, and communicates requirements.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <UserX className="w-5 h-5 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-red-800">Заблокирован</h3>
                        <p className="text-sm text-gray-600">
                          Account suspended. No access to any system functionality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Users Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Current Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((userItem) => (
                          <TableRow key={userItem.id}>
                            <TableCell>
                              <div className="font-medium">
                                {userItem.firstName || userItem.lastName 
                                  ? `${userItem.firstName || ''} ${userItem.lastName || ''}`.trim()
                                  : userItem.id
                                }
                              </div>
                            </TableCell>
                            <TableCell>{userItem.email || userItem.id}</TableCell>
                            <TableCell>
                              {editingUser === userItem.id ? (
                                <div className="flex items-center space-x-2">
                                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="specialist">Специалист</SelectItem>
                                      <SelectItem value="client">Заказчик</SelectItem>
                                      <SelectItem value="blocked">Заблокирован</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveRole(userItem.id)}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                getRoleBadge(userItem.role)
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {editingUser !== userItem.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRole(userItem.id, userItem.role)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit Role
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Workflow Information */}
            <Card>
              <CardHeader>
                <CardTitle>Task Workflow & Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                      <h4 className="font-semibold">Task Assignment</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Admin assigns client tasks to specialists for evaluation
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold">2</span>
                      </div>
                      <h4 className="font-semibold">Evaluation</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Specialist provides cost estimate and timeline
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">3</span>
                      </div>
                      <h4 className="font-semibold">Execution</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      After payment, specialist executes task using comments
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">4</span>
                      </div>
                      <h4 className="font-semibold">Completion</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Specialist earns 50% of task value upon completion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}