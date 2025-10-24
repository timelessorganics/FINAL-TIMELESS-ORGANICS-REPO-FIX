import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { CheckCircle, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Only auto-redirect if authenticated
    if (!isAuthenticated || isLoading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation, isAuthenticated, isLoading]);

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full bg-card border-card-border p-12 text-center" data-testid="card-payment-success">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-patina" data-testid="icon-success" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-title">
            <span className="moving-fill">Payment Successful!</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8" data-testid="text-description">
            Your payment has been received and is being processed. You'll receive a confirmation email with your certificate and unique codes shortly.
          </p>

          <div className="bg-card-border/20 rounded-md p-6 mb-8">
            <h2 className="font-serif text-xl font-semibold mb-3 text-foreground">
              What happens next?
            </h2>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-patina mt-1">•</span>
                <span>PayFast is processing your payment (usually instant)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-patina mt-1">•</span>
                <span>Your unique codes (bronze claim, workshop voucher, lifetime referral) will be generated</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-patina mt-1">•</span>
                <span>A PDF certificate will be created and emailed to you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-patina mt-1">•</span>
                <span>You'll be able to select your bronze casting specimen</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/dashboard")}
                className="gap-2"
                data-testid="button-dashboard"
              >
                View Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="gap-2"
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4" />
                Sign In to View Dashboard
              </Button>
            )}
          </div>

          {isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-6" data-testid="text-redirect">
              Redirecting to dashboard in {countdown} seconds...
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
