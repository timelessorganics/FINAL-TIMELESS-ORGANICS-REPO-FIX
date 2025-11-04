import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Mail } from "lucide-react";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithProvider = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`,
          skipBrowserRedirect: false,
          // Force Google account picker to show
          queryParams: provider === 'google' 
            ? { prompt: 'select_account' }
            : undefined,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Sign in error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        toast({
          title: "Check your email",
          description: "We sent you a confirmation link.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect to auth callback which handles dashboard redirect
        window.location.href = "/auth/callback";
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Sign up error" : "Sign in error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-bronze/5">
      <SmokeFireBackground />
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-md border-bronze/30 relative z-50">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2 bg-gradient-to-r from-bronze via-accent-gold to-patina bg-clip-text text-transparent">
            Timeless Organics
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* OAuth Providers */}
        <div className="mb-6 space-y-3">
          <Button
            onClick={() => signInWithProvider('google')}
            variant="outline"
            className="w-full"
            data-testid="button-google-signin"
          >
            <SiGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          <Button
            onClick={() => signInWithProvider('github')}
            variant="outline"
            className="w-full"
            data-testid="button-github-signin"
          >
            <SiGithub className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-password"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-bronze to-accent-gold"
            disabled={loading}
            data-testid="button-email-submit"
          >
            <Mail className="mr-2 h-4 w-4" />
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-toggle-signup"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
    </div>
  );
}
