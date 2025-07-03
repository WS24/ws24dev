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

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRouter } from "@/routes/router";

/**
 * Main application component with global providers
 * 
 * Provides:
 * - React Query client for server state management
 * - Theme provider for dark/light mode
 * - Tooltip provider for UI components
 * - Global toast notifications
 * - Centralized application routing with authentication
 * 
 * @returns JSX element containing the complete application
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ws24-theme">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
