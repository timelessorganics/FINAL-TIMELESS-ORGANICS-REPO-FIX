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
import CheckoutPage from "@/pages/checkout";
import RedeemCodePage from "@/pages/redeem-code";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Waiver from "@/pages/waiver";
import WallOfLeaves from "@/pages/wall-of-leaves";


function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();
  
  // Scroll to top on route change, or to hash anchor if present
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove # from hash
    
    if (hash) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      
      {/* Checkout Pages - PUBLIC */}
      <Route path="/checkout/founder">
        {() => <CheckoutPage seatType="founder" />}
      </Route>
      <Route path="/checkout/patron">
        {() => <CheckoutPage seatType="patron" />}
      </Route>
      
      {/* Promo Code Redemption - PUBLIC */}
      <Route path="/redeem" component={RedeemCodePage} />
      
      {/* Legal Pages - PUBLIC */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/waiver" component={Waiver} />
      
      {/* Wall of Leaves - PUBLIC */}
      <Route path="/wall-of-leaves" component={WallOfLeaves} />
      
      {/* Sculpture/Cutting Gallery - Can view without purchase */}
      <Route path="/sculptures" component={SculptureGallery} />
      
      {isAuthenticated && (
        <>
          {/* Sculpture Selection with Purchase ID */}
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
