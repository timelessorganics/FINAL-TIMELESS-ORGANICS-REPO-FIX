import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import MainLaunch from "@/pages/main-launch";
import HomePage from "@/pages/home";
import Founding100ExplainedPage from "@/pages/founding-100-explained";
import WorkshopsPage from "@/pages/workshops";
import CommissionPage from "@/pages/commission";
import AboutPage from "@/pages/about";
import ShopPage from "@/pages/shop";
import AuctionsPage from "@/pages/auctions";
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
import SeasonalGuide from "@/pages/seasonal-guide";
import SignIn from "@/pages/sign-in";
import AuthCallback from "@/pages/auth-callback";
import ClaimGiftPage from "@/pages/claim-gift";

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
      {/* Auth Routes */}
      <Route path="/sign-in" component={SignIn} />
      <Route path="/auth/callback" component={AuthCallback} />

      {/* Payment result pages - accessible without authentication */}
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />

      {/* Home Page - Root */}
      <Route path="/" component={HomePage} />

      {/* Founding 100 Launch Page */}
      <Route path="/founding-100" component={MainLaunch} />
      <Route path="/founding100" component={MainLaunch} />

      {/* Founding 100 Explanation */}
      <Route path="/founding-100-explained" component={Founding100ExplainedPage} />

      {/* Brand Pages - PUBLIC */}
      <Route path="/workshops" component={WorkshopsPage} />
      <Route path="/commission" component={CommissionPage} />
      <Route path="/shop" component={ShopPage} />
      <Route path="/auctions" component={AuctionsPage} />
      <Route path="/about" component={AboutPage} />


      {/* Checkout Page - PUBLIC */}
      <Route path="/checkout/:seatType">
        {(params) => <CheckoutPage seatType={params.seatType} />}
      </Route>
      <Route path="/checkout">
        {() => <CheckoutPage />}
      </Route>

      {/* Promo Code Redemption - PUBLIC */}
      <Route path="/redeem" component={RedeemCodePage} />

      {/* Gift Claim - PUBLIC (redirects to login if needed) */}
      <Route path="/claim-gift" component={ClaimGiftPage} />

      {/* Legal Pages - PUBLIC */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/waiver" component={Waiver} />

      {/* Wall of Leaves - PUBLIC */}
      <Route path="/wall-of-leaves" component={WallOfLeaves} />

      {/* Seasonal Guide - PUBLIC */}
      <Route path="/seasonal-guide" component={SeasonalGuide} />

      {/* Sculpture/Cutting Gallery - Can view without purchase */}
      <Route path="/sculptures">
        {() => <SculptureGallery />}
      </Route>
      <Route path="/gallery">
        {() => <SculptureGallery />}
      </Route>

      {/* Sculpture Selection with Purchase ID */}
      {isAuthenticated && (
        <Route path="/sculpture-selection/:purchaseId">
          {(params: { purchaseId?: string }) => <SculptureGallery purchaseId={params.purchaseId} />}
        </Route>
      )}

      {/* --- DASHBOARD IS NOW ACCESSIBLE --- */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Admin Panel - Temporarily accessible for launch emergency */}
      <Route path="/admin" component={AdminPanel} />

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