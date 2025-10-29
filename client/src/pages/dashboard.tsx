import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Purchase, Code, User } from "@shared/schema";
import { Download, ExternalLink, User as UserIcon, Sparkles, CalendarDays, Upload, Clock, Leaf, Flame, Package } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

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

          {/* User Profile Card */}
          {user && (
            <Card className="bg-card/60 border-card-border p-6 mb-8" data-testid="user-profile-card">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-bronze/20 border-2 border-bronze/50 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-bronze" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1" data-testid="user-name">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.firstName || user.email}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="user-email">
                    {user.email}
                  </p>
                </div>
                <Badge className="bg-patina/20 text-patina border-patina/30">
                  Founding Member
                </Badge>
              </div>
            </Card>
          )}


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

                  {/* Purchase Choice & Production Status */}
                  {purchase.status === 'completed' && (
                    <div className="mb-6 space-y-4">
                      {/* Purchase Choice */}
                      <div className="p-4 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          {purchase.purchaseChoice === 'cast_now' && (
                            <>
                              <Sparkles className="w-5 h-5 text-bronze" />
                              <h3 className="font-semibold text-foreground">Cast Now Selection</h3>
                            </>
                          )}
                          {purchase.purchaseChoice === 'wait_till_season' && (
                            <>
                              <CalendarDays className="w-5 h-5 text-patina" />
                              <h3 className="font-semibold text-foreground">Waiting for Peak Season</h3>
                            </>
                          )}
                          {purchase.purchaseChoice === 'provide_your_own' && (
                            <>
                              <Upload className="w-5 h-5 text-accent" />
                              <h3 className="font-semibold text-foreground">Custom Specimen</h3>
                            </>
                          )}
                        </div>
                        
                        {/* Specimen Style (for Wait Till Season) */}
                        {purchase.specimenStyle && (
                          <div className="text-sm text-secondary mb-2">
                            <span className="font-medium">Chosen Style:</span> {purchase.specimenStyle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        )}
                        
                        {/* Seasonal Batch Window */}
                        {purchase.seasonalBatchWindow && (
                          <div className="text-sm text-secondary mb-2">
                            <span className="font-medium">Batch Window:</span> {purchase.seasonalBatchWindow}
                          </div>
                        )}
                        
                        {/* Custom Specimen Approval Status */}
                        {purchase.purchaseChoice === 'provide_your_own' && purchase.customSpecimenApprovalStatus && (
                          <div className="mt-3">
                            <Badge className={
                              purchase.customSpecimenApprovalStatus === 'approved' 
                                ? "bg-patina/20 text-patina border-patina/30"
                                : purchase.customSpecimenApprovalStatus === 'pending'
                                ? "bg-bronze/20 text-bronze border-bronze/30"
                                : "bg-destructive/20 text-destructive border-destructive/30"
                            }>
                              {purchase.customSpecimenApprovalStatus === 'approved' && '✓ Approved for Casting'}
                              {purchase.customSpecimenApprovalStatus === 'pending' && '⏳ Under Review'}
                              {purchase.customSpecimenApprovalStatus === 'rejected' && '✗ Not Viable for Casting'}
                            </Badge>
                            {purchase.customSpecimenNotes && (
                              <p className="text-sm text-secondary mt-2">
                                <span className="font-medium">Studio Notes:</span> {purchase.customSpecimenNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Production Status Tracker */}
                      <div className="p-4 bg-background/50 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-bronze" />
                          Production Status
                        </h3>
                        <div className="flex items-center justify-between gap-2">
                          {['queued', 'invested', 'ready_to_pour', 'poured_finishing', 'complete'].map((status, index) => {
                            const currentIndex = ['queued', 'invested', 'ready_to_pour', 'poured_finishing', 'complete'].indexOf(purchase.productionStatus);
                            const isActive = index <= currentIndex;
                            const isCurrent = status === purchase.productionStatus;
                            
                            return (
                              <div key={status} className="flex-1 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                                  isCurrent 
                                    ? "bg-bronze text-white ring-2 ring-bronze ring-offset-2" 
                                    : isActive 
                                    ? "bg-patina/30 text-patina" 
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {status === 'queued' && <Clock className="w-4 h-4" />}
                                  {status === 'invested' && <Leaf className="w-4 h-4" />}
                                  {status === 'ready_to_pour' && <Package className="w-4 h-4" />}
                                  {status === 'poured_finishing' && <Flame className="w-4 h-4" />}
                                  {status === 'complete' && <Download className="w-4 h-4" />}
                                </div>
                                <div className={`text-xs text-center ${
                                  isCurrent ? "font-semibold text-foreground" : "text-secondary"
                                }`}>
                                  {status === 'queued' && 'Queued'}
                                  {status === 'invested' && 'Invested'}
                                  {status === 'ready_to_pour' && 'Ready'}
                                  {status === 'poured_finishing' && 'Casting'}
                                  {status === 'complete' && 'Complete'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

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
                                {code.type === "workshop_voucher"
                                  ? `Workshop Voucher (${code.discount}% Off)`
                                  : "Lifetime Workshop Code (Referral)"}
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
