import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Upload, CalendarDays, Sparkles, Info } from "lucide-react";
import type { Sculpture } from "@shared/schema";

const checkoutFormSchema = z.object({
  purchaseChoice: z.enum(["cast_now", "wait_till_season", "provide_your_own"]),
  specimenId: z.string().optional(),
  specimenStyle: z.string().optional(),
  customSpecimenPhotoUrl: z.string().optional(),
  deliveryName: z.string().min(2, "Name must be at least 2 characters"),
  deliveryPhone: z.string().min(10, "Please enter a valid phone number"),
  deliveryAddress: z.string().min(10, "Please enter your full delivery address"),
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

interface CheckoutPageProps {
  seatType: "founder" | "patron";
}

// Specimen styles data (matching the seasonal guide)
const specimenStyles = [
  { value: "protea_head", label: "Protea Head", season: "Winter–Spring" },
  { value: "pincushion_bloom", label: "Pincushion Bloom", season: "Late Winter–Spring" },
  { value: "cone_bracts", label: "Cone + Bracts", season: "Autumn–Spring" },
  { value: "aloe_inflorescence", label: "Aloe Inflorescence", season: "Winter" },
  { value: "erica_spray", label: "Erica Spray", season: "Winter–Spring" },
  { value: "restio_seedheads", label: "Restio Seedheads", season: "Autumn–Winter" },
  { value: "bulb_spike", label: "Bulb Spike", season: "Spring–Early Summer" },
  { value: "pelargonium_leaf", label: "Pelargonium Leaf/Flower", season: "Spring" },
  { value: "woody_branch", label: "Woody Branch + Leaves", season: "Year-round" },
  { value: "cone_seedpod", label: "Cone/Seed Pod", season: "Autumn–Spring" },
  { value: "succulent_rosette", label: "Succulent Rosette", season: "Year-round" },
  { value: "miniature_mix", label: "Miniature Mix", season: "All Seasons" },
];

export default function CheckoutPage({ seatType }: CheckoutPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [hasPatina, setHasPatina] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Fetch specimens (for Cast Now option)
  const { data: specimens, isLoading: loadingSpecimens } = useQuery<Sculpture[]>({
    queryKey: ["/api/sculptures"],
  });

  // Form setup
  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      purchaseChoice: "cast_now",
      deliveryName: "",
      deliveryPhone: "",
      deliveryAddress: "",
    },
  });

  const purchaseChoice = form.watch("purchaseChoice");
  const selectedSpecimen = form.watch("specimenId");

  // Handle photo upload for "Provide Your Own"
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        form.setValue("customSpecimenPhotoUrl", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Purchase initiation mutation
  const initiatePurchase = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      // Validation based on purchase choice
      if (data.purchaseChoice === "cast_now" && !data.specimenId) {
        throw new Error("Please select a botanical specimen");
      }
      if (data.purchaseChoice === "wait_till_season" && !data.specimenStyle) {
        throw new Error("Please select a specimen style");
      }
      if (data.purchaseChoice === "provide_your_own" && !data.customSpecimenPhotoUrl) {
        throw new Error("Please upload a photo of your desired specimen");
      }
      
      const response = await apiRequest("POST", "/api/purchase/initiate", {
        seatType,
        purchaseChoice: data.purchaseChoice,
        specimenId: data.specimenId,
        specimenStyle: data.specimenStyle,
        hasPatina,
        customSpecimenPhotoUrl: data.customSpecimenPhotoUrl,
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

  const handleCheckout = (data: CheckoutForm) => {
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
              <h1 className="text-2xl font-serif text-bronze">Timeless Organics</h1>
              <p className="text-sm text-secondary">Founding 100 Checkout</p>
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
            <Link href="/seasonal-guide">
              <Button variant="ghost" className="text-patina mt-2" data-testid="link-seasonal-guide">
                <Info className="w-4 h-4 mr-2" />
                Learn about seasonal specimens
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Purchase Choice, Specimen Selection & Delivery */}
            <div className="lg:col-span-2 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-8">
                  
                  {/* Purchase Choice Selection */}
                  <Card data-testid="card-purchase-choice">
                    <CardHeader>
                      <CardTitle className="text-bronze">Choose Your Path</CardTitle>
                      <CardDescription>
                        Select how you'd like to proceed with your botanical specimen selection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="purchaseChoice"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  field.value === "cast_now" ? "border-bronze bg-bronze/10" : "border-border"
                                }`}>
                                  <RadioGroupItem value="cast_now" id="cast_now" data-testid="radio-cast-now" />
                                  <label htmlFor="cast_now" className="flex-1 cursor-pointer">
                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 text-bronze" />
                                      Cast Now
                                    </div>
                                    <p className="text-sm text-secondary mt-1">
                                      Studio selects the best in-season specimen. Fastest turnaround.
                                    </p>
                                  </label>
                                </div>

                                <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  field.value === "wait_till_season" ? "border-patina bg-patina/10" : "border-border"
                                }`}>
                                  <RadioGroupItem value="wait_till_season" id="wait_till_season" data-testid="radio-wait-season" />
                                  <label htmlFor="wait_till_season" className="flex-1 cursor-pointer">
                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                      <CalendarDays className="w-4 h-4 text-patina" />
                                      Wait Till Season
                                    </div>
                                    <p className="text-sm text-secondary mt-1">
                                      Choose your specimen style. We'll cast it in its next peak window.
                                    </p>
                                  </label>
                                </div>

                                <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  field.value === "provide_your_own" ? "border-accent bg-accent/10" : "border-border"
                                }`}>
                                  <RadioGroupItem value="provide_your_own" id="provide_your_own" data-testid="radio-provide-own" />
                                  <label htmlFor="provide_your_own" className="flex-1 cursor-pointer">
                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                      <Upload className="w-4 h-4 text-accent" />
                                      Provide Your Own (Founder's Choice)
                                    </div>
                                    <p className="text-sm text-secondary mt-1">
                                      Upload a photo for approval. We'll cast it if viable (48-72h review).
                                    </p>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Conditional Content Based on Purchase Choice */}
                  {purchaseChoice === "cast_now" && (
                    <Card data-testid="card-specimen-selection">
                      <CardHeader>
                        <CardTitle className="text-bronze">Select Your Botanical Specimen</CardTitle>
                        <CardDescription>
                          Choose one South African botanical to be cast in bronze from our current in-season collection.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="specimenId"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  {specimens?.map((specimen) => (
                                    <button
                                      key={specimen.id}
                                      type="button"
                                      onClick={() => field.onChange(specimen.id)}
                                      className={`relative p-4 rounded-lg border-2 transition-all text-left hover-elevate ${
                                        field.value === specimen.id
                                          ? "border-bronze bg-bronze/10"
                                          : "border-border bg-card"
                                      }`}
                                      data-testid={`button-specimen-${specimen.id}`}
                                    >
                                      {field.value === specimen.id && (
                                        <div className="absolute top-2 right-2 bg-bronze text-white rounded-full p-1">
                                          <Check className="w-4 h-4" />
                                        </div>
                                      )}
                                      <h3 className="font-semibold text-foreground mb-1">{specimen.name}</h3>
                                      <p className="text-sm text-secondary">{specimen.description}</p>
                                    </button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {purchaseChoice === "wait_till_season" && (
                    <Card data-testid="card-specimen-style">
                      <CardHeader>
                        <CardTitle className="text-patina">Select Your Specimen Style</CardTitle>
                        <CardDescription>
                          Choose the botanical form you'd like. We'll cast it when it reaches peak beauty.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="specimenStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specimen Style</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-specimen-style">
                                    <SelectValue placeholder="Choose a specimen style" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {specimenStyles.map((style) => (
                                    <SelectItem key={style.value} value={style.value}>
                                      {style.label} ({style.season})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Each style has its own seasonal window when specimens are at their finest.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {purchaseChoice === "provide_your_own" && (
                    <Card data-testid="card-photo-upload">
                      <CardHeader>
                        <CardTitle className="text-accent">Upload Your Specimen Photo</CardTitle>
                        <CardDescription>
                          Provide a clear photo of the botanical you'd like cast. We'll review for cast-ability within 48-72 hours.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="customSpecimenPhotoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specimen Photo</FormLabel>
                              <FormControl>
                                <div className="space-y-4">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    data-testid="input-photo-upload"
                                  />
                                  {photoPreview && (
                                    <div className="mt-4">
                                      <img
                                        src={photoPreview}
                                        alt="Specimen preview"
                                        className="max-w-sm rounded-lg border border-border"
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormDescription>
                                Upload a clear, well-lit photo showing the form you want cast.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                          <h4 className="font-semibold text-foreground mb-2">Approval Process</h4>
                          <ul className="text-sm text-secondary space-y-1">
                            <li>• We'll confirm cast-ability within 48-72 hours</li>
                            <li>• Must hold detail and be safe to burn out</li>
                            <li>• Legal & ethical sourcing only</li>
                            <li>• If not approved, you can switch to Cast Now or Wait Till Season</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                          <p className="text-sm text-secondary">
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
                  <div className="flex justify-between">
                    <span className="text-secondary">{seatLabel}</span>
                    <span className="font-semibold">R{basePrice.toLocaleString()}</span>
                  </div>

                  {hasPatina && (
                    <div className="flex justify-between">
                      <span className="text-secondary">Patina Finish</span>
                      <span className="font-semibold text-patina">+R10</span>
                    </div>
                  )}

                  {selectedSpecimen && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-secondary mb-2">Selected Specimen:</p>
                      <p className="font-medium text-foreground">
                        {specimens?.find((s) => s.id === selectedSpecimen)?.name}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-bronze" data-testid="text-total-price">
                        R{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-sm text-secondary">
                    <p>✓ Workshop voucher ({seatType === "founder" ? "50%" : "80%"} off first workshop)</p>
                    <p>✓ Lifetime workshop code ({seatType === "founder" ? "20%" : "30%"} off forever)</p>
                    <p>✓ Guaranteed bronze casting</p>
                    <p>✓ Official investment certificate</p>
                    <p className="text-accent">✓ Your name on the Wall of Leaves</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-bronze hover:bg-bronze/90 text-white"
                    size="lg"
                    onClick={form.handleSubmit(handleCheckout)}
                    disabled={initiatePurchase.isPending}
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
