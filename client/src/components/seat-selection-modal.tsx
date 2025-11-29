import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Award, Sparkles } from "lucide-react";

interface SeatSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'full' | 'deposit' | 'reserve';
}

export default function SeatSelectionModal({ open, onOpenChange, paymentType }: SeatSelectionModalProps) {
  const [, setLocation] = useLocation();

  const handleSelect = (seatType: 'founder' | 'patron') => {
    const params = new URLSearchParams();
    params.set('seat', seatType);
    params.set('payment', paymentType);
    onOpenChange(false);
    setLocation(`/checkout?${params.toString()}`);
  };

  const paymentLabel = paymentType === 'deposit' ? 'SECURE (R1,000 Deposit)' : 
                      paymentType === 'reserve' ? 'RESERVE FREE (24hrs)' : 
                      'BUY NOW (Full Price)';

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
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bronze/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-bronze" />
              </div>
              <div>
                <h3 className="font-bold text-bronze">FOUNDER</h3>
                <div className="text-xl font-bold text-bronze">R3,000</div>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• 50% off first workshop</li>
              <li>• 20% lifetime discount</li>
              <li>• Founders Wall engraving</li>
            </ul>
            <Button className="w-full mt-4 btn-bronze" size="sm">
              Select Founder
            </Button>
          </Card>

          {/* Patron */}
          <Card 
            className="p-6 bg-card/50 border-accent-gold/50 cursor-pointer hover-elevate transition-all"
            onClick={() => handleSelect('patron')}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-gold" />
              </div>
              <div>
                <h3 className="font-bold text-accent-gold">PATRON</h3>
                <div className="text-xl font-bold text-accent-gold">R5,000</div>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• 80% off first workshop</li>
              <li>• 30% lifetime discount</li>
              <li>• Patrons Wall engraving</li>
            </ul>
            <Button className="w-full mt-4 bg-accent-gold text-background hover:bg-accent-gold/90" size="sm">
              Select Patron
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
