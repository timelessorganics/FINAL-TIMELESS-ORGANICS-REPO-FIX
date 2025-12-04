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
import { Check, Shield, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Sculpture } from "@shared/schema";
import {
  specimenStyles,
  getCurrentSeason,
  getSeasonDisplay,
  isAvailableForCastNow,
  getNextAvailableSeason,
  type Season,
} from "@/lib/specimenAvailability";

// ----------- Form schema -----------
const checkoutFormSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    address: z.string().min(10, "Please enter your delivery address"),
    quantity: z.string().default("1"),
    isGift: z.boolean().default(false),
    giftRecipients: z
      .array(
        z.object({
          email: z.string().email("Invalid email"),
          name: z.string().min(1, "Name required"),
        })
      )
      .optional(),
    giftMessage: z.string().optional(),
  })
  .refine(
    (data) => {
      const qty = parseInt(data.quantity || "1", 10) || 1;
      if (!data.isGift && qty === 1) return true;

      // For multi-seat purchases: seat #1 is purchaser; seats 2+ are gifts
      const expectedRecipients = qty > 1 ? qty - 1 : 1;
      if (!data.giftRecipients || data.giftRecipients.length !== expectedRecipients) return false;
      return data.giftRecipients.every((r) => r.email && r.name);
    },
    { message: "Enter email and name for each recipient", path: ["giftRecipients"] }
  );

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

interface CheckoutPageProps {
  seatType?: string;
}

