import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the session from URL hash/params
        // with detectSessionInUrl: true in the client config
        
        // Wait a bit for Supabase to process the session
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if session was established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth Callback] Session error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => setLocation("/sign-in"), 2000);
          return;
        }

        // Session established successfully
        if (session) {
          console.log('[Auth Callback] Session established:', session.user.email);
          setLocation("/dashboard");
        } else {
          // No session found
          console.warn('[Auth Callback] No session found');
          setLocation("/sign-in");
        }
      } catch (err: any) {
        console.error('[Auth Callback] Error:', err);
        setError(err.message);
        setTimeout(() => setLocation("/sign-in"), 2000);
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-bronze/5">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-destructive mb-4">Authentication error: {error}</p>
            <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-bronze mx-auto mb-4" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
