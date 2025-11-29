import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

// Form validation schema
const interestFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number is required"),
  notes: z.string().optional(),
});

type InterestFormValues = z.infer<typeof interestFormSchema>;

export function InterestForm() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [countryCode, setCountryCode] = useState("+27");

  const form = useForm<InterestFormValues>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InterestFormValues) => {
      return await apiRequest("POST", "/api/subscribers", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      toast({
        title: "Thank you!",
        description: "We've received your information and will be in touch soon.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please try again or contact us directly.",
      });
    },
  });

  const onSubmit = (data: InterestFormValues) => {
    registerMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div 
        className="rounded-lg border border-bronze/30 bg-background/50 backdrop-blur-sm p-8 text-center"
        data-testid="form-success"
      >
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-bronze" />
        <h3 className="text-2xl font-display text-bronze mb-2">
          You're on the List
        </h3>
        <p className="text-muted-foreground mb-6">
          Thank you for your interest in the Timeless Organics Founding 100. 
          We'll reach out soon with exclusive updates and launch details.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          data-testid="button-register-another"
          className="border-bronze/50 text-bronze hover-elevate active-elevate-2"
        >
          Register Another
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg border border-bronze/30 bg-background/50 backdrop-blur-sm p-6 md:p-8"
      data-testid="form-interest"
    >
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-display text-bronze mb-2">
          Register Your Interest
        </h3>
        <p className="text-sm text-muted-foreground">
          Join our exclusive mailing list for launch updates, workshop announcements, and early access opportunities.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-bronze/90">Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full Name"
                    data-testid="input-name"
                    className="border-bronze/30 bg-background/80 focus:border-bronze"
                    autoComplete="off"
                    {...field}
                  />
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
                <FormLabel className="text-bronze/90">Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    data-testid="input-email"
                    className="border-bronze/30 bg-background/80 focus:border-bronze"
                    autoComplete="off"
                    {...field}
                  />
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
                <FormLabel className="text-bronze/90">
                  Phone Number <span className="text-xs text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+27 XX XXX XXXX"
                    data-testid="input-phone"
                    className="border-bronze/30 bg-background/80 focus:border-bronze"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-bronze/90">
                  Notes <span className="text-xs text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your interest in bronze casting or workshops..."
                    data-testid="input-notes"
                    className="border-bronze/30 bg-background/80 focus:border-bronze resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            data-testid="button-submit-interest"
            className="w-full bg-bronze/20 border border-bronze/50 text-bronze backdrop-blur-sm hover-elevate active-elevate-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register My Interest"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        We respect your privacy. Your information will only be used for Timeless Organics communications.
      </p>
    </div>
  );
}
