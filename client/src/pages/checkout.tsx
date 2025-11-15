import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Sparkles, Gift, AlertCircle, Leaf, CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { VisualSpecimenSelector } from "@/components/visual-specimen-selector";
import { MountingOptionsSelector } from "@/components/mounting-options-selector";

// Specimen style options with display names
const SPECIMEN_STYLES = [
  { value: "protea_head", label: "Protea Head" },
  { value: "pincushion_bloom", label: "Pincushion Bloom" },
  { value: "cone_bracts", label: "Cone + Bracts" },
  { value: "aloe_inflorescence", label: "Aloe Inflorescence" },
  { value: "erica_spray", label: "Erica Spray" },
  { value: "restio_seedheads", label: "Restio Seedheads" },
  { value: "bulb_spike", label: "Bulb Spike (Watsonia)" },
  { value: "pelargonium_leaf", label: "Pelargonium Leaf/Flower" },
  { value: "woody_branch", label: "Woody Branch + Leaves" },
  { value: "cone_seedpod", label: "Cone/Seed Pod" },
  { value: "succulent_rosette", label: "Succulent Rosette" },
  { value: "miniature_mix", label: "Miniature Mix" },
] as const;

const checkoutFormSchema = z.object({
  specimenStyle: z.string().min(1, "Please select a specimen style"),
  isGift: z.boolean().default(false),
  giftRecipientEmail: z.string().email().optional().or(z.literal("")),
  giftRecipientName: z.string().optional().or(z.literal("")),
  giftMessage: z.string().optional().or(z.literal("")),
  deliveryName: z.string().min(2, "Name must be at least 2 characters"),
  deliveryPhone: z.string().min(10, "Please enter a valid phone number"),
  deliveryAddress: z.string().min(10, "Please enter your full delivery address"),
}).refine((data) => {
  if (data.isGift) {
    return data.giftRecipientEmail && data.giftRecipientEmail.length > 0 && data.giftRecipientName && data.giftRecipientName.length > 0;
  }
  return true;
}, {
  message: "Recipient email and name are required for gift purchases",
  path: ["giftRecipientEmail"],
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

interface CheckoutPageProps {
  seatType: "founder" | "patron";
}

export default function CheckoutPage({ seatType }: CheckoutPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [hasPatina, setHasPatina] = useState(false);
  const [mountingType, setMountingType] = useState("none");
  const [mountingPriceCents, setMountingPriceCents] = useState(0);
  const [internationalShipping, setInternationalShipping] = useState(false);
  const [commissionVoucher, setCommissionVoucher] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<"cast_now" | "wait_for_season">("cast_now");
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<{valid: boolean; discount?: number; seatType?: string} | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Fetch seat pricing
  const { data: seats, isLoading: loadingSeats } = useQuery<any[]>({
    queryKey: ['/api/seats/availability'],
  });

  const currentSeat = seats?.find((s) => s.type === seatType);
  const basePriceCents = currentSeat?.price || 0;
  const basePrice = basePriceCents / 100; // Convert cents to Rand

  // Form setup
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      specimenStyle: "",
      isGift: false,
      giftRecipientEmail: "",
      giftRecipientName: "",
      giftMessage: "",
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
        specimenStyle: data.specimenStyle,
        hasPatina,
        mountingType,
        internationalShipping,
        commissionVoucher,
        purchaseMode,
        isGift: data.isGift,
        giftRecipientEmail: data.isGift ? data.giftRecipientEmail : undefined,
        giftRecipientName: data.isGift ? data.giftRecipientName : undefined,
        giftMessage: data.isGift ? data.giftMessage : undefined,
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
        specimenStyle: data.specimenStyle,
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
        hasPatina,
        mountingType,
        internationalShipping,
        commissionVoucher,
        purchaseMode,
        isGift: data.isGift,
        giftRecipientEmail: data.isGift ? data.giftRecipientEmail : undefined,
        giftRecipientName: data.isGift ? data.giftRecipientName : undefined,
        giftMessage: data.isGift ? data.giftMessage : undefined,
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
      // Security: Ensure promo seat type matches checkout seat type
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

  // Price calculation - fetch real seat price from backend
  const patinaPrice = hasPatina ? 1000 : 0; // R1,000 for patina service
  const mountingPrice = mountingPriceCents / 100; // Convert cents to Rand (R1,000 deposit)
  const commissionVoucherPrice = commissionVoucher ? (seatType === "founder" ? 1500 : 1500) : 0; // R1,500 for commission voucher
  const subtotal = basePrice + patinaPrice + mountingPrice + commissionVoucherPrice;
  const discount = validatedPromo?.valid ? (subtotal * (validatedPromo.discount! / 100)) : 0;
  const totalPrice = subtotal - discount;

  const seatLabel = seatType === "founder" ? "Founder Pass" : "Patron Pass";

  return (
    <>
      <div className="bg-aloe" />
      <Header 
        variant="checkout" 
        backHref="/#seats" 
        backLabel="Back to Seats" 
        context="Founding 100 Checkout" 
      />
      
      <main className="relative z-50 min-h-screen">
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
                  
                  {/* Specimen Style Selection */}
                  <Card data-testid="card-specimen-selection">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-bronze" />
                        Choose Your Specimen Style
                      </CardTitle>
                      <CardDescription>
                        Select from 12 Cape Fynbos styles. If out of season, we'll cast it when it reaches peak beauty.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="specimenStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold mb-4 block">Choose Your Specimen Style *</FormLabel>
                            <FormControl>
                              <VisualSpecimenSelector
                                value={field.value}
                                onChange={field.onChange}
                                options={SPECIMEN_STYLES.map(style => ({
                                  value: style.value,
                                  label: style.label,
                                }))}
                                error={form.formState.errors.specimenStyle?.message}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-bronze/10 border border-bronze/30 rounded-lg p-5">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-bronze mt-0.5 flex-shrink-0" />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Seasonal Casting</h4>
                            <p className="text-sm text-muted-foreground">
                              David will personally select the finest specimen of your chosen style from the current or upcoming seasonal harvest. If your style is out of season, we'll immortalize it when it reaches its peak - worth the wait for perfection!
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                                <span>Hand-selected for optimal detail and beauty</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                                <span>Cast at peak seasonal quality</span>
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
                        <p className="text-xs text-muted-foreground">
                          💡 View the <Link href="/seasonal-guide"><span className="text-bronze hover:underline cursor-pointer">Seasonal Guide</span></Link> to see peak seasons for each style. Some styles (like Woody Branch and Succulent Rosette) are available year-round.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gift Purchase Option */}
                  <Card data-testid="card-gift-option">
                    <CardHeader>
                      <CardTitle className="text-accent-gold flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Gift This Seat
                      </CardTitle>
                      <CardDescription>
                        Purchase a Founding 100 seat as a gift for someone special
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="isGift"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-is-gift"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">
                                This is a gift purchase
                              </FormLabel>
                              <FormDescription>
                                They'll receive an email notification to claim their seat and complete their profile
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch("isGift") && (
                        <div className="space-y-4 pl-8 border-l-2 border-accent-gold/30">
                          <FormField
                            control={form.control}
                            name="giftRecipientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient's Full Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g., Sarah Smith"
                                    data-testid="input-gift-recipient-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="giftRecipientEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Recipient's Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="email" 
                                    placeholder="e.g., sarah@example.com"
                                    data-testid="input-gift-recipient-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="giftMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Personal Message (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Write a personal message to include with your gift..."
                                    className="min-h-24"
                                    data-testid="textarea-gift-message"
                                  />
                                </FormControl>
                                <FormDescription>
                                  This message will be included in the gift notification email
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Purchase Mode: Cast Now vs Wait for Season */}
                  <Card data-testid="card-purchase-mode">
                    <CardHeader>
                      <CardTitle className="text-bronze">Casting Timeline</CardTitle>
                      <CardDescription>
                        Choose when you'd like your specimen cast
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            purchaseMode === "cast_now" 
                              ? "border-bronze bg-bronze/5" 
                              : "border-border hover-elevate"
                          }`}
                          onClick={() => setPurchaseMode("cast_now")}
                          data-testid="option-cast-now"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {purchaseMode === "cast_now" ? (
                                <CheckCircle2 className="w-5 h-5 text-bronze" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Cast Immediately</h4>
                              <p className="text-sm text-muted-foreground">
                                David will select the finest available specimen of your chosen style and begin casting soon. If your style is currently out of season, it will be cast when it reaches peak seasonal quality.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            purchaseMode === "wait_for_season" 
                              ? "border-bronze bg-bronze/5" 
                              : "border-border hover-elevate"
                          }`}
                          onClick={() => setPurchaseMode("wait_for_season")}
                          data-testid="option-wait-for-season"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {purchaseMode === "wait_for_season" ? (
                                <CheckCircle2 className="w-5 h-5 text-bronze" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">Wait for Peak Season</h4>
                              <p className="text-sm text-muted-foreground">
                                Reserve your seat now, and we'll cast your specimen when it reaches absolute peak seasonal perfection. Worth the wait for the finest possible detail and beauty.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patina Option */}
                  <Card data-testid="card-patina-option">
                    <CardHeader>
                      <CardTitle className="text-patina">Add Patina Finish</CardTitle>
                      <CardDescription>
                        Professional green-blue oxidation patina (+R1,000)
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
                            Add Patina Finish (+R1,000)
                          </label>
                          <p className="text-sm text-muted-foreground">
                            A chemical process that creates a distinctive green-blue oxidation on the bronze surface, reminiscent of aged copper. This traditional finish adds depth and character to your casting, creating the classic "aged bronze" aesthetic.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mounting Options */}
                  <Card data-testid="card-mounting-option">
                    <CardHeader>
                      <CardTitle className="text-patina">Mounting Service</CardTitle>
                      <CardDescription>
                        Choose how you'd like your bronze mounted (optional add-on)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MountingOptionsSelector
                        value={mountingType}
                        onChange={(optionId, priceCents) => {
                          setMountingType(optionId);
                          setMountingPriceCents(priceCents);
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* International Shipping Option */}
                  <Card data-testid="card-international-shipping">
                    <CardHeader>
                      <CardTitle className="text-bronze">International Shipping</CardTitle>
                      <CardDescription>
                        We'll arrange DHL Express shipping and provide a quote
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="internationalShipping"
                          checked={internationalShipping}
                          onCheckedChange={(checked) => setInternationalShipping(checked as boolean)}
                          data-testid="checkbox-international-shipping"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="internationalShipping"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            I need international shipping
                          </label>
                          <p className="text-sm text-muted-foreground">
                            We ship worldwide via DHL Express (typically 3-6 working days). Courier costs will be quoted separately and invoiced once we have your destination address and final package weight. Import duties/taxes may apply at your destination.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Commission Voucher Option */}
                  <Card data-testid="card-commission-voucher" className="border-accent-gold/30">
                    <CardHeader>
                      <CardTitle className="text-accent-gold">Commission Voucher</CardTitle>
                      <CardDescription>
                        Add a commission voucher for future custom bronze work (+R1,500)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="commissionVoucher"
                          checked={commissionVoucher}
                          onCheckedChange={(checked) => setCommissionVoucher(checked as boolean)}
                          data-testid="checkbox-commission-voucher"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="commissionVoucher"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Add Commission Voucher (+R1,500)
                          </label>
                          <p className="text-sm text-muted-foreground mb-3">
                            Secure a discount voucher for future commissioned bronze sculptures. This generates a unique code 
                            redeemable for {seatType === "founder" ? "40%" : "60%"} off ONE future commission service.
                          </p>
                          <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-3 text-xs space-y-1">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-accent-gold mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                <strong className="text-foreground">{seatType === "founder" ? "Founder" : "Patron"} Benefit:</strong> {seatType === "founder" ? "40%" : "60%"} discount on any future commission (portrait, pet memorial, custom sculpture, etc.)
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-accent-gold mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                Voucher code delivered with your purchase confirmation
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-accent-gold mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                Transferable gift - can be used by anyone
                              </span>
                            </div>
                          </div>
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

                    {mountingType !== "none" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Professional Mounting</span>
                        <span className="font-semibold text-patina">+R{mountingPrice.toFixed(0)}</span>
                      </div>
                    )}

                    {internationalShipping && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">International Shipping</span>
                        <span className="text-xs text-muted-foreground italic">Quoted separately</span>
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
      </main>
      
      <Footer />
    </>
  );
}
