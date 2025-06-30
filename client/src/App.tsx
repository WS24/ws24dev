/**
 * WS24 Dev - Main Application Component
 * 
 * Root component that configures routing, query client, and global providers.
 * Implements authentication-based routing with role-based access control.
 * 
 * @module App
 * @requires wouter - Lightweight routing library
 * @requires @tanstack/react-query - Server state management
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import SpecialistDashboard from "@/pages/specialist-dashboard";
import Tasks from "@/pages/tasks";
import Billing from "@/pages/billing";
import Assignments from "@/pages/assignments";
import AdminPanel from "@/pages/admin";
import AdminDemo from "@/pages/admin-demo";
import KnowledgeBase from "@/pages/knowledge-base";
import Announcements from "@/pages/announcements";
import Analytics from "@/pages/analytics";
import StripeSettings from "@/pages/stripe-settings";
import SystemSettings from "@/pages/system-settings";
import TicketSettings from "@/pages/ticket-settings";
import CreateTask from "@/pages/create-task";
import Evaluations from "@/pages/evaluations";
import Profile from "@/pages/profile";
import AdminUsers from "@/pages/admin-users";
import UserRoles from "@/pages/user-roles";
import AdminDashboard from "@/pages/admin-dashboard";
import TaskView from "@/pages/task-view";
import Notifications from "@/pages/notifications";
import NotFound from "@/pages/not-found";
import HelpdeskDashboard from "@/pages/helpdesk-dashboard";
import TicketDetail from "@/pages/ticket-detail";

/**
 * Application router with authentication-based route protection
 * 
 * Routes are conditionally rendered based on authentication status:
 * - Unauthenticated users see landing page
 * - Authenticated users access full application functionality
 * - 404 fallback for invalid routes
 * 
 * @returns JSX element containing route configuration
 */
function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/client-dashboard" component={ClientDashboard} />
          <Route path="/specialist-dashboard" component={SpecialistDashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/create-task" component={CreateTask} />
          <Route path="/assignments" component={Assignments} />
          <Route path="/evaluations" component={Evaluations} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/user-roles" component={UserRoles} />
          <Route path="/admin/settings" component={SystemSettings} />
          <Route path="/billing" component={Billing} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/stripe-settings" component={StripeSettings} />
          <Route path="/system-settings" component={SystemSettings} />
          <Route path="/ticket-settings" component={TicketSettings} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/admin-demo" component={AdminDemo} />
          <Route path="/profile" component={Profile} />
          <Route path="/tasks/:id" component={TaskView} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/helpdesk" component={HelpdeskDashboard} />
          <Route path="/tickets/:id" component={TicketDetail} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main application component with global providers
 * 
 * Provides:
 * - React Query client for server state management
 * - Tooltip provider for UI components
 * - Global toast notifications
 * - Application routing
 * 
 * @returns JSX element containing the complete application
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
