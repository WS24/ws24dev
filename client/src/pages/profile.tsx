import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, DollarSign, Users, MapPin, Calendar, Shield, Settings, Key, Bell } from "lucide-react";

const ProfileMenu = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => (
  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
    <Button
      variant={activeTab === "profile" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("profile")}
      className="flex items-center gap-2"
    >
      <User className="h-4 w-4" />
      Profile
    </Button>
    <Button
      variant={activeTab === "account" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("account")}
      className="flex items-center gap-2"
    >
      <Settings className="h-4 w-4" />
      Account
    </Button>
    <Button
      variant={activeTab === "security" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("security")}
      className="flex items-center gap-2"
    >
      <Shield className="h-4 w-4" />
      Security
    </Button>
    <Button
      variant={activeTab === "notifications" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("notifications")}
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      Notifications
    </Button>
    <Button
      variant={activeTab === "billing" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("billing")}
      className="flex items-center gap-2"
    >
      <DollarSign className="h-4 w-4" />
      Billing
    </Button>
  </div>
);

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    role: "client",
    balance: "0.00",
    isActive: true,
    clientNotes: "",
    userGroups: "Users",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bio: user.bio || "",
        role: user.role || "client",
        balance: user.balance || "0.00",
        isActive: user.isActive !== false,
        clientNotes: user.clientNotes || "",
        userGroups: user.userGroups || "Users",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Пользователь не найден</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account settings</p>
      </div>

      {/* Profile Menu */}
      <ProfileMenu activeTab={activeTab} onTabChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your profile's core data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="flex items-center gap-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="a2media"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About Me</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="balance">Account Balance</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="balance"
                  value={formData.balance}
                  onChange={(e) => handleInputChange("balance", e.target.value)}
                  placeholder="0.00"
                />
                <Badge variant="secondary">$</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{user?.ipAddress || "172.68.244.5"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : "07/04/2018"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US') : "06/02/2025"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userGroups">User Groups</Label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <Input
                    id="userGroups"
                    value={formData.userGroups}
                    onChange={(e) => handleInputChange("userGroups", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label htmlFor="isActive">Activate User Account</Label>
                <p className="text-sm text-muted-foreground">
                  Enable/disable system access
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Client Access & Notes</CardTitle>
            <CardDescription>
              Special instructions for project work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientNotes">Notes</Label>
              <Textarea
                id="clientNotes"
                value={formData.clientNotes}
                onChange={(e) => handleInputChange("clientNotes", e.target.value)}
                rows={4}
                placeholder="ALWAYS COMMENT CODE!! EXAMPLE:&#10;<!-- Task: #3179 Date... -->&#10;/* Task: #3179 Date... */"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="min-w-32"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}