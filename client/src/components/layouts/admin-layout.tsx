import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  BarChart3,
  CreditCard,
  Bell,
  FileText,
  HelpCircle,
  Shield,
  Ticket,
  UserCog,
  Database,
  Menu,
  X,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "System overview and statistics",
  },
  {
    label: "Extended Dashboard",
    href: "/admin/dashboard",
    icon: Shield,
    description: "Full administrative panel",
  },
  {
    label: "Demo Panel",
    href: "/admin/demo",
    icon: Database,
    description: "Demo version",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Users, roles and access permissions",
  },
  {
    label: "Role Management",
    href: "/admin/roles",
    icon: UserCog,
    description: "Role and permission settings",
  },
  {
    label: "Tasks & Tickets",
    href: "/tasks",
    icon: CheckSquare,
    description: "System task management",
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: FileText,
    description: "Task assignment to specialists",
  },
  {
    label: "Evaluations",
    href: "/evaluations",
    icon: BarChart3,
    description: "View and manage evaluations",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Reports and analytical data",
  },
  {
    label: "Finance",
    href: "/billing",
    icon: CreditCard,
    description: "Payment and revenue management",
    children: [
      {
        label: "Payments",
        href: "/billing/payments",
        icon: CreditCard,
        description: "Payment history",
      },
      {
        label: "Stripe Settings",
        href: "/billing/stripe",
        icon: Settings,
        description: "Payment system configuration",
      },
    ],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "System notifications",
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Bell,
    description: "Announcement management",
  },
  {
    label: "Knowledge Base",
    href: "/knowledge-base",
    icon: HelpCircle,
    description: "Articles and documentation",
  },
  {
    label: "Settings",
    href: "/settings/system",
    icon: Settings,
    description: "System settings",
    children: [
      {
        label: "System Settings",
        href: "/settings/system",
        icon: Settings,
        description: "General system settings",
      },
      {
        label: "Ticket Settings",
        href: "/tickets/settings",
        icon: Ticket,
        description: "Ticket system configuration",
      },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Redirect to login if not authenticated
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

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin" && location === "/admin") return true;
    if (href !== "/admin" && location.startsWith(href)) return true;
    return false;
  };

  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.children?.some(child => isActive(child.href)) || false;
  };

  const handleLogout = async () => {
    try {
      // Clear any client-side state first
      if (typeof window !== 'undefined') {
        // Clear localStorage/sessionStorage if needed
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Redirect to logout endpoint
      window.location.href = "/api/logout";
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just redirect to home
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">This page is only available to administrators.</p>
          <Button onClick={() => window.location.href = "/"}>
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-80" : "w-16"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">WS24 Dev</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Balance: ${user.balance || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.href}>
                <div className="relative">
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-3",
                        isParentActive(item) 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "hover:bg-gray-100",
                        !sidebarOpen && "px-3"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", sidebarOpen && "mr-3")} />
                      {sidebarOpen && (
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.children && (
                              <ChevronRight 
                                className={cn(
                                  "w-4 h-4 transition-transform",
                                  expandedItems.includes(item.href) && "transform rotate-90"
                                )}
                              />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      )}
                      {item.badge && sidebarOpen && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  {item.children && sidebarOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => toggleExpanded(item.href)}
                    >
                      <ChevronRight 
                        className={cn(
                          "w-4 h-4 transition-transform",
                          expandedItems.includes(item.href) && "transform rotate-90"
                        )}
                      />
                    </Button>
                  )}
                </div>

                {/* Submenu */}
                {item.children && sidebarOpen && expandedItems.includes(item.href) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-auto p-2 text-sm",
                            isActive(child.href) 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "hover:bg-gray-100 text-gray-600"
                          )}
                        >
                          <child.icon className="w-4 h-4 mr-2" />
                          <div className="flex-1 text-left">
                            <span className="text-sm">{child.label}</span>
                            {child.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{child.description}</p>
                            )}
                          </div>
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="space-y-2">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Home className="w-4 h-4 mr-2" />
                  User Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="w-full p-2">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find(item => 
                    isActive(item.href) || item.children?.some(child => isActive(child.href))
                  )?.label || "Admin Panel"}
                </h1>
                <p className="text-sm text-gray-600">
                  {navigationItems.find(item => 
                    isActive(item.href) || item.children?.some(child => isActive(child.href))
                  )?.description || "WS24 Dev System Management"}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Online: {new Date().toLocaleTimeString()}
              </Badge>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
