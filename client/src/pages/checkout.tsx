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
import { Check } from "lucide-react";
import type { Sculpture } from "@shared/schema";

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
  
  const [selectedSpecimen, setSelectedSpecimen] = useState<string | null>(null);
  const [hasPatina, setHasPatina] = useState(false);

  // Fetch specimens
  const { data: specimens, isLoading: loadingSpecimens } = useQuery<Sculpture[]>({
    queryKey: ["/api/sculptures"],
  });

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
      if (!selectedSpecimen) {
        throw new Error("Please select a botanical specimen");
      }
      
      const response = await apiRequest("POST", "/api/purchase/initiate", {
        seatType,
        specimenId: selectedSpecimen,
        hasPatina,
        deliveryName: data.deliveryName,
        deliveryPhone: data.deliveryPhone,
        deliveryAddress: data.deliveryAddress,
      });
      
      return await response.json();
    },
    onSuccess: (response: any) => {
      // Submit form data to PayFast in a new window
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.paymentUrl;
      form.target = '_blank'; // Open in new tab
      
      // Add all form fields from formData
      Object.keys(response.formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = response.formData[key];
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      
      // Show user feedback
      toast({
        title: "Redirecting to Payment",
        description: "Opening PayFast in a new window. Please complete your payment there.",
      });
      
      form.submit();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Could not initiate payment. Please try again.",
      });
    },
  });

  const handleCheckout = (data: CheckoutForm) => {
    if (!selectedSpecimen) {
      toast({
        variant: "destructive",
        title: "No Specimen Selected",
        description: "Please select a botanical specimen for your bronze casting.",
      });
      return;
    }
    initiatePurchase.mutate(data);
  };

  // Price calculation - R10 for testing
  const basePrice = 10;
  const patinaPrice = hasPatina ? 10 : 0;
  const totalPrice = basePrice + patinaPrice;

  const seatLabel = seatType === "founder" ? "Founder Pass" : "Patron Pass";

  if (loadingSpecimens) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4" />
          <p className="text-muted-foreground">Loading botanical specimens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-[#d8c3a5]">Timeless Organics</h1>
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
            <h2 className="text-4xl font-serif text-[#d8c3a5] mb-2">Complete Your Investment</h2>
            <p className="text-xl text-[#a67c52]">{seatLabel} - R{basePrice.toLocaleString()}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Specimen Selection & Patina */}
            <div className="lg:col-span-2 space-y-8">
              {/* Specimen Selection */}
              <Card data-testid="card-specimen-selection">
                <CardHeader>
                  <CardTitle className="text-[#d8c3a5]">Select Your Botanical Specimen</CardTitle>
                  <CardDescription>
                    Choose one South African botanical to be cast in bronze. Your selection will be processed when the foundry is workshop-ready (estimated January 2026).
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
                  <CardTitle className="text-[#6f8f79]">Add Patina Finish</CardTitle>
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
                  <CardTitle className="text-[#d8c3a5]">Delivery Information</CardTitle>
                  <CardDescription>
                    Enter your delivery details for when your bronze is ready (January 2026)
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
              </Card>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24" data-testid="card-order-summary">
                <CardHeader>
                  <CardTitle className="text-[#d8c3a5]">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{seatLabel}</span>
                    <span className="font-semibold">R{basePrice.toLocaleString()}</span>
                  </div>

                  {hasPatina && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patina Finish</span>
                      <span className="font-semibold text-[#6f8f79]">+R10</span>
                    </div>
                  )}

                  {selectedSpecimen && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Selected Specimen:</p>
                      <p className="font-medium text-foreground">
                        {specimens?.find((s) => s.id === selectedSpecimen)?.name}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-[#a67c52]" data-testid="text-total-price">
                        R{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <p>✓ Workshop voucher ({seatType === "founder" ? "50%" : "80%"} off first workshop)</p>
                    <p>✓ Lifetime workshop code ({seatType === "founder" ? "20%" : "30%"} off forever)</p>
                    <p>✓ Guaranteed bronze casting</p>
                    <p>✓ Official investment certificate</p>
                    <p className="text-accent-gold">✓ Your name on the Wall of Leaves</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#a67c52] hover:bg-[#a67c52]/90 text-white"
                    size="lg"
                    onClick={form.handleSubmit(handleCheckout)}
                    disabled={!selectedSpecimen || initiatePurchase.isPending}
                    data-testid="button-proceed-payment"
                  >
                    {initiatePurchase.isPending ? "Processing..." : "Proceed to Payment"}
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
