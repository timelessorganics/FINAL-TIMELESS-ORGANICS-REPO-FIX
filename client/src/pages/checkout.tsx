import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Sparkles, Gift, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const checkoutFormSchema = z.object({
  deliveryName: z.string().min(2, "Name must be at least 2 characters"),
  deliveryPhone: z.string().min(10, "Please enter a valid phone number"),
  deliveryAddress: z.string().min(10, "Please enter your full delivery address"),
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

interface CheckoutPageProps {
  seatType: "founder" | "patron";
}

export default function CheckoutPage({ seatType }: CheckoutPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [hasPatina, setHasPatina] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<{valid: boolean; discount?: number; seatType?: string} | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Form setup
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      deliveryName: "",
      deliveryPhone: "",
      deliveryAddress: "",
    },
  });

  // Purchase initiation mutation
  const initiatePurchase = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const response = await apiRequest("POST", "/api/purchase/initiate", {
        seatType,
        hasPatina,
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
      });
      
      return await response.json();
    },
    onSuccess: (response: any) => {
      // Show user feedback
      toast({
        title: "Opening Payment",
        description: "Secure payment modal loading...",
      });

      // Trigger PayFast Onsite Payment Modal
      const payFastModal = (window as any).payfast_do_onsite_payment;
      
      if (typeof payFastModal !== 'function') {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "PayFast payment system not loaded. Please refresh and try again.",
        });
        return;
      }

      // Open PayFast modal with payment UUID
      payFastModal(
        { uuid: response.uuid },
        function (result: boolean) {
          if (result === true) {
            toast({
              title: "Payment Successful!",
              description: "Redirecting to confirmation page...",
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

  // Promo code redemption mutation (for 100% discount codes)
  const redeemPromo = useMutation({
    mutationFn: async (data: CheckoutForm & { promoCode: string }) => {
      return await apiRequest("POST", "/api/promo-code/redeem", {
        code: data.promoCode,
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
        hasPatina,
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
    // If 100% discount promo code, redeem directly (bypass payment)
    if (validatedPromo?.valid && validatedPromo.discount === 100) {
      redeemPromo.mutate({ ...data, promoCode: promoCode.toUpperCase() });
    } else {
      // Regular payment flow
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
          description: `${result.discount}% discount - ${result.seatType === 'patron' ? 'Complimentary Patron' : 'Complimentary Founder'} seat`,
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

  // Price calculation - R10 for testing
  const basePrice = 10;
  const patinaPrice = hasPatina ? 10 : 0;
  const discount = validatedPromo?.valid ? ((basePrice + patinaPrice) * (validatedPromo.discount! / 100)) : 0;
  const totalPrice = basePrice + patinaPrice - discount;

  const seatLabel = seatType === "founder" ? "Founder Pass" : "Patron Pass";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-bronze">Timeless Organics</h1>
              <p className="text-sm text-muted-foreground">Founding 100 Checkout</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/founding100")}
              data-testid="button-back"
            >
              Back to Founding 100
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-bronze mb-2">Complete Your Investment</h2>
            <p className="text-xl text-bronze/80">{seatLabel} - R{basePrice.toLocaleString()}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Studio Selection Info & Delivery */}
            <div className="lg:col-span-2 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-8">
                  
                  {/* Studio Selection Information */}
                  <Card data-testid="card-studio-selection">
                    <CardHeader>
                      <CardTitle className="text-bronze">Studio-Selected Specimen</CardTitle>
                      <CardDescription>
                        For the Founding 100 launch, our studio will curate and select your botanical specimen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-bronze/10 border border-bronze/30 rounded-lg p-5">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-bronze mt-0.5 flex-shrink-0" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Curated for Peak Quality</h4>
                            <p className="text-sm text-muted-foreground">
                              Each founder receives a unique botanical specimen selected by David Junor from the current season's finest Cape Fynbos specimens. Your casting will be one-of-a-kind, chosen for optimal detail retention and sculptural beauty.
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                                <span>Expert selection from over 20 botanical varieties</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                                <span>Peak-season specimens for maximum detail</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                                <span>Signed limited edition (1 of 100)</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground italic">
                          💡 Note: Custom specimen selection and "bring your own" options will be available for regular workshop bookings after the Founding 100 launch.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patina Option */}
                  <Card data-testid="card-patina-option">
                    <CardHeader>
                      <CardTitle className="text-patina">Add Patina Finish</CardTitle>
                      <CardDescription>
                        Enhance your bronze with a natural green patina finish (+R10)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="patina"
                          checked={hasPatina}
                          onCheckedChange={(checked) => setHasPatina(checked as boolean)}
                          data-testid="checkbox-patina"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="patina"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Add Patina Finish
                          </label>
                          <p className="text-sm text-muted-foreground">
                            A chemical process that creates a distinctive green-blue oxidation on the bronze surface, reminiscent of aged copper. This traditional finish adds depth and character to your casting.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Details Form */}
                  <Card data-testid="card-delivery-form">
                    <CardHeader>
                      <CardTitle className="text-bronze">Delivery Information</CardTitle>
                      <CardDescription>
                        Enter your delivery details for when your bronze is ready (January 2026)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="deliveryName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  {...field}
                                  data-testid="input-delivery-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+27 XX XXX XXXX"
                                  {...field}
                                  data-testid="input-delivery-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Street address, city, postal code"
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="input-delivery-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24" data-testid="card-order-summary">
                <CardHeader>
                  <CardTitle className="text-bronze">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Promo Code Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Promo Code (Optional)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        disabled={isValidatingPromo || validatedPromo?.valid}
                        data-testid="input-promo-code"
                        className="flex-1"
                      />
                      <Button
                        onClick={validatePromoCode}
                        disabled={!promoCode.trim() || isValidatingPromo || validatedPromo?.valid}
                        variant="outline"
                        data-testid="button-apply-promo"
                      >
                        {isValidatingPromo ? "..." : validatedPromo?.valid ? "Applied" : "Apply"}
                      </Button>
                    </div>
                    {validatedPromo?.valid && (
                      <Alert className="bg-accent-gold/10 border-accent-gold/30">
                        <Gift className="h-4 w-4 text-accent-gold" />
                        <AlertDescription className="text-sm">
                          <strong>Complimentary {validatedPromo.seatType === 'patron' ? 'Patron' : 'Founder'} Seat</strong> - {validatedPromo.discount}% discount applied!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{seatLabel}</span>
                      <span className="font-semibold">R{basePrice.toLocaleString()}</span>
                    </div>

                    {hasPatina && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Patina Finish</span>
                        <span className="font-semibold text-patina">+R10</span>
                      </div>
                    )}

                    {validatedPromo?.valid && discount > 0 && (
                      <div className="flex justify-between text-accent-gold">
                        <span>Promo Discount ({validatedPromo.discount}%)</span>
                        <span>-R{discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className={totalPrice === 0 ? "text-accent-gold" : "text-bronze"} data-testid="text-total-price">
                        {totalPrice === 0 ? "FREE" : `R${totalPrice.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <p>✓ Workshop voucher ({seatType === "founder" ? "50%" : "80%"} off first workshop)</p>
                    <p>✓ Lifetime workshop code ({seatType === "founder" ? "20%" : "30%"} off forever)</p>
                    <p>✓ Guaranteed bronze casting</p>
                    <p>✓ Official investment certificate</p>
                    <p className="text-accent">✓ Your name on the Wall of Leaves</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className={validatedPromo?.valid && validatedPromo.discount === 100 
                      ? "w-full bg-gradient-to-r from-accent-gold to-bronze text-white" 
                      : "w-full bg-bronze hover:bg-bronze/90 text-white"}
                    size="lg"
                    onClick={form.handleSubmit(handleCheckout)}
                    disabled={initiatePurchase.isPending || redeemPromo.isPending}
                    data-testid="button-proceed-payment"
                  >
                    {initiatePurchase.isPending || redeemPromo.isPending 
                      ? "Processing..." 
                      : validatedPromo?.valid && validatedPromo.discount === 100
                      ? "Complete Complimentary Reservation"
                      : "Proceed to Payment"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
