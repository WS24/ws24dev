import { Switch, Route } from "wouter";
import { AdminRoute } from "@/routes/admin-route";

// Core pages
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";

// Admin pages
import Admin from "@/pages/admin";
import AdminUsers from "@/pages/admin-users";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminDemo from "@/pages/admin-demo";

// Other feature pages
import ClientDashboard from "@/pages/client-dashboard";
import SpecialistDashboard from "@/pages/specialist-dashboard";
import Assignments from "@/pages/assignments";
import Tasks from "@/pages/tasks";
import TaskView from "@/pages/task-view";
import Evaluations from "@/pages/evaluations";
import Announcements from "@/pages/announcements";
import Analytics from "@/pages/analytics";
import Notifications from "@/pages/notifications";
import KnowledgeBase from "@/pages/knowledge-base";
import Billing from "@/pages/billing";
import BillingPayments from "@/pages/billing-payments";
import StripeSettings from "@/pages/stripe-settings";
import SystemSettings from "@/pages/system-settings";
import TicketDetail from "@/pages/ticket-detail";
import TicketSettings from "@/pages/ticket-settings";
import UserRoles from "@/pages/user-roles";
import RoleDemo from "@/pages/role-demo";

// Minimal app router using wouter
export function AppRouter() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/roles" component={RoleDemo} />

      {/* Core */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />

      {/* Admin - wrapped in AdminLayout */}
      <AdminRoute path="/admin" component={Admin} />
      <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin/demo" component={AdminDemo} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/roles" component={UserRoles} />

      {/* Client/Specialist */}
      <Route path="/client" component={ClientDashboard} />
      <Route path="/specialist" component={SpecialistDashboard} />

      {/* Workflows - admin-accessible pages */}
      <AdminRoute path="/assignments" component={Assignments} />
      <AdminRoute path="/tasks" component={Tasks} />
      <Route path="/tasks/:id" component={TaskView} />
      <AdminRoute path="/evaluations" component={Evaluations} />

      {/* Content/Comms - admin pages */}
      <AdminRoute path="/announcements" component={Announcements} />
      <AdminRoute path="/analytics" component={Analytics} />
      <AdminRoute path="/notifications" component={Notifications} />
      <AdminRoute path="/knowledge-base" component={KnowledgeBase} />

      {/* Billing - admin pages */}
      <AdminRoute path="/billing" component={Billing} />
      <AdminRoute path="/billing/payments" component={BillingPayments} />
      <AdminRoute path="/billing/stripe" component={StripeSettings} />

      {/* Settings - admin pages */}
      <AdminRoute path="/settings/system" component={SystemSettings} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <AdminRoute path="/tickets/settings" component={TicketSettings} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

