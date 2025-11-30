import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SeatCard from "@/components/seat-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlowerTimelapseBackground } from "@/components/FlowerTimelapseBackground";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import SeatSelectionModal from "@/components/seat-selection-modal";
import type { Seat } from "@shared/schema";

export default function MainLaunch() {
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
  
  const { data: seats, isLoading } = useQuery<Seat[]>({
    queryKey: ["/api/seats/availability"],
  });

  const founderSeat = seats?.find((s) => s.type === "founder");
  const patronSeat = seats?.find((s) => s.type === "patron");

  const scrollToSeats = () => {
    document.getElementById('seats')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePaymentClick = (type: 'full' | 'deposit') => {
    setPaymentType(type);
    setSeatModalOpen(true);
  };

  return (
    <>
      <div className="bg-aloe" />
      <FlowerTimelapseBackground intensity="medium" />
      <Header />
      <div className="relative z-50 min-h-screen" id="top">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          
          {/* HERO SECTION */}
          <section className="text-center mb-8 sm:mb-12 pt-6 sm:pt-8" data-testid="section-hero">
            <div className="kicker mb-3 sm:mb-4">FOUNDING 100 INVESTOR LAUNCH</div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-4 sm:mb-6 leading-tight">
              Your Investment Is <span className="moving-fill">Our Investment</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed font-light">
              We <span className="text-bronze font-medium">"invest"</span> your specimen in a heat-resistant plaster/silica mix — this is called "investing" in the sculpture world. 
              Your specimen is encased in investment material that withstands extreme temperatures, kept for 2-3 months. 
              <strong className="text-foreground"> Your sculptures are the first to ever come out of the Timeless Organics Studio.</strong>
            </p>

            {/* Three Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-bronze mb-2">100</div>
                <div className="text-muted-foreground">Limited Seats</div>
                <div className="text-xs text-foreground/60 mt-1">50 Founder + 50 Patron</div>
              </Card>
              
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-accent-gold mb-2">R25K+</div>
                <div className="text-muted-foreground">IF Mounted & Patinated</div>
                <div className="text-xs text-foreground/60 mt-1">Optional services available later</div>
              </Card>
              
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-patina mb-2">LIFE</div>
                <div className="text-muted-foreground">time Benefits</div>
                <div className="text-xs text-foreground/60 mt-1">Shop, Commissions & Workshops</div>
              </Card>
            </div>
          </section>

          {/* SEAT SELECTION - RIGHT AFTER HERO */}
          <section id="seats" className="mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12 lg:py-16 scroll-mt-20" data-testid="section-seats">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4">
                <span className="text-accent-gold">Invest Now</span> — Choose Your Seat
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                Only 100 seats available. Once they're gone, they're gone forever.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-7">
                {founderSeat && (
                  <SeatCard
                    seat={founderSeat}
                    title="Founders Pass"
                    regularPrice="R4,500"
                    fireSalePrice="R3,000"
                    description="One bronze casting included of a Studio-Guaranteed Cutting"
                    benefits={[
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "50% off first workshop (Transferable, single-use, never expires)",
                      "20% lifetime discount — Shop, Commissions, AND Workshops (Unlimited, giftable)",
                    ]}
                    onPaymentClick={handlePaymentClick}
                  />
                )}
                {patronSeat && (
                  <SeatCard
                    seat={patronSeat}
                    title="Patron Gift Card"
                    regularPrice="R6,000"
                    fireSalePrice="R4,500"
                    description="One bronze casting included of a Studio-Guaranteed Cutting + Patina + Mounting"
                    benefits={[
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "80% off first workshop (Transferable, single-use, never expires)",
                      "30% lifetime discount — Shop, Commissions, AND Workshops (Unlimited, giftable)",
                    ]}
                    featured
                    onPaymentClick={handlePaymentClick}
                  />
                )}
              </div>
            )}
          </section>

          {/* URGENCY & VALUE - CONDENSED */}
          <section className="mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-bronze/10 via-card/50 to-accent-gold/10 rounded-xl border border-bronze/30" data-testid="section-urgency">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-block px-4 py-2 bg-accent-gold/20 rounded-full text-accent-gold text-sm font-bold mb-4 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  24-HOUR FIRE SALE
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  This Is The Founding 100 Moment
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-bronze mb-2">R25K+</div>
                    <p className="text-xs sm:text-sm text-foreground/80">Bronze Sculpture market value (Mounted and Patinated)</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-accent-gold mb-2">50-80%</div>
                    <p className="text-xs sm:text-sm text-foreground/80">First hands-on 2-day casting workshop</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-patina mb-2">20-30%</div>
                    <p className="text-xs sm:text-sm text-foreground/80">Lifetime discount on everything</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-bronze mb-2">FOREVER</div>
                    <p className="text-xs sm:text-sm text-foreground/80">Giftable, transferable benefits</p>
                  </div>
                </div>

                <p className="text-lg text-foreground/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                  100 seats. No waiting list. No phase two. When these sell out, this exclusive opportunity closes. 
                  <span className="text-accent-gold font-medium"> Only Founding 100 members get these terms for life.</span>
                </p>

                <Button 
                  size="lg"
                  onClick={scrollToSeats}
                  className="relative overflow-hidden text-lg px-10 py-6 font-bold bg-gradient-to-r from-bronze via-accent-gold to-bronze bg-[length:200%_100%] animate-shimmer border-2 border-bronze/50 text-background"
                  data-testid="button-claim-seat"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  CLAIM YOUR SEAT
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
      <SeatSelectionModal 
        open={seatModalOpen}
        onOpenChange={setSeatModalOpen}
        paymentType={paymentType}
      />
    </>
  );
}
