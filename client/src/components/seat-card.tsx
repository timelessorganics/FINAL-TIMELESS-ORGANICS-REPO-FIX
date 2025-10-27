import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Seat } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SeatCardProps {
  seat: Seat;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  featured?: boolean;
}

export default function SeatCard({
  seat,
  title,
  subtitle,
  description,
  benefits,
  featured = false,
}: SeatCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const available = seat.totalAvailable - seat.sold;
  const percentageSold = (seat.sold / seat.totalAvailable) * 100;

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/purchase/initiate", {
        seatType: seat.type,
        amount: seat.price,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      // Redirect to server-side PayFast endpoint (more reliable than client-side form)
      if (data.purchaseId) {
        window.location.href = `/api/purchase/${data.purchaseId}/redirect`;
      } else {
        toast({
          title: "Payment Error",
          description: "Invalid payment data received",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to invest in a seat. Click the 'Sign In' button in the header.",
        variant: "destructive",
      });
      return;
    }
    
    if (available <= 0) {
      toast({
        title: "Sold Out",
        description: `All ${seat.type} seats have been claimed.`,
        variant: "destructive",
      });
      return;
    }
    purchaseMutation.mutate();
  };

  return (
    <Card
      className={`relative bg-card border-card-border p-7 transition-all duration-300 hover-elevate ${
        featured ? "border-bronze border-2" : ""
      }`}
      data-testid={`card-${seat.type}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-bronze text-white px-4 py-1 text-xs font-bold uppercase">
            Best Value
          </Badge>
        </div>
      )}

      {/* Seat Counter */}
      <div className="absolute top-4 right-4 text-right" data-testid={`counter-${seat.type}`}>
        <div className="text-2xl font-bold font-serif">
          <span className="moving-number text-accent-gold">{available}</span>
          <span className="text-muted-foreground text-sm">/{seat.totalAvailable}</span>
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Seats Left</div>
      </div>

      {/* Title */}
      <div className="mb-6 pr-20">
        <div className="text-xs uppercase tracking-wider text-patina font-semibold mb-2">
          {seat.type === "founder" ? "FOUNDERS (50 SEATS)" : "PATRON (50 SEATS)"}
        </div>
        <h3 className="font-serif text-3xl font-bold mb-2 text-foreground">{title}</h3>
        <div className="text-2xl font-bold text-accent-gold mb-3">{subtitle}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-bronze to-accent-gold transition-all duration-500"
            style={{ width: `${percentageSold}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {seat.sold} of {seat.totalAvailable} seats claimed
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
          Investment Perks:
        </div>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex gap-3 text-sm text-muted-foreground">
              <span className="text-patina mt-1">•</span>
              <span className="flex-1">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        onClick={handlePurchase}
        disabled={available <= 0 || purchaseMutation.isPending}
        className={`w-full btn-bronze font-bold py-6 ${
          available <= 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
        data-testid={`button-purchase-${seat.type}`}
      >
        {purchaseMutation.isPending ? (
          <div className="flex items-center justify-center gap-2">
            <div className="spinner w-5 h-5 border-2" />
            <span>Processing...</span>
          </div>
        ) : available <= 0 ? (
          "SOLD OUT"
        ) : (
          <span className="moving-fill">Invest Now</span>
        )}
      </Button>
    </Card>
  );
}
