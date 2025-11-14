import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Gift, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Purchase } from "@shared/schema";

export default function ClaimGiftPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const purchaseId = searchParams.get("id");

  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const { data: purchase, isLoading: purchaseLoading, error } = useQuery<Purchase>({
    queryKey: ["/api/gift/details", purchaseId],
    enabled: !!purchaseId,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!purchaseId) throw new Error("No purchase ID");
      return await apiRequest("POST", `/api/gift/claim/${purchaseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Gift Claimed!",
        description: "Your Founding 100 seat has been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gift/details", purchaseId] });
      setTimeout(() => navigate("/dashboard"), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim gift. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!purchaseId) {
      toast({
        title: "Invalid Link",
        description: "This gift claim link is invalid. Please check your email.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [purchaseId, navigate, toast]);

  if (userLoading || purchaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bronze/5 via-background to-patina/5">
        <Loader2 className="w-8 h-8 animate-spin text-bronze" />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bronze/5 via-background to-patina/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Gift Not Found
            </CardTitle>
            <CardDescription>
              This gift link is invalid or has expired. Please contact the person who sent it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")} className="w-full" data-testid="button-home">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isAlreadyClaimed = purchase.giftStatus === "claimed";
  const isClaimedByCurrentUser = user?.id === purchase.claimedByUserId;
  const seatName = purchase.seatType === "founder" ? "Founder" : "Patron";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bronze/5 via-background to-patina/5 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-bronze to-bronze-dark rounded-full flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif">
            {isAlreadyClaimed && isClaimedByCurrentUser
              ? "Your Founding 100 Seat"
              : "You've Received a Gift!"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isAlreadyClaimed && !isClaimedByCurrentUser
              ? "This gift has already been claimed."
              : `A ${seatName} seat in the exclusive Founding 100 of Timeless Organics`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {purchase.giftMessage && (
            <div className="bg-muted/50 border-l-4 border-bronze p-4 rounded-md">
              <p className="text-sm font-medium mb-1 text-muted-foreground">
                Message from the sender:
              </p>
              <p className="italic text-foreground">"{purchase.giftMessage}"</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Your {seatName} Seat Includes:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                <span>
                  One bespoke bronze Cape Fynbos sculpture (your choice of 12 specimen styles)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                <span>Certificate of authenticity signed by David van Heerden</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                <span>
                  Exclusive workshop voucher ({purchase.seatType === "founder" ? "80%" : "50%"} off
                  your first workshop)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-bronze mt-0.5 flex-shrink-0" />
                <span>
                  Lifetime workshop discounts ({purchase.seatType === "founder" ? "30%" : "20%"} off
                  all future workshops)
                </span>
              </li>
            </ul>
          </div>

          {isAlreadyClaimed && !isClaimedByCurrentUser && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
              <p className="text-sm text-destructive font-medium">
                This gift has already been claimed by another account.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {!user ? (
            <>
              <p className="text-sm text-center text-muted-foreground mb-2">
                Sign in or create an account to claim your gift
              </p>
              <Button
                onClick={() => {
                  window.location.href = `/api/auth/login?returnUrl=${encodeURIComponent(
                    `/claim-gift?id=${purchaseId}`
                  )}`;
                }}
                className="w-full"
                size="lg"
                data-testid="button-login-claim"
              >
                Sign In to Claim Gift
              </Button>
            </>
          ) : isAlreadyClaimed && isClaimedByCurrentUser ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full"
              size="lg"
              data-testid="button-view-dashboard"
            >
              View My Dashboard
            </Button>
          ) : isAlreadyClaimed ? (
            <Button onClick={() => navigate("/")} variant="outline" className="w-full" size="lg" data-testid="button-home-claimed">
              Return Home
            </Button>
          ) : (
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="w-full"
              size="lg"
              data-testid="button-claim-gift"
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim My Founding 100 Seat"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
