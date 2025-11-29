import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, CreditCard, Sparkles } from "lucide-react";

interface PreLaunchReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeatType?: 'founder' | 'patron';
}

interface SeatAvailability {
  type: string;
  name: string;
  price: number;
  totalAvailable: number;
  sold: number;
  remaining: number;
}

export default function PreLaunchReservationModal({
  isOpen,
  onClose,
  defaultSeatType = 'founder'
}: PreLaunchReservationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [seatType, setSeatType] = useState<'founder' | 'patron'>(defaultSeatType);
  const [reservationType, setReservationType] = useState<'reserve' | 'secure' | 'buy'>('reserve');
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seats } = useQuery<SeatAvailability[]>({
    queryKey: ['/api/seats/availability'],
  });

  const founderSeats = seats?.find(s => s.type === 'founder');
  const patronSeats = seats?.find(s => s.type === 'patron');

  const reserveMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string; seatType: string; reservationType: string }) => {
      const response = await apiRequest('POST', '/api/prelaunch/reserve', data);
      return response.json();
    },
    onSuccess: (data: { success: boolean; paymentUrl?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/prelaunch/stats'] });
      if (reservationType === 'secure' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setStep('success');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Reservation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    reserveMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      seatType,
      reservationType,
    });
  };

  const handleClose = () => {
    setStep('form');
    setName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  const selectedPrice = seatType === 'founder' ? (founderSeats?.price || 300000) : (patronSeats?.price || 500000);
  const depositAmount = 100000; // R1,000

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border max-h-[90vh] overflow-y-auto flex flex-col">
        {step === 'form' ? (
          <>
            <DialogHeader className="sticky top-0 bg-background z-10">
              <DialogTitle className="font-serif text-2xl">
                <span className="moving-fill">Reserve Your Seat</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Secure your place in the Founding 100 before we launch Monday.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4 flex-1" autoComplete="off">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    autoComplete="off"
                    data-testid="input-reservation-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="david@example.com"
                    required
                    autoComplete="off"
                    data-testid="input-reservation-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 123 4567"
                    autoComplete="off"
                    data-testid="input-reservation-phone"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Choose Your Seat</Label>
                <RadioGroup
                  value={seatType}
                  onValueChange={(v) => setSeatType(v as 'founder' | 'patron')}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="relative">
                    <RadioGroupItem value="founder" id="founder" className="peer sr-only" />
                    <Label
                      htmlFor="founder"
                      className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-bronze peer-data-[state=checked]:bg-bronze/10"
                      data-testid="radio-seat-founder"
                    >
                      <span className="font-semibold text-foreground">Founder</span>
                      <span className="text-sm text-muted-foreground">R{(founderSeats?.price || 300000) / 100}</span>
                      <span className="text-xs text-bronze mt-1">50% off workshop</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="patron" id="patron" className="peer sr-only" />
                    <Label
                      htmlFor="patron"
                      className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-bronze peer-data-[state=checked]:bg-bronze/10"
                      data-testid="radio-seat-patron"
                    >
                      <span className="font-semibold text-foreground">Patron</span>
                      <span className="text-sm text-muted-foreground">R{(patronSeats?.price || 500000) / 100}</span>
                      <span className="text-xs text-bronze mt-1">80% off workshop</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>How Would You Like to Reserve?</Label>
                <RadioGroup
                  value={reservationType}
                  onValueChange={(v) => setReservationType(v as 'reserve' | 'secure' | 'buy')}
                  className="space-y-3"
                >
                  <div className="relative">
                    <RadioGroupItem value="secure" id="secure" className="peer sr-only" />
                    <Label
                      htmlFor="secure"
                      className="flex items-start gap-3 p-4 border-2 rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-bronze peer-data-[state=checked]:bg-bronze/10"
                      data-testid="radio-reserve-secure"
                    >
                      <CreditCard className="w-5 h-5 text-bronze mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-foreground block">Secure with R1,000 Deposit</span>
                        <span className="text-sm text-muted-foreground">
                          Guarantee your seat. Pay remaining R{(selectedPrice - depositAmount) / 100} within 48hrs of launch.
                        </span>
                      </div>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="reserve" id="reserve" className="peer sr-only" />
                    <Label
                      htmlFor="reserve"
                      className="flex items-start gap-3 p-4 border-2 rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-bronze peer-data-[state=checked]:bg-bronze/10"
                      data-testid="radio-reserve-hold"
                    >
                      <Clock className="w-5 h-5 text-accent-gold mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-foreground block">Hold for 24 Hours</span>
                        <span className="text-sm text-muted-foreground">
                          Free hold starting Monday 9 AM launch. Pay full amount within 24 hours.
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full btn-bronze py-6"
                disabled={reserveMutation.isPending}
                data-testid="button-confirm-reservation"
              >
                {reserveMutation.isPending ? (
                  "Processing..."
                ) : reservationType === 'secure' ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay R1,000 Deposit Now
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Reserve My Seat
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-patina/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-patina" />
            </div>
            <DialogTitle className="font-serif text-2xl mb-3">
              <span className="moving-fill">Seat Reserved!</span>
            </DialogTitle>
            <p className="text-muted-foreground mb-6">
              {reservationType === 'secure' ? (
                "Your deposit has been received. Your seat is guaranteed!"
              ) : (
                "Your 24-hour hold will activate Monday 9 AM at launch. We'll email you a reminder!"
              )}
            </p>
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-bronze" />
                <span className="text-foreground font-medium">
                  {seatType === 'founder' ? 'Founder' : 'Patron'} Seat Reserved
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Confirmation sent to {email}
              </p>
            </div>
            <Button onClick={handleClose} variant="outline" data-testid="button-close-success">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
