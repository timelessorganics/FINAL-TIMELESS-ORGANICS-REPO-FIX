import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Seat } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight } from "lucide-react";

interface SeatCardProps {
  seat: Seat;
  title: string;
  regularPrice: string;
  fireSalePrice: string;
  description: string;
  benefits: string[];
  featured?: boolean;
  onPaymentClick?: (paymentType: 'full' | 'deposit') => void;
}

export default function SeatCard({
  seat,
  title,
  regularPrice,
  fireSalePrice,
  description,
  benefits,
  featured = false,
  onPaymentClick,
}: SeatCardProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const available = seat.totalAvailable - seat.sold;
  const percentageSold = (seat.sold / seat.totalAvailable) * 100;

  const handlePaymentClick = (paymentType: 'full' | 'deposit') => {
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

    onPaymentClick?.(paymentType);
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
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</div>
      </div>

      {/* Title */}
      <div className="mb-6 pr-20">
        <div className="text-xs uppercase tracking-wider text-patina font-semibold mb-2">
          {seat.type === "founder" ? "FOUNDERS (50 SEATS)" : "PATRON (50 SEATS)"}
        </div>
        <h3 className="font-serif text-3xl font-bold mb-2 text-foreground">{title}</h3>
        <div className="mb-3">
          <span className="text-base text-muted-foreground line-through mr-2">{regularPrice}</span>
          <span className="text-xs text-muted-foreground">(after 48hrs)</span>
        </div>
        <div className="text-3xl font-bold text-accent-gold mb-1">{fireSalePrice}</div>
        <div className="text-xs text-bronze font-semibold mb-3">48HR FRIENDS & FAMILY FIRE SALE</div>
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

      {/* BUY NOW Button Only */}
      <div>
        <Button
          onClick={() => handlePaymentClick('full')}
          disabled={available <= 0}
          className="w-full font-bold py-5 bg-gradient-to-r from-bronze via-accent-gold to-bronze bg-[length:200%_100%] animate-shimmer border-2 border-bronze/50 text-background hover:opacity-90"
          data-testid={`button-buy-now-${seat.type}`}
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          BUY NOW
        </Button>
      </div>
    </Card>
  );
}
