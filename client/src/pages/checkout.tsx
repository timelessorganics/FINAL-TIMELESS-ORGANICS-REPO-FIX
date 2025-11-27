import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Clock, Sparkles, Shield, Award, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your delivery address"),
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

interface CheckoutPageProps {
  seatType: "founder" | "patron";
}

export default function CheckoutPage({ seatType }: CheckoutPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [purchaseMode, setPurchaseMode] = useState<"cast_now" | "wait_for_season">("cast_now");
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<{valid: boolean; discount?: number; seatType?: string} | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const { data: seats, isLoading: loadingSeats } = useQuery<any[]>({
    queryKey: ['/api/seats/availability'],
  });

  const currentSeat = seats?.find((s) => s.type === seatType);
  const basePriceCents = currentSeat?.price || 0;
  const basePrice = basePriceCents / 100;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const initiatePurchase = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const response = await apiRequest("POST", "/api/purchase/initiate", {
        seatType,
        purchaseMode,
        deliveryName: data.fullName,
        deliveryPhone: data.phone,
        deliveryAddress: data.address,
        specimenStyle: "to_be_selected",
        hasPatina: false,
        mountingType: "none",
        internationalShipping: false,
        commissionVoucher: false,
        isGift: false,
      });
      
      return await response.json();
    },
    onSuccess: (response: any) => {
      toast({
        title: "Opening Payment",
        description: "Secure payment modal loading...",
      });

      const payFastModal = (window as any).payfast_do_onsite_payment;
      
      if (typeof payFastModal !== 'function') {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "PayFast payment system not loaded. Please refresh and try again.",
        });
        return;
      }

      payFastModal(
        { uuid: response.uuid },
        function (result: boolean) {
          if (result === true) {
            toast({
              title: "Payment Successful!",
              description: "Welcome to the Founding 100! Redirecting...",
            });
            setTimeout(() => {
              setLocation('/payment/success');
            }, 1500);
          } else {
            toast({
              variant: "destructive",
              title: "Payment Cancelled",
              description: "You can try again when ready.",
            });
          }
        }
      );
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Could not initiate payment. Please try again.",
      });
    },
  });

  const redeemPromo = useMutation({
    mutationFn: async (data: CheckoutForm & { promoCode: string }) => {
      return await apiRequest("POST", "/api/promo-code/redeem", {
        code: data.promoCode,
        specimenStyle: "to_be_selected",
        deliveryName: data.fullName,
        deliveryPhone: data.phone,
        deliveryAddress: data.address,
        hasPatina: false,
        mountingType: "none",
        internationalShipping: false,
        commissionVoucher: false,
        purchaseMode,
        isGift: false,
      });
    },
    onSuccess: () => {
      toast({
        title: "Complimentary Seat Confirmed!",
        description: "Your VIP seat has been reserved. Redirecting to dashboard...",
      });
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Promo Code Error",
        description: error.message || "Failed to redeem promo code.",
      });
    },
  });

  const handleCheckout = (data: CheckoutForm) => {
    if (validatedPromo?.valid && validatedPromo.discount === 100) {
      if (validatedPromo.seatType !== seatType) {
        toast({
          variant: "destructive",
          title: "Seat Type Mismatch",
          description: `This promo code is for ${validatedPromo.seatType} seats only.`,
        });
        return;
      }
      redeemPromo.mutate({ ...data, promoCode: promoCode.toUpperCase() });
    } else {
      initiatePurchase.mutate(data);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setValidatedPromo(null);
      return;
    }

    setIsValidatingPromo(true);
    try {
      const response = await apiRequest("POST", "/api/promo-code/validate", {
        code: promoCode.toUpperCase(),
      });
      const result = await response.json();
      
      setValidatedPromo(result);
      
      if (result.valid) {
        toast({
          title: "Promo Code Applied!",
          description: `${result.discount}% discount applied`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Promo Code",
          description: result.message || "This code is not valid.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Could not validate promo code.",
      });
      setValidatedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const discount = validatedPromo?.valid ? (basePrice * (validatedPromo.discount! / 100)) : 0;
  const totalPrice = basePrice - discount;

  const seatLabel = seatType === "founder" ? "Founder" : "Patron";
  const seatColor = seatType === "founder" ? "bronze" : "accent-gold";

  const benefits = seatType === "founder" 
    ? ["Guaranteed bronze casting (R25K+ value)", "50% off one future workshop", "20% lifetime discount on all purchases"]
    : ["Guaranteed bronze casting (R25K+ value)", "80% off one future workshop", "30% lifetime discount on all purchases"];

  return (
    <>
      <Header 
        variant="checkout" 
        backHref="/#seats" 
        backLabel="Back" 
        context="Founding 100" 
      />
      
      <main className="relative z-50 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          
          {/* Simple Header */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-light mb-2 tracking-tight">
              <span className="hero-glass-text">{seatLabel} Seat</span>
            </h1>
            <p className="text-muted-foreground font-light">
              Secure your place in the Founding 100
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* Left: Form */}
            <div className="lg:col-span-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-6">
                  
                  {/* Contact Details */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Your Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-normal text-muted-foreground">Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="David Junor" data-testid="input-full-name" className="border-border/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-normal text-muted-foreground">Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="you@example.com" data-testid="input-email" className="border-border/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-normal text-muted-foreground">Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="082 123 4567" data-testid="input-phone" className="border-border/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-normal text-muted-foreground">Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="123 Main Street, Cape Town, 8001" data-testid="input-address" className="border-border/50 min-h-20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Cast Timing - Simple Choice */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Casting Timeline</CardTitle>
                      <CardDescription className="text-sm">When should we cast your bronze?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div 
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                          purchaseMode === "cast_now" 
                            ? `border-${seatColor}/60 bg-${seatColor}/5` 
                            : "border-border/50 hover:border-border"
                        }`}
                        onClick={() => setPurchaseMode("cast_now")}
                        data-testid="option-cast-now"
                      >
                        {purchaseMode === "cast_now" ? (
                          <CheckCircle2 className={`w-5 h-5 text-${seatColor}`} />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-sm">Cast Now</div>
                          <p className="text-xs text-muted-foreground">
                            We'll cast when seasonal specimens are available
                          </p>
                        </div>
                      </div>

                      <div 
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                          purchaseMode === "wait_for_season" 
                            ? `border-${seatColor}/60 bg-${seatColor}/5` 
                            : "border-border/50 hover:border-border"
                        }`}
                        onClick={() => setPurchaseMode("wait_for_season")}
                        data-testid="option-wait-for-season"
                      >
                        {purchaseMode === "wait_for_season" ? (
                          <CheckCircle2 className={`w-5 h-5 text-${seatColor}`} />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-sm">Wait for Peak Season</div>
                          <p className="text-xs text-muted-foreground">
                            Hold until your preferred season
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Promo Code - Optional */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Promo Code</CardTitle>
                      <CardDescription className="text-sm">Have a VIP code? Enter it here</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="font-mono uppercase border-border/50"
                          data-testid="input-promo-code"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validatePromoCode}
                          disabled={isValidatingPromo || !promoCode.trim()}
                          data-testid="button-validate-promo"
                        >
                          {isValidatingPromo ? "..." : "Apply"}
                        </Button>
                      </div>
                      {validatedPromo?.valid && (
                        <p className="text-sm text-patina mt-2 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          {validatedPromo.discount}% discount applied
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Submit */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full btn-bronze py-6 text-base"
                    disabled={initiatePurchase.isPending || redeemPromo.isPending || loadingSeats}
                    data-testid="button-complete-purchase"
                  >
                    {initiatePurchase.isPending || redeemPromo.isPending ? (
                      "Processing..."
                    ) : validatedPromo?.valid && validatedPromo.discount === 100 ? (
                      "Claim Complimentary Seat"
                    ) : (
                      `Pay R${totalPrice.toLocaleString()}`
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    You'll choose your specimen style and add-ons after purchase
                  </p>
                </form>
              </Form>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2">
              <Card className={`border-${seatColor}/30 bg-gradient-to-b from-${seatColor}/5 to-transparent sticky top-24`}>
                <CardHeader>
                  <CardTitle className={`font-serif text-${seatColor}`}>{seatLabel} Seat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Price */}
                  <div>
                    <div className="text-3xl font-light">
                      R{totalPrice.toLocaleString()}
                    </div>
                    {discount > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        R{basePrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* What's Included */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      What's Included
                    </div>
                    <ul className="space-y-2">
                      {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className={`w-4 h-4 text-${seatColor} mt-0.5 flex-shrink-0`} />
                          <span className="text-foreground/80">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* After Purchase Note */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      After Purchase
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You'll choose your specimen style, mounting options, and add-ons from your dashboard. 
                      Change anytime before we start casting.
                    </p>
                  </div>

                  {/* Trust */}
                  <div className="pt-4 border-t border-border/30 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Secure payment via PayFast
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
