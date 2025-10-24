import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertRegistration } from "@shared/schema";

interface EmailGateProps {
  onVerified: () => void;
}

export default function EmailGate({ onVerified }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (data: InsertRegistration) => {
      return await apiRequest("POST", "/api/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Welcome to the Founding 100. Redirecting...",
      });
      setTimeout(() => {
        onVerified();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please provide both your name and email",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({ email, fullName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-aloe" />
      <Card className="relative z-10 w-full max-w-[720px] mx-4 bg-card/90 border-border backdrop-blur-md p-7">
        <div className="text-center mb-6">
          <div className="kicker mb-3" data-testid="text-kicker">
            FOUNDING 100 INVESTOR LAUNCH
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">
            <span className="moving-fill">Your Investment</span> is Our Investment
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Register your interest to secure your exclusive seat as a founding patron
            or founder. Limited to <span className="text-accent-gold font-semibold">100 seats</span> total.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-foreground mb-2">
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
              data-testid="input-fullname"
              disabled={registerMutation.isPending}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full"
              data-testid="input-email"
              disabled={registerMutation.isPending}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full btn-bronze font-bold py-6 text-lg"
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5 border-2" />
                  <span>Registering...</span>
                </div>
              ) : (
                <span className="moving-fill">Enter the Founding 100</span>
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By registering, you'll receive exclusive access to our limited founding seats
          and bronze casting opportunities.
        </p>
      </Card>
    </div>
  );
}
