import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
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
import CreateTask from "@/pages/create-task";
import Evaluations from "@/pages/evaluations";
import Profile from "@/pages/profile";
import AdminUsers from "@/pages/admin-users";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/create-task" component={CreateTask} />
          <Route path="/assignments" component={Assignments} />
          <Route path="/evaluations" component={Evaluations} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/settings" component={SystemSettings} />
          <Route path="/billing" component={Billing} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/stripe-settings" component={StripeSettings} />
          <Route path="/system-settings" component={SystemSettings} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/admin-demo" component={AdminDemo} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

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
