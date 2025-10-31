import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(true);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setSupabaseLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      setSupabaseLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from our database
  const { data: user, isLoading: dbLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !!supabaseUser, // Only fetch if Supabase user exists
  });

  const isLoading = supabaseLoading || (!!supabaseUser && dbLoading);
  const isAuthenticated = !!supabaseUser && !!user;

  return {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated,
  };
}
