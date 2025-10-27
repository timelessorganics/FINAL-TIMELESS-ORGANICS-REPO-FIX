import { useState } from "react";
import { useLocation } from "wouter";
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
import { Check, Gift } from "lucide-react";
import type { Sculpture } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";

const deliveryFormSchema = z.object({
  deliveryName: z.string().min(2, "Name must be at least 2 characters"),
  deliveryPhone: z.string().min(10, "Please enter a valid phone number"),
  deliveryAddress: z.string().min(10, "Please enter your full delivery address"),
});

type DeliveryForm = z.infer<typeof deliveryFormSchema>;

export default function RedeemCodePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [promoCode, setPromoCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState<string | null>(null);
  const [hasPatina, setHasPatina] = useState(false);

  // Fetch specimens
  const { data: specimens, isLoading: loadingSpecimens } = useQuery<Sculpture[]>({
    queryKey: ["/api/sculptures"],
  });

  // Form setup
  const form = useForm<DeliveryForm>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      deliveryName: "",
      deliveryPhone: "",
      deliveryAddress: "",
    },
  });

  // Validate promo code
  const validateCode = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/promo-code/validate", { code });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.valid) {
        setCodeValidated(true);
        toast({
          title: "Code Validated!",
          description: `You're redeeming a free ${data.seatType === 'founder' ? 'Founder' : 'Patron'} Pass!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: data.message || "This code is not valid or has already been used.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: error.message || "Could not validate code. Please try again.",
      });
    },
  });

  // Redeem promo code
  const redeemCode = useMutation({
    mutationFn: async (data: DeliveryForm) => {
      if (!selectedSpecimen) {
        throw new Error("Please select a botanical specimen");
      }
      
      return apiRequest("POST", "/api/promo-code/redeem", {
        code: promoCode,
        specimenId: selectedSpecimen,
        hasPatina,
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
      });
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the Founding 100!",
        description: "Your Patron Pass has been activated. Check your dashboard for your certificate and codes.",
      });
      // Redirect to dashboard
      setTimeout(() => setLocation("/dashboard"), 2000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Redemption Failed",
        description: error.message || "Could not redeem code. Please try again.",
      });
    },
  });

  const handleValidate = () => {
    if (!promoCode.trim()) {
      toast({
        variant: "destructive",
        title: "No Code Entered",
        description: "Please enter your promo code.",
      });
      return;
    }
    validateCode.mutate(promoCode);
  };

  const handleRedeem = (data: DeliveryForm) => {
    if (!selectedSpecimen) {
      toast({
        variant: "destructive",
        title: "No Specimen Selected",
        description: "Please select a botanical specimen for your bronze casting.",
      });
      return;
    }
    redeemCode.mutate(data);
  };

  if (loadingSpecimens) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-12">
              <Gift className="w-16 h-16 text-[#a67c52] mx-auto mb-4" />
              <h2 className="text-4xl font-serif text-[#d8c3a5] mb-2">Redeem Your Free Pass</h2>
              <p className="text-lg text-muted-foreground">
                Enter your special code to claim your complimentary Patron Pass
              </p>
            </div>

            {!codeValidated ? (
              /* Code Entry */
              <Card data-testid="card-code-entry" className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-[#d8c3a5]">Enter Promo Code</CardTitle>
                  <CardDescription>
                    Enter the special code you received to redeem your free Patron Pass
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="PATRON-GIFT-XXXX"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg"
                    data-testid="input-promo-code"
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#a67c52] hover:bg-[#a67c52]/90 text-white"
                    onClick={handleValidate}
                    disabled={validateCode.isPending || !promoCode.trim()}
                    data-testid="button-validate-code"
                  >
                    {validateCode.isPending ? "Validating..." : "Validate Code"}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              /* Checkout Flow */
              <div className="space-y-8">
                {/* Specimen Selection */}
                <Card data-testid="card-specimen-selection">
                  <CardHeader>
                    <CardTitle className="text-[#d8c3a5]">Select Your Botanical Specimen</CardTitle>
                    <CardDescription>
                      Choose one South African botanical to be cast in bronze
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {specimens?.map((specimen) => (
                        <button
                          key={specimen.id}
                          type="button"
                          onClick={() => setSelectedSpecimen(specimen.id)}
                          className={`relative p-4 rounded-lg border-2 transition-all text-left hover-elevate ${
                            selectedSpecimen === specimen.id
                              ? "border-[#a67c52] bg-[#a67c52]/10"
                              : "border-border bg-card"
                          }`}
                          data-testid={`button-specimen-${specimen.id}`}
                        >
                          {selectedSpecimen === specimen.id && (
                            <div className="absolute top-2 right-2 bg-[#a67c52] text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                          <h3 className="font-semibold text-foreground mb-1">{specimen.name}</h3>
                          <p className="text-sm text-muted-foreground">{specimen.description}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Patina Option */}
                <Card data-testid="card-patina-option">
                  <CardHeader>
                    <CardTitle className="text-[#6f8f79]">Add Patina Finish (Optional)</CardTitle>
                    <CardDescription>
                      Enhance your bronze with a natural green patina finish - complimentary for you!
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
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Add Patina Finish
                        </label>
                        <p className="text-sm text-muted-foreground">
                          A chemical process that creates a distinctive green-blue oxidation on the bronze surface
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Details */}
                <Card data-testid="card-delivery-form">
                  <CardHeader>
                    <CardTitle className="text-[#d8c3a5]">Delivery Information</CardTitle>
                    <CardDescription>
                      Enter your details for when your bronze is ready (January 2026)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-4">
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
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-[#a67c52] hover:bg-[#a67c52]/90 text-white"
                      size="lg"
                      onClick={form.handleSubmit(handleRedeem)}
                      disabled={!selectedSpecimen || redeemCode.isPending}
                      data-testid="button-complete-redemption"
                    >
                      {redeemCode.isPending ? "Processing..." : "Complete Redemption"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Summary */}
                <Card className="bg-[#a67c52]/10 border-[#a67c52]">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground mb-2">Free Patron Pass</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Includes: 50% workshop voucher • 20% lifetime discount • Bronze casting • Official certificate
                      </p>
                      {selectedSpecimen && (
                        <p className="text-sm text-[#a67c52] font-medium">
                          Selected: {specimens?.find((s) => s.id === selectedSpecimen)?.name}
                          {hasPatina && " with Patina Finish"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
