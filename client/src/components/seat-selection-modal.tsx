import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Award, Sparkles, Minus, Plus } from "lucide-react";

interface Seat {
  type: 'founder' | 'patron';
  price: number;
  fireSalePrice: number | null;
  fireSaleEndsAt: Date | null | string;
}

interface SeatSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'full' | 'deposit';
  founderSeat?: Seat;
  patronSeat?: Seat;
}

export default function SeatSelectionModal({ open, onOpenChange, paymentType, founderSeat, patronSeat }: SeatSelectionModalProps) {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);

  // Calculate display price for a seat
  const getDisplayPrice = (seat?: Seat, qty: number = 1) => {
    if (!seat) return 'R0';
    const isFireSaleActive = seat.fireSalePrice && seat.fireSaleEndsAt && new Date(seat.fireSaleEndsAt) > new Date();
    const priceCents = isFireSaleActive ? (seat.fireSalePrice || 0) : seat.price;
    const totalRand = (priceCents * qty) / 100;
    return `R${totalRand.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleSelect = (seatType: 'founder' | 'patron') => {
    onOpenChange(false);
    setLocation(`/checkout/${seatType}?quantity=${quantity}`);
  };

  const paymentLabel = 'Choose Your Tier';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{paymentLabel}</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Choose your seat type and how many (1 for you + gifts for others)
          </DialogDescription>
        </DialogHeader>

        {/* Quantity Selector */}
        <div className="flex items-center justify-center gap-4 py-4 border-b border-border/50">
          <span className="text-sm text-muted-foreground font-medium">How many seats:</span>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-md p-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              data-testid="button-qty-minus"
              className="h-8 w-8"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-bold text-lg">{quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              data-testid="button-qty-plus"
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">(Max 10)</span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-6">
          {/* Founder */}
          <Card 
            className="p-6 bg-card/50 border-bronze/50 cursor-pointer hover-elevate transition-all"
            onClick={() => handleSelect('founder')}
            data-testid="card-select-founder"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bronze/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-bronze" />
              </div>
              <div>
                <h3 className="font-bold text-bronze">FOUNDER</h3>
                <div className="text-lg font-bold text-bronze">{getDisplayPrice(founderSeat, quantity)}</div>
                <div className="text-xs text-muted-foreground">{quantity} seat{quantity !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Unmounted bronze casting</p>
            <Button className="w-full btn-bronze" size="sm" data-testid="button-select-founder">
              Select Founder
            </Button>
          </Card>

          {/* Patron */}
          <Card 
            className="p-6 bg-card/50 border-accent-gold/50 cursor-pointer hover-elevate transition-all"
            onClick={() => handleSelect('patron')}
            data-testid="card-select-patron"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h3 className="font-bold text-accent-gold">PATRON</h3>
                <div className="text-lg font-bold text-accent-gold">{getDisplayPrice(patronSeat, quantity)}</div>
                <div className="text-xs text-muted-foreground">{quantity} seat{quantity !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Patina + mounting included</p>
            <Button className="w-full bg-accent-gold text-background hover:bg-accent-gold/90" size="sm" data-testid="button-select-patron">
              Select Patron
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