export default function CheckoutPage({ seatType: propSeatType }: CheckoutPageProps = {}) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  // seat type: prop > query ?seat= > default founder
  let seatType: "founder" | "patron" = "founder";
  if (propSeatType === "founder" || propSeatType === "patron") seatType = propSeatType;
  else if (params.get("seat") === "founder" || params.get("seat") === "patron")
    seatType = params.get("seat") as "founder" | "patron";

  // support ?payment=deposit or ?mode=deposit
  let urlPaymentType: "full" | "deposit" | "reserve" = "full";
  if (params.get("payment") === "deposit" || params.get("mode") === "deposit") urlPaymentType = "deposit";
  if (params.get("payment") === "reserve" || params.get("mode") === "reserve") urlPaymentType = "reserve";

  // quantity from URL
  const urlQuantity = Math.min(10, Math.max(1, parseInt(params.get("quantity") || "1", 10)));

  const { toast } = useToast();
  const [purchaseMode, setPurchaseMode] = useState<"cast_now" | "wait_for_season">("cast_now");
  const [selectedSpecimen, setSelectedSpecimen] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromo, setValidatedPromo] =
    useState<{ valid: boolean; discount?: number; seatType?: string } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // UI state
  const [quantity, setQuantity] = useState(urlQuantity.toString());
  const [hasPatina, setHasPatina] = useState(false);
  const [mountingType, setMountingType] = useState("none");
  const [paymentType, setPaymentType] = useState<"full" | "deposit" | "reserve">(urlPaymentType);

  // seasons
  const currentSeason = getCurrentSeason() as Season;
  const seasonInfo = getSeasonDisplay(currentSeason);
  const specimenCanCastNow = selectedSpecimen ? isAvailableForCastNow(selectedSpecimen, currentSeason) : true;
  const nextAvailableSeason = selectedSpecimen && !specimenCanCastNow
    ? getNextAvailableSeason(selectedSpecimen, currentSeason)
    : null;
  const nextSeasonInfo = nextAvailableSeason ? getSeasonDisplay(nextAvailableSeason) : null;

  useEffect(() => {
    if (selectedSpecimen && !specimenCanCastNow && purchaseMode === "cast_now") {
      setPurchaseMode("wait_for_season");
      toast({
        title: "Specimen not in season",
        description: `${specimenStyles.find((s) => s.id === selectedSpecimen)?.name
          } is not available for immediate casting. Switched to "Buy & Wait".`,
      });
    }
  }, [selectedSpecimen, specimenCanCastNow, purchaseMode, toast]);

  // availability + sculptures (for later)
  const { data: seats, isLoading: loadingSeats } = useQuery<any[]>({
    queryKey: ["/api/seats/availability"],
    staleTime: 0,
    refetchOnMount: true,
  });

  useQuery<Sculpture[]>({ queryKey: ["/api/sculptures"] });

  // seat pricing
  const normalizedSeatType = seatType.toLowerCase();
  const currentSeat = seats?.find((s) => s.type.toLowerCase() === normalizedSeatType);
  const basePriceCents =
    currentSeat?.fireSalePrice &&
      currentSeat?.fireSaleEndsAt &&
      new Date(currentSeat.fireSaleEndsAt) > new Date()
      ? currentSeat.fireSalePrice
      : currentSeat?.price || 0;

  // form
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      quantity: urlQuantity.toString(),
      isGift: urlQuantity > 1,
      giftRecipients: urlQuantity > 1 ? Array(urlQuantity - 1).fill({ email: "", name: "" }) : [],
      giftMessage: "",
    },
  });

  // ----------- mutations -----------
  const initiatePurchase = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const qty = parseInt(data.quantity || "1", 10) || 1;

      // validate recipients for multi-seat
      const expectedRecipients = qty > 1 ? qty - 1 : data.isGift ? 1 : 0;
      if (data.isGift && (!data.giftRecipients || data.giftRecipients.length !== expectedRecipients)) {
        throw new Error(`Please enter ${expectedRecipients} recipient(s)`);
      }

      // Multi-seat: seat #1 purchaser (not a gift), seats 2+ are gifts
      if (qty > 1) {
        const purchases: any[] = [];

        // seat 1
        const selfResponse = await apiRequest("POST", "/api/purchase/initiate", {
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
          isGift: false,
        });
        purchases.push(await selfResponse.json());

        // seats 2+
        for (const recipient of data.giftRecipients || []) {
          const res = await apiRequest("POST", "/api/purchase/initiate", {
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
          purchases.push(await res.json());
        }

        // return first purchase (redirect handler will know the amount)
        return purchases[0];
      }

      // single purchase (personal or single gift)
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
      if (!response || !response.purchaseId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not create purchase. Please try again.",
        });
        return;
      }

      if (response.paymentType === "reserve") {
        toast({
          title: "Seat Reserved!",
          description: "Your seat is held for 24 hours. Check your email for details.",
        });
        setLocation("/dashboard");
        return;
      }

      // simple, reliable same-origin redirect
      const redirectUrl = `/api/purchase/${response.purchaseId}/redirect`;
      window.location.assign(redirectUrl);
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
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Promo Code Error",
        description: error.message || "Failed to redeem promo code.",
      });
    },
  });

  // ----------- handlers -----------
  const handleCheckout = (data: CheckoutForm) => {
    // guard seat type binding for promo
    if (validatedPromo?.valid && validatedPromo.discount === 100) {
      if (validatedPromo.seatType && validatedPromo.seatType !== seatType) {
        toast({
          variant: "destructive",
          title: "Seat Type Mismatch",
          description: `This promo code is for ${validatedPromo.seatType} seats only.`,
        });
        return;
      }
      redeemPromo.mutate({ ...data, promoCode: promoCode.toUpperCase() });
      return;
    }

    initiatePurchase.mutate(data);
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
      toast({
        variant: result.valid ? "default" : "destructive",
        title: result.valid ? "Promo Code Applied!" : "Invalid Promo Code",
        description: result.valid ? `${result.discount}% discount applied` : result.message || "This code is not valid.",
      });
    } catch {
      setValidatedPromo(null);
      toast({ variant: "destructive", title: "Validation Error", description: "Could not validate promo code." });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // ----------- pricing (display only) -----------
  const qty = parseInt(quantity || "1", 10) || 1;

  // add-ons (cents)
  const patinaCost = hasPatina ? 100000 : 0;
  const mountingCosts: Record<string, number> = {
    none: 0,
    wall: 150000,
    base: 80000,
    custom: 120000,
  };
  const mountingCost = mountingCosts[mountingType] || 0;

  // base * qty, promo discounts only ONE seat (VIP rule)
  const totalBasePriceCents = basePriceCents * qty;
  const discountAmountCents =
    validatedPromo?.valid && typeof validatedPromo.discount === "number"
      ? Math.round(basePriceCents * (validatedPromo.discount / 100))
      : 0;

  const subtotalCents = totalBasePriceCents - discountAmountCents + patinaCost + mountingCost;

  let totalPriceCents = subtotalCents;
  if (paymentType === "deposit") totalPriceCents = 1; // (your existing behavior)
  if (paymentType === "reserve") totalPriceCents = 0;

  const seatLabel = seatType === "founder" ? "Founder" : "Patron";
  const seatColor = seatType === "founder" ? "bronze" : "accent-gold";

  const benefits =
    seatType === "founder"
      ? [
        "One-of-a-kind bronze casting (R25,000+ retail value)",
        "One 2-day bronze casting workshop at 50% discount",
        "20% lifetime discount on all future shop purchases",
        "Priority access to custom commissions",
        "Early access to future auction pieces",
        "Founding member status & certificate of authenticity",
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
        "Founding member status & premium certificate",
      ];

  return (
    <>
      <Header variant="checkout" backHref="/" backLabel="Back" context="Founding 100" />

      <main className="relative z-50 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-light mb-2 tracking-tight">
              <span className="hero-glass-text">{seatLabel} Seat</span>
            </h1>
            <p className="text-muted-foreground font-light">Secure your place in the Founding 100</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCheckout, (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (firstError?.message) {
                      toast({
                        variant: "destructive",
                        title: "Please complete all fields",
                        description: String(firstError.message),
                      });
                    }
                  })}
                  className="space-y-6"
                >
                  {/* Your Details */}
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
                              <Input {...field} data-testid="input-full-name" className="border-border/50" />
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
                              <Input {...field} type="email" data-testid="input-email" className="border-border/50" />
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
                              <Input {...field} data-testid="input-phone" className="border-border/50" />
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
                              <Textarea {...field} data-testid="input-address" className="border-border/50 min-h-20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Gift recipients (multi-seat) */}
                  {qty > 1 && (
                    <Card className="border-border/50 border-accent-gold/50 bg-accent-gold/5">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium text-accent-gold">Gift Recipients</CardTitle>
                        <CardDescription className="text-sm">
                          You’re purchasing {qty} seats: 1 for you + {qty - 1} gift{qty > 2 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                          <h4 className="font-medium text-sm mb-2 text-foreground">Seat 1: Your Seat</h4>
                          <p className="text-xs text-muted-foreground">
                            {form.getValues("fullName") || "Your name"} ({form.getValues("email") || "your@email"})
                          </p>
                        </div>

                        {Array.from({ length: qty - 1 }).map((_, index) => (
                          <div key={index + 1} className="space-y-3 p-4 rounded-lg bg-accent-gold/5 border border-accent-gold/30">
                            <h4 className="font-medium text-sm text-accent-gold">Seat {index + 2}: Gift Recipient</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name={`giftRecipients.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-normal text-muted-foreground">Recipient Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid={`input-gift-name-${index + 2}`} className="border-border/50 text-sm" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`giftRecipients.${index}.email`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-normal text-muted-foreground">Recipient Email</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" data-testid={`input-gift-email-${index + 2}`} className="border-border/50 text-sm" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Specimen */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Choose Your Specimen Style</CardTitle>
                      <CardDescription className="text-sm">
                        Select from 9 Cape Fynbos styles — David will personally curate the finest specimen for your chosen style.
                        <span className="block text-xs text-muted-foreground mt-2">
                          Not sure? Pick what appeals now — you can change it anytime from your dashboard before casting begins.
                        </span>
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
                                  <span className={`w-2 h-2 rounded-full ${available ? "bg-bronze" : "bg-border"}`} />
                                  <span>{style.name}</span>
                                  {!available && <span className="text-xs text-muted-foreground ml-1">(Wait for season)</span>}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {selectedSpecimen && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                          <p className="text-xs text-muted-foreground">
                            {specimenStyles.find((s) => s.id === selectedSpecimen)?.description}
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

                  {/* Cast timing */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-medium">Casting Timeline</CardTitle>
                      <CardDescription className="text-sm">
                        When should we cast your bronze?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg transition-all border ${!specimenCanCastNow && selectedSpecimen
                          ? "opacity-50 cursor-not-allowed border-border/30 bg-muted/20"
                          : purchaseMode === "cast_now"
                            ? `border-${seatColor}/60 bg-${seatColor}/5 cursor-pointer`
                            : "border-border/50 hover:border-border cursor-pointer"
                          }`}
                        onClick={() => {
                          if (specimenCanCastNow || !selectedSpecimen) setPurchaseMode("cast_now");
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
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {specimenCanCastNow || !selectedSpecimen
                              ? "Your specimen is in season — we'll begin casting soon"
                              : `${specimenStyles.find((s) => s.id === selectedSpecimen)?.name} peaks in ${nextSeasonInfo?.name || "another season"
                              }`}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all border ${purchaseMode === "wait_for_season"
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

                  {/* Founder add-ons */}
                  {seatType === "founder" && (
                    <Card className="border-border/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium">Upgrade Your Bronze</CardTitle>
                        <CardDescription className="text-sm">Optional enhancements for your sculpture</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">Patina Oxidation</label>
                              <p className="text-xs text-muted-foreground">Premium aged bronze surface finish</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHasPatina(!hasPatina)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${hasPatina
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

                  {/* Gift message (only when qty > 1) */}
                  {qty > 1 && (
                    <Card className="border-border/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-medium">Gift Message (Optional)</CardTitle>
                        <CardDescription className="text-sm">Add a personal note to your gift recipients</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="giftMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  data-testid="textarea-gift-message"
                                  className="min-h-20 text-sm"
                                  placeholder="Your message to the recipients..."
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Promo */}
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
                          {validatedPromo.discount}% discount applied (applies to 1 seat)
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full btn-bronze py-6 text-base"
                    disabled={initiatePurchase.isPending || redeemPromo.isPending || loadingSeats || !selectedSpecimen}
                    data-testid="button-complete-purchase"
                  >
                    {initiatePurchase.isPending || redeemPromo.isPending
                      ? "Processing..."
                      : validatedPromo?.valid && validatedPromo.discount === 100
                        ? "Claim Complimentary Seat"
                        : paymentType === "reserve"
                          ? "Reserve My Seat (Free)"
                          : paymentType === "deposit"
                            ? "Pay R1,000 Deposit"
                            : `Pay R${(totalPriceCents / 100).toLocaleString()}`}
                  </Button>

                  {!selectedSpecimen && (
                    <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                      Please select a specimen style above to continue
                    </p>
                  )}
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
                    <div className="text-3xl font-light">R{(totalPriceCents / 100).toLocaleString()}</div>
                    {discountAmountCents > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through mr-2">
                          R{(totalBasePriceCents / 100).toLocaleString()}
                        </span>
                        <span>– R{(discountAmountCents / 100).toLocaleString()} promo</span>
                      </div>
                    )}
                  </div>

                  {/* Included */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">What's Included</div>
                    <ul className="space-y-2">
                      {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className={`w-4 h-4 text-${seatColor} mt-0.5 flex-shrink-0`} />
                          <span className="text-foreground/80">
                            {i === 0 && seatType === "founder" ? (
                              <>
                                One-of-a-kind bronze casting (
                                <span className="font-light value-gradient">R25,000+ retail</span>)
                              </>
                            ) : (
                              benefit
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* After purchase */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">After Purchase</div>
                    <p className="text-xs text-muted-foreground">
                      You'll choose your specimen style, mounting options, and add-ons from your dashboard. Change anytime
                      before we start casting.
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
