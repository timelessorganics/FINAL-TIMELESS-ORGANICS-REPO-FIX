import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Seat, Purchase, Code, PromoCode } from "@shared/schema";
import { Users, Package, DollarSign, Award, Download, Gift, Copy } from "lucide-react";
import { useState } from "react";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [codeCount, setCodeCount] = useState("10");

  const { data: seats } = useQuery<Seat[]>({
    queryKey: ["/api/admin/seats"],
  });

  const { data: purchases } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/purchases"],
  });

  const { data: codes } = useQuery<Code[]>({
    queryKey: ["/api/admin/codes"],
  });

  const { data: promoCodes } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  const generateCodes = useMutation({
    mutationFn: async (count: number) => {
      const response = await apiRequest("POST", "/api/admin/promo-codes/generate", { count });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Codes Generated!",
        description: `Successfully generated ${codeCount} promo codes.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Could not generate codes.",
      });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Code ${code} copied to clipboard.`,
    });
  };

  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0) || 0;
  const completedPurchases = purchases?.filter((p) => p.status === "completed").length || 0;
  const totalSeats = seats?.reduce((sum, s) => sum + s.sold, 0) || 0;
  const unusedPromoCodes = promoCodes?.filter((pc) => !pc.used).length || 0;

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-7 py-12">
          {/* Header */}
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="kicker mb-3">ADMINISTRATOR</div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="moving-fill">Admin Panel</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Founding 100 Launch Analytics & Management
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                data-testid="button-export-customers"
                onClick={() => {
                  window.location.href = "/api/admin/export/subscribers";
                }}
              >
                <Download className="w-4 h-4" />
                Export Customers
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                data-testid="button-export-subscribers"
                onClick={() => {
                  window.location.href = "/api/admin/subscribers/export";
                }}
              >
                <Download className="w-4 h-4" />
                Export Pre-Launch List
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-patina" />
                <Badge className="bg-patina text-white">Live</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                {completedPurchases}
              </div>
              <div className="text-sm text-muted-foreground">Total Investors</div>
            </Card>

            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-bronze" />
                <Badge className="bg-bronze text-white">Seats</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                {totalSeats}/100
              </div>
              <div className="text-sm text-muted-foreground">Seats Sold</div>
            </Card>

            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-accent-gold" />
                <Badge className="bg-accent-gold text-black">Revenue</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                R{(totalRevenue / 100).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{completedPurchases} Purchases</div>
            </Card>

            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-patina" />
                <Badge className="bg-patina text-white">Active</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                {codes?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Codes Issued</div>
            </Card>
          </div>

          {/* Seat Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {seats?.map((seat) => {
              const available = seat.totalAvailable - seat.sold;
              const percentage = (seat.sold / seat.totalAvailable) * 100;

              return (
                <Card key={seat.id} className="bg-card border-card-border p-7">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-1 text-foreground">
                        {seat.type === "founder" ? "Founders Pass" : "Patron Gift Card"}
                      </h3>
                      <div className="text-accent-gold font-semibold">
                        R{(seat.price / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold font-serif text-foreground">
                        {available}
                      </div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-bronze to-accent-gold transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{seat.sold} sold</span>
                    <span>{percentage.toFixed(1)}% claimed</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Promo Code Management */}
          <Card className="bg-card border-card-border p-7 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                  Free Patron Passes
                </h2>
                <p className="text-sm text-muted-foreground">
                  Generate and manage promo codes for friends & family
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-patina" />
                <span className="font-semibold text-foreground">
                  {unusedPromoCodes} unused
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-muted rounded-lg border border-border">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Codes
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={codeCount}
                  onChange={(e) => setCodeCount(e.target.value)}
                  className="bg-background"
                  data-testid="input-code-count"
                />
              </div>
              <Button
                onClick={() => generateCodes.mutate(parseInt(codeCount) || 1)}
                disabled={generateCodes.isPending}
                className="bg-patina hover:bg-patina/90 text-white"
                data-testid="button-generate-codes"
              >
                <Gift className="w-4 h-4 mr-2" />
                {generateCodes.isPending ? "Generating..." : "Generate Codes"}
              </Button>
            </div>

            {promoCodes && promoCodes.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {promoCodes.map((promoCode) => (
                  <div
                    key={promoCode.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="font-mono text-lg font-bold text-foreground">
                          {promoCode.code}
                        </code>
                        {promoCode.used ? (
                          <Badge className="bg-bronze text-white">Used</Badge>
                        ) : (
                          <Badge className="bg-patina text-white">Active</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {promoCode.used
                          ? `Redeemed on ${new Date(promoCode.usedAt!).toLocaleDateString()}`
                          : "Ready to redeem"}
                      </div>
                    </div>
                    {!promoCode.used && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(promoCode.code)}
                        data-testid={`button-copy-${promoCode.code}`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No promo codes generated yet
              </div>
            )}
          </Card>

          {/* Recent Purchases */}
          <Card className="bg-card border-card-border p-7">
            <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">
              Recent Purchases
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases?.slice(0, 10).map((purchase) => (
                    <tr key={purchase.id} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm text-foreground">
                        {new Date(purchase.createdAt!).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground capitalize">
                        {purchase.seatType}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-accent-gold">
                        R{(purchase.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            purchase.status === "completed"
                              ? "bg-patina text-white"
                              : purchase.status === "pending"
                              ? "bg-bronze text-white"
                              : "bg-destructive text-white"
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {purchase.paymentReference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
