import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Purchase, Code } from "@shared/schema";
import { Download, ExternalLink } from "lucide-react";

export default function Dashboard() {
  const { data: purchases, isLoading } = useQuery<(Purchase & { codes: Code[] })[]>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-7 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="kicker mb-3">YOUR FOUNDING STATUS</div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="moving-fill">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your investments, codes, and certificates
            </p>
          </div>


          {/* Purchases */}
          <div className="space-y-6">
            {purchases && purchases.length > 0 ? (
              purchases.map((purchase) => (
                <Card key={purchase.id} className="bg-card border-card-border p-7" data-testid={`purchase-${purchase.id}`}>
                  {/* Purchase Header */}
                  <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-serif text-2xl font-bold text-foreground">
                          {purchase.seatType === "founder" ? "Founders Pass" : "Patron Gift Card"}
                        </h2>
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
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Purchased on {new Date(purchase.createdAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent-gold">
                        R{(purchase.amount / 100).toFixed(2)}
                      </div>
                      {purchase.paymentReference && (
                        <div className="text-xs text-muted-foreground mono">
                          Ref: {purchase.paymentReference}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pending Purchase Notice */}
                  {purchase.status === 'pending' && (
                    <div className="mb-6 p-4 bg-bronze/10 border border-bronze/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-bronze text-xl">⏳</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground mb-2">Complete Your Payment</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            This purchase is awaiting PayFast payment confirmation. Once payment is completed, your codes and certificate will be generated automatically.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={() => window.location.href = '/founding100'}
                            data-testid="button-complete-payment"
                          >
                            Return to Invest Page
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Codes Section */}
                  {purchase.codes && purchase.codes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                        Your Lifetime Codes:
                      </h3>
                      <div className="grid gap-3">
                        {purchase.codes.map((code) => (
                          <div
                            key={code.id}
                            className="flex flex-wrap justify-between items-center gap-4 p-4 bg-background/50 rounded-lg border border-border"
                            data-testid={`code-${code.type}`}
                          >
                            <div className="flex-1">
                              <div className="text-xs text-patina font-semibold uppercase mb-1">
                                {code.type === "bronze_claim"
                                  ? "Bronze Claim Code"
                                  : code.type === "workshop_voucher"
                                  ? `Workshop Voucher (${code.discount}% Off)`
                                  : "Lifetime Referral Code"}
                              </div>
                              <div className="font-mono text-lg font-bold text-accent-gold">
                                {code.code}
                              </div>
                              {code.transferable && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Transferable • Lifetime Use
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(code.code)}
                              data-testid={`button-copy-${code.type}`}
                            >
                              Copy Code
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificate Download */}
                  {purchase.certificateUrl && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        asChild
                        className="btn-bronze"
                        data-testid="button-download-certificate"
                      >
                        <a
                          href={purchase.certificateUrl}
                          download
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span className="moving-fill">Download Certificate</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="bg-card border-card-border p-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">
                  You haven't made any purchases yet
                </p>
                <Button asChild className="btn-bronze">
                  <a href="/">
                    <span className="moving-fill">Explore Founding Seats</span>
                  </a>
                </Button>
              </Card>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-12">
            <Card className="bg-card border-card-border p-7">
              <h3 className="font-serif text-xl font-bold mb-4">
                Need Help?
              </h3>
              <p className="text-muted-foreground mb-4">
                For questions about your codes, cutting selection, or bronze castings,
                please contact us at{" "}
                <a
                  href="mailto:support@timelessorganics.com"
                  className="text-accent-gold hover:underline"
                >
                  support@timelessorganics.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground italic">
                Workshop scheduling will open after your purchase is complete and your cutting is selected.
              </p>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
