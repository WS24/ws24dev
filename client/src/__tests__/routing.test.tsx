import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'wouter/memory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';
import '@testing-library/jest-dom';

// Import components
import Dashboard from '@/pages/dashboard';
import AdminUsers from '@/pages/admin-users';
import AdminPanel from '@/pages/admin';
import Profile from '@/pages/profile';
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';

// Mock authentication hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@test.com', role: 'admin' },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

// Mock query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

const createTestWrapper = (initialEntries: string[]) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Routing Tests', () => {
  describe('Core Page Routes', () => {
    test('renders Dashboard at root path', () => {
      const TestWrapper = createTestWrapper(['/']);
      
      render(
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    test('renders Admin Users page at /admin/users', () => {
      const TestWrapper = createTestWrapper(['/admin/users']);
      
      render(
        <Switch>
          <Route path="/admin/users" component={AdminUsers} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/user management/i)).toBeInTheDocument();
    });

    test('renders Admin Panel at /admin', () => {
      const TestWrapper = createTestWrapper(['/admin']);
      
      render(
        <Switch>
          <Route path="/admin" component={AdminPanel} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
    });

    test('renders Profile page at /profile', () => {
      const TestWrapper = createTestWrapper(['/profile']);
      
      render(
        <Switch>
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/user profile/i)).toBeInTheDocument();
    });
  });

  describe('404 Error Handling', () => {
    test('renders NotFound page for invalid routes', () => {
      const TestWrapper = createTestWrapper(['/invalid-route']);
      
      render(
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/admin" component={AdminPanel} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });

    test('renders NotFound for nested invalid admin routes', () => {
      const TestWrapper = createTestWrapper(['/admin/invalid']);
      
      render(
        <Switch>
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });
  });

  describe('Authentication-based Routing', () => {
    test('shows landing page for unauthenticated users', () => {
      // Mock unauthenticated state
      jest.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }),
      }));

      const TestWrapper = createTestWrapper(['/']);
      
      render(
        <Switch>
          <Route path="/" component={Landing} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Integrity', () => {
    test('admin routes are properly separated', () => {
      const TestWrapper = createTestWrapper(['/admin/users']);
      
      render(
        <Switch>
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      // Should render AdminUsers, not AdminPanel
      expect(screen.getByText(/user management/i)).toBeInTheDocument();
      expect(screen.queryByText(/task management/i)).not.toBeInTheDocument();
    });

    test('routes handle trailing slashes correctly', () => {
      const TestWrapper = createTestWrapper(['/admin/']);
      
      render(
        <Switch>
          <Route path="/admin" component={AdminPanel} />
          <Route component={NotFound} />
        </Switch>,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
    });
  });
});