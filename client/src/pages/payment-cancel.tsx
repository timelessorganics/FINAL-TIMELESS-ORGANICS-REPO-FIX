import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full bg-card border-card-border p-12 text-center" data-testid="card-payment-cancel">
          <div className="flex justify-center mb-6">
            <XCircle className="w-24 h-24 text-destructive" data-testid="icon-cancel" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="text-title">
            Payment Cancelled
          </h1>

          <p className="text-lg text-muted-foreground mb-8" data-testid="text-description">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          <div className="bg-card-border/20 rounded-md p-6 mb-8">
            <h2 className="font-serif text-xl font-semibold mb-3 text-foreground">
              Need help?
            </h2>
            <p className="text-muted-foreground">
              If you experienced any issues during checkout or have questions about the Founding 100 program, 
              please contact us at{" "}
              <a 
                href="mailto:support@timeless.organic" 
                className="text-patina hover:text-patina/80 underline"
                data-testid="link-support"
              >
                support@timeless.organic
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <Button
              onClick={() => setLocation("/")}
              data-testid="button-try-again"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
      
      <Footer />
    </>
  );
}
