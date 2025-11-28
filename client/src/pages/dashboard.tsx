import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Purchase, Code, User } from "@shared/schema";
import { Download, ExternalLink, User as UserIcon, Sparkles, CalendarDays, Upload, Clock, Leaf, Flame, Package, Gift, Check, Loader2, Edit2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PATINA_OPTIONS = [
  { value: "natural", label: "Natural Bronze", description: "Classic golden-brown that develops over time" },
  { value: "antique_copper", label: "Antique Copper", description: "Warm reddish-brown patina" },
  { value: "verdigris", label: "Verdigris Green", description: "Blue-green oxidized finish" },
  { value: "custom", label: "Custom Aging", description: "Discuss with David for unique finish" },
];

const MOUNTING_OPTIONS = [
  { value: "none", label: "No mounting", description: "Display on shelf or mantle" },
  { value: "wall", label: "Wall mount", description: "Stainless steel hardware (+R1,000 deposit)" },
  { value: "base", label: "Display base", description: "Wood or slate base (+R1,000 deposit)" },
  { value: "custom", label: "Custom installation", description: "Discuss with David (+R1,000 deposit)" },
];

function CustomizeExtras({ purchase }: { purchase: Purchase & { codes: Code[] } }) {
  const { toast } = useToast();
  const [selectedPatina, setSelectedPatina] = useState(purchase.hasPatina ? "natural" : "none");
  const [selectedMounting, setSelectedMounting] = useState(purchase.mountingType || "none");
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (updates: { mountingType?: string; hasPatina?: boolean }) => {
      return apiRequest("PATCH", `/api/purchase/${purchase.id}/preferences`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Preferences Updated",
        description: "Your customization choices have been saved.",
      });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      mountingType: selectedMounting,
      hasPatina: selectedPatina !== "none",
    });
  };

  const handlePatinaChange = (value: string) => {
    setSelectedPatina(value);
    setHasChanges(true);
  };

  const handleMountingChange = (value: string) => {
    setSelectedMounting(value);
    setHasChanges(true);
  };

  return (
    <div className="p-4 bg-background/50 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-gold" />
          Customize Your Extras
        </h3>
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="btn-save-preferences"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-1" />
            )}
            Save Changes
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Patina Finish */}
        <div className="p-3 rounded bg-background border border-border/50">
          <div className="font-medium text-sm text-foreground mb-2">Patina Finish</div>
          <p className="text-xs text-muted-foreground mb-3">Choose how your bronze will age and patina</p>
          <div className="grid grid-cols-2 gap-2">
            {PATINA_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePatinaChange(option.value)}
                className={`text-xs p-2 rounded border transition-all text-left ${
                  selectedPatina === option.value
                    ? "border-bronze bg-bronze/10 text-foreground"
                    : "border-border/50 hover:border-bronze/50 text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`btn-patina-${option.value}`}
              >
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mounting Option */}
        <div className="p-3 rounded bg-background border border-border/50">
          <div className="font-medium text-sm text-foreground mb-2">Mounting Option</div>
          <p className="text-xs text-muted-foreground mb-3">How do you want to display your sculpture?</p>
          <div className="space-y-2">
            {MOUNTING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all ${
                  selectedMounting === option.value
                    ? "bg-bronze/10 border border-bronze"
                    : "hover:bg-muted/30"
                }`}
              >
                <input
                  type="radio"
                  name={`mounting-${purchase.id}`}
                  value={option.value}
                  checked={selectedMounting === option.value}
                  onChange={() => handleMountingChange(option.value)}
                  className="w-4 h-4 mt-0.5"
                  data-testid={`radio-mounting-${option.value}`}
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                        {purchase.paymentReference?.startsWith('PROMO-') && (
                          <Badge className="bg-gradient-to-r from-accent-gold to-bronze text-white flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Complimentary VIP Seat
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {purchase.paymentReference?.startsWith('PROMO-') 
                          ? `Complimentary seat reserved on ${new Date(purchase.createdAt!).toLocaleDateString()}`
                          : `Purchased on ${new Date(purchase.createdAt!).toLocaleDateString()}`}
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
                      {/* Specimen Selection */}
                      <div className="p-4 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <Leaf className="w-5 h-5 text-bronze" />
                          <h3 className="font-semibold text-foreground">Your Specimen Selection</h3>
                        </div>
                        
                        {purchase.specimenStyle && (
                          <>
                            <div className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium text-foreground">Chosen Style:</span> {purchase.specimenStyle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              David will personally select the finest specimen of your chosen style from the current or upcoming seasonal harvest.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Customize Extras Section */}
                      <CustomizeExtras purchase={purchase} />

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
                                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
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
                        {purchase.codes.map((code) => {
                          // Determine code type label
                          let codeLabel = "";
                          let codeColor = "text-patina";
                          
                          if (code.type === "bronze_claim") {
                            codeLabel = "Bronze Claim Code (Free Workshop Casting)";
                            codeColor = "text-bronze";
                          } else if (code.type === "workshop_voucher") {
                            codeLabel = `Workshop Voucher (${code.discount}% Off ONE Workshop)`;
                            codeColor = "text-patina";
                          } else if (code.type === "lifetime_workshop") {
                            codeLabel = `Lifetime Workshop Code (${code.discount}% Off ALL Workshops)`;
                            codeColor = "text-accent-gold";
                          } else if (code.type === "commission_voucher") {
                            codeLabel = `Commission Voucher (${code.discount}% Off ONE Commission)`;
                            codeColor = "text-accent-gold";
                          }
                          
                          return (
                            <div
                              key={code.id}
                              className="flex flex-wrap justify-between items-center gap-4 p-4 bg-background/50 rounded-lg border border-border"
                              data-testid={`code-${code.type}`}
                            >
                              <div className="flex-1">
                                <div className={`text-xs ${codeColor} font-semibold uppercase mb-1`}>
                                  {codeLabel}
                                </div>
                                <div className="font-mono text-lg font-bold text-accent-gold">
                                  {code.code}
                                </div>
                                {code.transferable && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Transferable • {code.type === "lifetime_workshop" ? "Lifetime Use" : "Single Use"}
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
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Document Downloads */}
                  {purchase.certificateUrl && (
                    <div className="pt-4 border-t border-border space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Your Documents
                      </h4>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="border-patina/30 hover-elevate active-elevate-2"
                          data-testid="button-download-certificate"
                        >
                          <a
                            href={purchase.certificateUrl}
                            download
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Investment Certificate</span>
                          </a>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="border-bronze/30 hover-elevate active-elevate-2"
                          data-testid="button-download-code-slips"
                        >
                          <a
                            href={`/certificates/code-slips-${purchase.id}.pdf`}
                            download
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Code Gift Slips</span>
                          </a>
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground italic">
                        💡 Print your code slips and cut along the dotted lines to create beautiful gift vouchers
                      </p>
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
                  href="mailto:studio@timeless.organic"
                  className="text-accent-gold hover:underline"
                >
                  studio@timeless.organic
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
