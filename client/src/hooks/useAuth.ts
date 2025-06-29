import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthData {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}
