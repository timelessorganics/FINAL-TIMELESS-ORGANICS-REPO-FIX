import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Award, Sparkles } from "lucide-react";

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

  // Calculate display price for a seat
  const getDisplayPrice = (seat?: Seat) => {
    if (!seat) return 'R0';
    const isFireSaleActive = seat.fireSalePrice && seat.fireSaleEndsAt && new Date(seat.fireSaleEndsAt) > new Date();
    const priceCents = isFireSaleActive ? (seat.fireSalePrice || 0) : seat.price;
    const priceRand = priceCents / 100;
    return `R${priceRand.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleSelect = (seatType: 'founder' | 'patron') => {
    onOpenChange(false);
    setLocation(`/checkout/${seatType}`);
  };

  const paymentLabel = 'Choose Your Tier';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{paymentLabel}</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Choose your seat type
          </DialogDescription>
        </DialogHeader>

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
                <div className="text-xl font-bold text-bronze">{getDisplayPrice(founderSeat)}</div>
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
                <div className="text-xl font-bold text-accent-gold">{getDisplayPrice(patronSeat)}</div>
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
