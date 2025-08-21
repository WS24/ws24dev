import { Route } from "wouter";
import { AdminLayout } from "@/components/layouts/admin-layout";

interface AdminRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function AdminRoute({ path, component: Component }: AdminRouteProps) {
  return (
    <Route
      path={path}
      component={(props) => (
        <AdminLayout>
          <Component {...props} />
        </AdminLayout>
      )}
    />
  );
}
