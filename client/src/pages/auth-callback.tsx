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
        // Exchange the OAuth code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (exchangeError) {
          console.error('[Auth Callback] Exchange error:', exchangeError);
          setError(exchangeError.message);
          setTimeout(() => setLocation("/sign-in"), 2000);
          return;
        }

        // Session established successfully
        if (data?.session) {
          console.log('[Auth Callback] Session established:', data.session.user.email);
          setLocation("/dashboard");
        } else {
          // No session after exchange
          console.warn('[Auth Callback] No session after exchange');
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
