import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Redirect to dashboard on successful auth
        setLocation("/dashboard");
      } else if (event === 'SIGNED_OUT') {
        // Redirect to home if signed out
        setLocation("/");
      }
    });

    // Check for session immediately in case it's already loaded
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLocation("/dashboard");
      } else {
        setLocation("/sign-in");
      }
    });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-bronze/5">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-bronze mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
