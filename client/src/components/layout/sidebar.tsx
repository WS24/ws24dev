import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Home, 
  CheckSquare, 
  Plus, 
  CreditCard, 
  ClipboardList, 
  Calculator,
  Settings,
  Users,
  Shield,
  BookOpen,
  Megaphone,
  DollarSign,
  BarChart3
} from "lucide-react";
import { useLocation, Link } from "wouter";

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badge?: number;
  isActive?: boolean;
}

function SidebarLink({ href, icon: Icon, children, badge, isActive }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <span
        className={cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer",
          isActive
            ? "bg-primary text-white"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon className="mr-3 w-5 h-5" />
        {children}
        {badge !== undefined && badge > 0 && (
          <Badge 
            variant={isActive ? "secondary" : "outline"} 
            className="ml-auto text-xs px-2 py-1"
          >
            {badge}
          </Badge>
        )}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: stats } = useQuery<{
    activeTasks: string;
    completedTasks: string;
    pendingTasks: string;
    assignedTasks?: string;
    pendingEvaluations?: string;
  }>({
    queryKey: ["/api/stats"],
    retry: false,
    enabled: !!user,
  });

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-4">
        <div className="space-y-1">
          <SidebarLink 
            href="/" 
            icon={Home} 
            isActive={isActive("/")}
          >
            Dashboard
          </SidebarLink>
          
          <SidebarLink 
            href="/tasks" 
            icon={CheckSquare}
            badge={user.role === "client" ? parseInt(stats?.activeTasks || "0") : undefined}
            isActive={isActive("/tasks")}
          >
            My Tasks
          </SidebarLink>
          
          {user.role === "client" && (
            <>
              <SidebarLink 
                href="/create-task" 
                icon={Plus}
                isActive={isActive("/create-task")}
              >
                Create Task
              </SidebarLink>
              
            </>
          )}
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Billing & Finance
            </p>
            
            <SidebarLink 
              href="/billing" 
              icon={DollarSign}
              isActive={isActive("/billing")}
            >
              Finance Dashboard
            </SidebarLink>
            
            <SidebarLink 
              href="/analytics" 
              icon={BarChart3}
              isActive={isActive("/analytics")}
            >
              Analytics
            </SidebarLink>
            
            <SidebarLink 
              href="/stripe-settings" 
              icon={CreditCard}
              isActive={isActive("/stripe-settings")}
            >
              Payment Settings
            </SidebarLink>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Settings
            </p>
            
            <SidebarLink 
              href="/system-settings" 
              icon={Settings}
              isActive={isActive("/system-settings")}
            >
              System Settings
            </SidebarLink>
          </div>
          
          {user?.role === "client" && (
            <>
            </>
          )}
          
          {user.role === "specialist" && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  Specialist Tools
                </p>
                
                <SidebarLink 
                  href="/assignments" 
                  icon={ClipboardList}
                  badge={parseInt(stats?.assignedTasks || "0")}
                  isActive={isActive("/assignments")}
                >
                  Assignments
                </SidebarLink>
                
                <SidebarLink 
                  href="/evaluations" 
                  icon={Calculator}
                  badge={parseInt(stats?.pendingEvaluations || "0")}
                  isActive={isActive("/evaluations")}
                >
                  Evaluations
                </SidebarLink>
              </div>
            </>
          )}
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Resources
            </p>
            
            <SidebarLink 
              href="/knowledge-base" 
              icon={BookOpen}
              isActive={isActive("/knowledge-base")}
            >
              Knowledge Base
            </SidebarLink>
            
            <SidebarLink 
              href="/announcements" 
              icon={Megaphone}
              isActive={isActive("/announcements")}
            >
              Announcements
            </SidebarLink>
          </div>

          {user.role === "admin" && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  Admin Panel
                </p>
                
                <SidebarLink 
                  href="/admin" 
                  icon={Shield}
                  isActive={isActive("/admin")}
                >
                  Admin Panel
                </SidebarLink>
                
                <SidebarLink 
                  href="/admin/users" 
                  icon={Users}
                  isActive={isActive("/admin/users")}
                >
                  Users
                </SidebarLink>
                
                <SidebarLink 
                  href="/admin/settings" 
                  icon={Settings}
                  isActive={isActive("/admin/settings")}
                >
                  Settings
                </SidebarLink>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
