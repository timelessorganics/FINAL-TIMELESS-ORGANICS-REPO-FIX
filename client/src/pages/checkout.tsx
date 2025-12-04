import { useState, useEffect } from "react";
import { useLocation, Link, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Clock, Sparkles, Shield, Award, ArrowLeft, CheckCircle2, Circle, AlertCircle, CalendarDays } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Sculpture } from "@shared/schema";
import { 
  specimenStyles,
  getCurrentSeason, 
  getSeasonDisplay, 
  isAvailableForCastNow, 
  getNextAvailableSeason,
  type Season 
} from "@/lib/specimenAvailability";

const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your delivery address"),
  quantity: z.string().default("1"),
  isGift: z.boolean().default(false),
  giftRecipients: z.array(z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(1, "Name required"),
  })).optional(),
  giftMessage: z.string().optional(),
}).refine((data) => {
  if (!data.isGift) return true;
  const qty = parseInt(data.quantity) || 1;
  if (!data.giftRecipients || data.giftRecipients.length !== qty) {
    return false;
  }
  return data.giftRecipients.every(r => r.email && r.name);
}, {
  message: "Enter email and name for each recipient",
  path: ["giftRecipients"],
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

interface CheckoutPageProps {
  seatType?: string;
}

export default function CheckoutPage({ seatType: propSeatType }: CheckoutPageProps = {}) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  // Priority: prop > query param > default to founder
  let seatType: "founder" | "patron" = "founder";
  if (propSeatType === "founder" || propSeatType === "patron") {
    seatType = propSeatType;
  } else if (params.get("seat") === "founder" || params.get("seat") === "patron") {
    seatType = params.get("seat") as "founder" | "patron";
  }
  
  // Support both ?payment=deposit AND ?mode=deposit URL formats
  let urlPaymentType: "full" | "deposit" = "full";
  if (params.get("payment") === "deposit" || params.get("mode") === "deposit") {
    urlPaymentType = "deposit";
  }
  
  const { toast } = useToast();
  const [purchaseMode, setPurchaseMode] = useState<"cast_now" | "wait_for_season">("cast_now");
  const [selectedSpecimen, setSelectedSpecimen] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<{valid: boolean; discount?: number; seatType?: string} | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [hasPatina, setHasPatina] = useState(false);
  const [mountingType, setMountingType] = useState("none");
  const [paymentType, setPaymentType] = useState<"full" | "deposit" | "reserve">(urlPaymentType);

  // Get current season and check specimen availability
  const currentSeason = getCurrentSeason() as Season;
  const seasonInfo = getSeasonDisplay(currentSeason);
  
  // Check if selected specimen is available for "Cast Now"
  const specimenCanCastNow = selectedSpecimen ? isAvailableForCastNow(selectedSpecimen, currentSeason) : true;
  const nextAvailableSeason = selectedSpecimen && !specimenCanCastNow 
    ? getNextAvailableSeason(selectedSpecimen, currentSeason) 
    : null;
  const nextSeasonInfo = nextAvailableSeason ? getSeasonDisplay(nextAvailableSeason) : null;
  
  // If specimen can't cast now and user had "cast_now" selected, switch to "wait_for_season"
  useEffect(() => {
    if (selectedSpecimen && !specimenCanCastNow && purchaseMode === "cast_now") {
      setPurchaseMode("wait_for_season");
      toast({
        title: "Specimen not in season",
        description: `${specimenStyles.find(s => s.id === selectedSpecimen)?.name} is not available for immediate casting. Switched to "Buy & Wait".`,
      });
    }
  }, [selectedSpecimen, specimenCanCastNow, purchaseMode, toast]);

  const { data: seats, isLoading: loadingSeats } = useQuery<any[]>({
    queryKey: ['/api/seats/availability'],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: allSculptures = [] } = useQuery<Sculpture[]>({
    queryKey: ['/api/sculptures'],
  });

  // Specimen availability is now handled by specimenAvailability from lib/specimenAvailability.ts

  // Normalize seatType to lowercase for matching
  const normalizedSeatType = seatType.toLowerCase();
  const currentSeat = seats?.find((s) => s.type.toLowerCase() === normalizedSeatType);
  // Use fire sale price if active, otherwise regular price - keep in cents throughout
  const basePriceCents = (currentSeat?.fireSalePrice && currentSeat?.fireSaleEndsAt && new Date(currentSeat.fireSaleEndsAt) > new Date()) 
    ? currentSeat.fireSalePrice 
    : currentSeat?.price || 0;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      quantity: "1",
      isGift: false,
      giftRecipients: [],
      giftMessage: "",
    },
  });

  const initiatePurchase = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const qty = parseInt(data.quantity) || 1;
      
      if (data.isGift && (!data.giftRecipients || data.giftRecipients.length !== qty)) {
        throw new Error(`Please enter ${qty} recipient(s)`);
      }

      // For bulk gifts, create multiple purchases
      if (data.isGift && qty > 1) {
        const purchases = [];
        for (const recipient of data.giftRecipients || []) {
          const response = await apiRequest("POST", "/api/purchase/initiate", {
            seatType,
            purchaseMode,
            paymentType,
            deliveryName: data.fullName,
            deliveryPhone: data.phone,
            deliveryAddress: data.address,
            specimenStyle: selectedSpecimen || null,
            hasPatina,
            mountingType,
            internationalShipping: false,
            commissionVoucher: false,
            isGift: true,
            giftRecipientEmail: recipient.email,
            giftRecipientName: recipient.name,
            giftMessage: data.giftMessage,
          });
          purchases.push(await response.json());
        }
        return purchases[0]; // Return first for redirect
      }

      // Single purchase (personal or single gift)
      const response = await apiRequest("POST", "/api/purchase/initiate", {
        seatType,
        purchaseMode,
        paymentType,
        deliveryName: data.fullName,
        deliveryPhone: data.phone,
        deliveryAddress: data.address,
        specimenStyle: selectedSpecimen || null,
        hasPatina,
        mountingType,
        internationalShipping: false,
        commissionVoucher: false,
        isGift: data.isGift,
        giftRecipientEmail: data.isGift && data.giftRecipients?.[0] ? data.giftRecipients[0].email : undefined,
        giftRecipientName: data.isGift && data.giftRecipients?.[0] ? data.giftRecipients[0].name : undefined,
        giftMessage: data.isGift ? data.giftMessage : undefined,
      });
      
      return await response.json();
    },
    onSuccess: (response: any) => {
      if (response.paymentType === 'reserve') {
        toast({
          title: "Seat Reserved!",
          description: "Your seat is held for 24 hours. Check your email for details.",
        });
        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
        return;
      }

      toast({
        title: "Redirecting to Payment",
        description: "Taking you to PayFast secure checkout...",
      });

      // Use redirect flow instead of modal - more reliable
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const redirectUrl = `${apiUrl}/api/purchase/${response.purchaseId}/redirect`;
      
      // Small delay to show toast, then redirect
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
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
        specimenStyle: selectedSpecimen || null,
        deliveryName: data.fullName,
        deliveryPhone: data.phone,
        deliveryAddress: data.address,
        hasPatina,
        mountingType,
        internationalShipping: false,
        commissionVoucher: false,
        purchaseMode,
        isGift: data.isGift,
        giftRecipientEmail: data.isGift && data.giftRecipients?.[0] ? data.giftRecipients[0].email : undefined,
        giftRecipientName: data.isGift && data.giftRecipients?.[0] ? data.giftRecipients[0].name : undefined,
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
    console.log("[Checkout] Form submitted with data:", data);
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

  // Log form errors when validation fails
  const formErrors = form.formState.errors;
  if (Object.keys(formErrors).length > 0) {
    console.log("[Checkout] Form validation errors:", formErrors);
  }

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

  // Parse quantity
  const qty = parseInt(quantity) || 1;

  // Calculate add-on costs (all in cents)
  const patinaCost = hasPatina ? 100000 : 0; // R1,000 for patina
  const mountingCosts: Record<string, number> = {
    none: 0,
    wall: 150000,     // R1,500
    base: 80000,      // R800
    custom: 120000,   // R1,200
  };
  const mountingCost = mountingCosts[mountingType] || 0;

  // Calculate total price (all in cents) - MULTIPLY BY QUANTITY
  const totalBasePriceCents = basePriceCents * qty;
  const discount = validatedPromo?.valid ? (totalBasePriceCents * (validatedPromo.discount! / 100)) : 0;
  const subtotal = totalBasePriceCents - discount + patinaCost + mountingCost; // All values in cents
  
  // Apply payment type adjustments
  let totalPrice = subtotal;
  if (paymentType === 'deposit') {
    totalPrice = 1; // R1,000 deposit only
  } else if (paymentType === 'reserve') {
    totalPrice = 0;
  }

  const seatLabel = seatType === "founder" ? "Founder" : "Patron";
  const seatColor = seatType === "founder" ? "bronze" : "accent-gold";

  const benefits = seatType === "founder" 
    ? [
        "One-of-a-kind bronze casting (R25,000+ retail value)",
        "One 2-day bronze casting workshop at 50% discount",
        "20% lifetime discount on all future shop purchases",
        "Priority access to custom commissions",
        "Early access to future auction pieces",
        "Founding member status & certificate of authenticity"
      ]
    : [
        "One-of-a-kind bronze casting with patina finish included",
        "Professional mounting service included",
        "One 2-day bronze casting workshop at 80% discount (hands-on masterclass)",
        "30% discount on all future workshops",
        "30% lifetime discount on all future shop purchases",
        "Priority access to custom commissions",
        "Early access to future auction pieces",
        "All benefits transferable to family/friends you gift to",
        "Founding member status & premium certificate"
      ];

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
                <form onSubmit={form.handleSubmit(handleCheckout, (errors) => {
                  console.log("[Checkout] Validation failed:", errors);
                  const firstError = Object.values(errors)[0];
                  if (firstError?.message) {
                    toast({
                      variant: "destructive",
                      title: "Please complete all fields",
                      description: String(firstError.message),
                    });
                  }
                })} className="space-y-6">
                  
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
                              <Input {...field} placeholder="Your Full Name" data-testid="input-full-name" className="border-border/50" />
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

                  {/* Specimen Style Selection - 9 Cape Fynbos Styles */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Choose Your Specimen Style</CardTitle>
                      <CardDescription className="text-sm">
                        Select from 9 Cape Fynbos styles — David will personally curate the finest specimen
                        <span className="block text-xs text-bronze mt-1">
                          Current season: {seasonInfo.name} ({seasonInfo.months})
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedSpecimen} onValueChange={setSelectedSpecimen}>
                        <SelectTrigger className="border-border/50" data-testid="select-specimen">
                          <SelectValue placeholder="Select a specimen style..." />
                        </SelectTrigger>
                        <SelectContent>
                          {specimenStyles.map((style) => {
                            const available = isAvailableForCastNow(style.id, currentSeason);
                            return (
                              <SelectItem key={style.id} value={style.id}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${available ? 'bg-bronze' : 'bg-border'}`} />
                                  <span>{style.name}</span>
                                  {!available && (
                                    <span className="text-xs text-muted-foreground ml-1">(Wait for season)</span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      
                      {/* Selected specimen details */}
                      {selectedSpecimen && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                          <p className="text-xs text-muted-foreground">
                            {specimenStyles.find(s => s.id === selectedSpecimen)?.description}
                          </p>
                          {!specimenCanCastNow && nextSeasonInfo && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                Available for casting in {nextSeasonInfo.name} ({nextSeasonInfo.months})
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        Each specimen is cast from real organic matter at 700°C. Your choice will be documented in your certificate.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Cast Timing - Buy & Cast Now vs Buy & Wait */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Casting Timeline</CardTitle>
                      <CardDescription className="text-sm">
                        When should we cast your bronze?
                        {selectedSpecimen && !specimenCanCastNow && (
                          <span className="block text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Your selected specimen is not available for immediate casting
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Buy & Cast Now Option */}
                      <div 
                        className={`flex items-center gap-3 p-4 rounded-lg transition-all border ${
                          !specimenCanCastNow && selectedSpecimen
                            ? "opacity-50 cursor-not-allowed border-border/30 bg-muted/20"
                            : purchaseMode === "cast_now" 
                              ? `border-${seatColor}/60 bg-${seatColor}/5 cursor-pointer` 
                              : "border-border/50 hover:border-border cursor-pointer"
                        }`}
                        onClick={() => {
                          if (specimenCanCastNow || !selectedSpecimen) {
                            setPurchaseMode("cast_now");
                          }
                        }}
                        data-testid="option-cast-now"
                      >
                        {purchaseMode === "cast_now" && specimenCanCastNow ? (
                          <CheckCircle2 className={`w-5 h-5 text-${seatColor}`} />
                        ) : !specimenCanCastNow && selectedSpecimen ? (
                          <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Buy & Cast Now</span>
                            {specimenCanCastNow && selectedSpecimen && (
                              <span className="text-xs bg-bronze/20 text-bronze px-2 py-0.5 rounded">Available</span>
                            )}
                            {!specimenCanCastNow && selectedSpecimen && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Not in season</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {specimenCanCastNow || !selectedSpecimen 
                              ? "Your specimen is in season — we'll begin casting soon"
                              : `${specimenStyles.find(s => s.id === selectedSpecimen)?.name} peaks in ${nextSeasonInfo?.name || 'another season'}`
                            }
                          </p>
                        </div>
                      </div>

                      {/* Buy & Wait Option */}
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Buy & Wait for Season</span>
                            {!specimenCanCastNow && selectedSpecimen && (
                              <span className="text-xs bg-patina/20 text-patina px-2 py-0.5 rounded">Recommended</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            We'll cast when your specimen reaches peak seasonal beauty
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add-ons - FOUNDER ONLY */}
                  {seatType === "founder" && (
                    <Card className="border-border/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium">Upgrade Your Bronze</CardTitle>
                        <CardDescription className="text-sm">Optional enhancements for your sculpture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Patina Finish */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">Patina Oxidation</label>
                              <p className="text-xs text-muted-foreground">Premium aged bronze surface finish</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHasPatina(!hasPatina)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                hasPatina
                                  ? `bg-${seatColor}/20 border border-${seatColor}/40 text-${seatColor}`
                                  : "bg-border/50 border border-border text-muted-foreground hover:bg-border"
                              }`}
                              data-testid="button-toggle-patina"
                            >
                              {hasPatina ? "Selected" : "Add R1,000"}
                            </button>
                          </div>
                          {hasPatina && (
                            <p className="text-xs text-foreground/70 bg-background/50 p-2 rounded border border-border/50">
                              Beautiful oxidized finish transforms the raw bronze into deep greens and blacks
                            </p>
                          )}
                        </div>

                        {/* Mounting Service */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium block">Display Mounting</label>
                          <Select value={mountingType} onValueChange={setMountingType}>
                            <SelectTrigger className="border-border/50" data-testid="select-mounting-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Mounting (Unboxed)</SelectItem>
                              <SelectItem value="wall">Professional Mounting - R1,500</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Professional mounting service includes wall brackets and installation guide
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gift Purchasing Option */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Purchasing for Someone Else?</CardTitle>
                      <CardDescription className="text-sm">Buy up to 10 seats and gift to multiple people</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div 
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${
                          isGift 
                            ? `border-${seatColor}/60 bg-${seatColor}/5` 
                            : "border-border/50 hover:border-border"
                        }`}
                        onClick={() => {
                          setIsGift(!isGift);
                          form.setValue("isGift", !isGift);
                          if (!isGift) {
                            form.setValue("giftRecipients", []);
                          }
                        }}
                        data-testid="toggle-gift-purchase"
                      >
                        <input type="checkbox" checked={isGift} readOnly className="w-5 h-5 cursor-pointer" />
                        <div>
                          <div className="font-medium text-sm">Yes, these are gifts</div>
                          <p className="text-xs text-muted-foreground">
                            Recipients will receive emails to claim their seats
                          </p>
                        </div>
                      </div>

                      {isGift && (
                        <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border">
                          <div>
                            <label className="text-sm font-normal text-muted-foreground block mb-2">How many seats?</label>
                            <Select value={quantity} onValueChange={(val) => {
                              setQuantity(val);
                              form.setValue("quantity", val);
                              form.setValue("giftRecipients", Array(parseInt(val)).fill({ email: "", name: "" }));
                            }}>
                              <SelectTrigger className="border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                  <SelectItem key={n} value={n.toString()}>{n} Seat{n>1?'s':''}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {Array.from({ length: parseInt(quantity) }).map((_, i) => (
                            <div key={i} className="space-y-2 p-3 bg-background rounded border border-border/50">
                              <p className="text-xs font-semibold text-muted-foreground">Recipient {i + 1}</p>
                              <FormField
                                control={form.control}
                                name={`giftRecipients.${i}.name` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Jane Doe" data-testid={`input-gift-name-${i}`} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`giftRecipients.${i}.email` as any}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Email</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" placeholder="jane@example.com" data-testid={`input-gift-email-${i}`} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}

                          <FormField
                            control={form.control}
                            name="giftMessage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-normal text-muted-foreground">Personal Message (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Add a personal note..." data-testid="textarea-gift-message" className="min-h-20 text-sm" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
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
                    ) : paymentType === "reserve" ? (
                      "Reserve My Seat (Free)"
                    ) : paymentType === "deposit" ? (
                      "Pay R1,000 Deposit"
                    ) : (
                      `Pay R${(totalPrice / 100).toLocaleString()}`
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
                      R{(totalPrice / 100).toLocaleString()}
                    </div>
                    {discount > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        R{(basePriceCents / 100).toLocaleString()}
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
                          <span className="text-foreground/80">
                            {i === 0 && seatType === "founder" ? (
                              <>
                                One-of-a-kind bronze casting (
                                <span className="font-light value-gradient">
                                  R25,000+ retail
                                </span>
                                )
                              </>
                            ) : (
                              benefit
                            )}
                          </span>
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
