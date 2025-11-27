import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    // We define the fetch function explicitly to ensure 401s are handled safely
    queryFn: async () => {
      try {
        // Get the Supabase JWT token for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: HeadersInit = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const res = await fetch("/api/auth/user", { headers });
        
        // If 401 (Unauthorized), just return null. DO NOT THROW ERROR.
        if (res.status === 401) {
          return null;
        }

        // If any other error (500, etc), return null to prevent crashes
        if (!res.ok) {
          return null;
        }

        return await res.json();
      } catch (error) {
        // If network fails completely, assume guest
        return null;
      }
    },
    retry: false,                // STOP retrying on error
    refetchOnWindowFocus: false, // STOP refetching when you click the window
    staleTime: 5 * 60 * 1000,    // CACHE result for 5 mins (Stops the infinite loop)
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
  };
}