import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import MainLaunch from "@/pages/main-launch";
import SculptureGallery from "@/pages/sculpture-gallery";
import Dashboard from "@/pages/dashboard";
import AdminPanel from "@/pages/admin-panel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LandingPage() {
  return (
    <>
      <div className="bg-aloe" />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="relative z-10 w-full max-w-[720px] mx-4 bg-card/90 border-border backdrop-blur-md p-7">
          <div className="text-center mb-6">
            <div className="kicker mb-3" data-testid="text-kicker">
              FOUNDING 100 INVESTOR LAUNCH
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
              <span className="moving-fill">Your Investment</span> is Our Investment
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
              Welcome to Timeless Organics. Please sign in to access the founding investor portal
              and secure your exclusive seat.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="w-full btn-bronze font-bold py-6 text-lg"
              data-testid="button-login"
            >
              <span className="moving-fill">Sign In with Replit</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Limited to 100 founding seats. Sign in to begin your investment journey.
          </p>
        </Card>
      </div>
    </>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          {/* Main Launch Page */}
          <Route path="/" component={MainLaunch} />
          
          {/* Sculpture Gallery */}
          <Route path="/sculpture-selection/:purchaseId">
            {(params) => <SculptureGallery purchaseId={params.purchaseId} />}
          </Route>
          
          {/* User Dashboard */}
          <Route path="/dashboard" component={Dashboard} />
          
          {/* Admin Panel - Protected for admins only */}
          <Route path="/admin">
            {user?.isAdmin ? <AdminPanel /> : <NotFound />}
          </Route>
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Force dark mode for Timeless Organics aesthetic
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
