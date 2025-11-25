import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";
import { FlowerTimelapseBackground } from "@/components/FlowerTimelapseBackground";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf } from "lucide-react";

interface Purchase {
  id: string;
  userName: string;
  seatType: string;
  createdAt: string;
}

export default function WallOfLeaves() {
  const { data: purchases, isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  // Separate by type
  const founders = purchases?.filter(p => p.seatType === "founder") || [];
  const patrons = purchases?.filter(p => p.seatType === "patron") || [];

  return (
    <>
      <div className="bg-aloe" />
      <FlowerTimelapseBackground />
      <Header />
      <div className="relative z-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16 pt-8">
            <div className="kicker mb-3">FOUNDING 100</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="moving-fill">Wall of Leaves</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
              Timeless preservation of our gratitude
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-8"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm italic">
              Each name engraved here represents a founding member who believed in our vision and invested in making Timeless Organics a reality. 
              Your support transforms ancient craft into living art—forever preserved, forever honored.
            </p>
          </section>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-card/60 backdrop-blur-md border-card-border p-8">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </Card>
              <Card className="bg-card/60 backdrop-blur-md border-card-border p-8">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Founders Section */}
              <Card className="bg-gradient-to-br from-bronze/10 to-accent-gold/5 backdrop-blur-md border-bronze/30 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-bronze/20 pb-4">
                  <div className="w-3 h-3 rounded-full bg-bronze animate-pulse" />
                  <h2 className="font-serif text-3xl font-bold text-foreground">Founders</h2>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {founders.length} / 50
                  </span>
                </div>

                {founders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 italic">
                    Be the first Founder to claim your place on this wall
                  </p>
                ) : (
                  <div className="space-y-3">
                    {founders.map((purchase, index) => (
                      <div
                        key={purchase.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-card/30 border border-bronze/20 hover-elevate"
                        data-testid={`founder-${index}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-bronze/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-bronze font-bold text-sm font-serif">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{purchase.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Leaf className="w-5 h-5 text-bronze" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Patrons Section */}
              <Card className="bg-gradient-to-br from-patina/10 to-accent-gold/5 backdrop-blur-md border-patina/30 p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-patina/20 pb-4">
                  <div className="w-3 h-3 rounded-full bg-patina animate-pulse" />
                  <h2 className="font-serif text-3xl font-bold text-foreground">Patrons</h2>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {patrons.length} / 50
                  </span>
                </div>

                {patrons.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 italic">
                    Be the first Patron to claim your place on this wall
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patrons.map((purchase, index) => (
                      <div
                        key={purchase.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-card/30 border border-patina/20 hover-elevate"
                        data-testid={`patron-${index}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-patina/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-patina font-bold text-sm font-serif">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{purchase.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Leaf className="w-5 h-5 text-patina" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Bottom Message */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-br from-accent-gold/10 via-bronze/5 to-patina/10 backdrop-blur-md border-accent-gold/30 p-8 max-w-3xl mx-auto">
              <p className="text-lg text-foreground/90 leading-relaxed">
                Each leaf represents a founding member's legacy—etched not just in bronze, 
                but in the very foundation of Timeless Organics. 
                <span className="block mt-4 text-accent-gold font-semibold">
                  Together, we create something that transcends time.
                </span>
              </p>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}