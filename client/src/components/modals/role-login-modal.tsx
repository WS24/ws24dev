import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  Briefcase, 
  UserCheck, 
  LogIn, 
  CheckCircle, 
  DollarSign, 
  Settings, 
  Users, 
  ClipboardList,
  FileText,
  Calculator,
  Zap,
  Shield
} from "lucide-react";

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleLoginModal({ isOpen, onClose }: RoleLoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleLogin = (role?: string) => {
    // Store the intended role in sessionStorage for post-login routing
    if (role) {
      sessionStorage.setItem('intended_role', role);
    }
    // Redirect to the authentication endpoint
    window.location.href = "/api/login";
  };

  const roleData = {
    client: {
      title: "Client",
      description: "Need web development services? Start here.",
      icon: <UserCheck className="w-8 h-8 text-green-600" />,
      color: "green",
      capabilities: [
        "Create and manage project tasks",
        "Review specialist evaluations",
        "Make secure payments", 
        "Track project progress",
        "Communicate requirements",
        "Access billing dashboard"
      ],
      workflow: "Post your project → Review estimates → Make payment → Get results"
    },
    specialist: {
      title: "Specialist", 
      description: "Web development expert? Join our network.",
      icon: <Briefcase className="w-8 h-8 text-blue-600" />,
      color: "blue",
      capabilities: [
        "Evaluate client tasks",
        "Provide cost estimates",
        "Execute development work",
        "Earn 50% of task value",
        "Build your reputation",
        "Access pending tasks"
      ],
      workflow: "Review tasks → Provide estimates → Execute work → Get paid"
    },
    admin: {
      title: "Administrator",
      description: "Manage the platform and oversee operations.",
      icon: <Crown className="w-8 h-8 text-purple-600" />,
      color: "purple", 
      capabilities: [
        "Full system access",
        "Assign tasks to specialists",
        "Manage user accounts",
        "Configure system settings",
        "View analytics dashboard",
        "Adjust user balances"
      ],
      workflow: "Oversee operations → Manage assignments → Configure platform → Monitor performance"
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-primary" />
            Choose Your Role
          </DialogTitle>
          <DialogDescription className="text-lg">
            Welcome to WS24 Dev - Web Development Services Platform. 
            Select your role to understand how you can use our platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(roleData).map(([role, data]) => (
              <Card 
                key={role}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRole === role 
                    ? `ring-2 ring-${data.color}-500 bg-${data.color}-50` 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2">
                    {data.icon}
                  </div>
                  <CardTitle className="text-xl">{data.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    {data.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Key Capabilities
                    </h4>
                    <ul className="space-y-1">
                      {data.capabilities.map((capability, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Workflow
                    </h4>
                    <p className="text-sm text-gray-600 italic">
                      {data.workflow}
                    </p>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    variant={selectedRole === role ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRole(role);
                    }}
                  >
                    {selectedRole === role ? "Selected" : `Choose ${data.title}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Role Details */}
          {selectedRole && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {roleData[selectedRole as keyof typeof roleData].icon}
                  Get Started as a {roleData[selectedRole as keyof typeof roleData].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What happens next:</h4>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
                        You'll be redirected to secure authentication
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
                        Complete your profile setup
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
                        Access your {roleData[selectedRole as keyof typeof roleData].title.toLowerCase()} dashboard
                      </li>
                    </ol>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => handleLogin(selectedRole)}
                      className="flex-1"
                      size="lg"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login as {roleData[selectedRole as keyof typeof roleData].title}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedRole(null)}
                      size="lg"
                    >
                      Back to Roles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform Benefits */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-center">Why Choose WS24 Dev?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Secure & Reliable</h4>
                  <p className="text-sm text-gray-600">
                    Enterprise-grade security with transparent transactions and progress tracking
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Fair Compensation</h4>
                  <p className="text-sm text-gray-600">
                    Specialists earn 50% of task value with transparent pricing and instant payments
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Professional Tools</h4>
                  <p className="text-sm text-gray-600">
                    Complete project management suite with analytics and communication tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Login Option */}
          {!selectedRole && (
            <div className="text-center space-y-4">
              <Separator />
              <div>
                <p className="text-gray-600 mb-4">
                  Already have an account? Login with your existing credentials.
                </p>
                <Button 
                  onClick={() => handleLogin()}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  General Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
