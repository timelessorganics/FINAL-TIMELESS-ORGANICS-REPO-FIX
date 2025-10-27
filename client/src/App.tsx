import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import MainLaunch from "@/pages/main-launch";
import MarketingLanding from "@/pages/marketing-landing";
import SculptureGallery from "@/pages/sculpture-gallery";
import Dashboard from "@/pages/dashboard";
import AdminPanel from "@/pages/admin-panel";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";


function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Payment result pages - accessible without authentication */}
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      
      {/* Marketing Landing Page - Root */}
      <Route path="/" component={MarketingLanding} />
      
      {/* Founding 100 Launch Page - PUBLIC */}
      <Route path="/founding100" component={MainLaunch} />
      
      {isAuthenticated && (
        <>
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
