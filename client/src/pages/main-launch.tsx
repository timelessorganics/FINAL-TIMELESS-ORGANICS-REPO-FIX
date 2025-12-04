import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import SeatCard from "@/components/seat-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlowerTimelapseBackground } from "@/components/FlowerTimelapseBackground";
import { ArrowRight, Sparkles, Flame, AlertCircle, Check, Calendar } from "lucide-react";
import SeatSelectionModal from "@/components/seat-selection-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Seat, Sculpture } from "@shared/schema";

// Extended type with API response fields
interface SeatWithAvailability extends Seat {
  remaining?: number;
  reservedCount?: number;
  manualHolds?: number;
}

import bronzeMountedSculpture from "@assets/Gemini_Generated_Image_pgo4cnpgo4cnpgo4_result_1764779086107.webp";

const DEFAULT_SPECIMEN_IMAGES: Record<string, string> = {
  cones_bracts_seedpods: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block_1764516081629.png", import.meta.url).href,
  protea_pincushion_blooms_heads: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block 2_1763150497628.jpg", import.meta.url).href,
  bulb_spikes: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block_1764516081629.png", import.meta.url).href,
  branches_leaves: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block 2_1763150497628.jpg", import.meta.url).href,
  aloe_inflorescence_heads: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block_1764516081629.png", import.meta.url).href,
  flower_heads: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block 2_1763150497628.jpg", import.meta.url).href,
  erica_sprays: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block_1764516081629.png", import.meta.url).href,
  restios_seedheads_grasses: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block 2_1763150497628.jpg", import.meta.url).href,
  small_succulents: new URL("../../attached_assets/Bronze Aloe Sculpture in Resin Block_1764516081629.png", import.meta.url).href,
};

// Fetch specimen customizations from backend
async function fetchSpecimenCustomizations(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/specimen-customizations');
    const customizations = await response.json();
    const custom: Record<string, string> = {};
    customizations.forEach((c: any) => {
      if (c.imageUrl) custom[c.specimenKey] = c.imageUrl;
    });
    return { ...DEFAULT_SPECIMEN_IMAGES, ...custom };
  } catch (err) {
    console.error('Failed to fetch customizations:', err);
    return DEFAULT_SPECIMEN_IMAGES;
  }
}

let SPECIMEN_IMAGES = DEFAULT_SPECIMEN_IMAGES;

const SPECIMEN_NAMES: Record<string, string> = {
  cones_bracts_seedpods: "Cones, Bracts & Seedpods",
  protea_pincushion_blooms_heads: "Protea Pincushion Blooms",
  bulb_spikes: "Bulb Spikes",
  branches_leaves: "Branches & Leaves",
  aloe_inflorescence_heads: "Aloe Inflorescence",
  flower_heads: "Flower Heads",
  erica_sprays: "Erica Sprays",
  restios_seedheads_grasses: "Restios & Seedheads",
  small_succulents: "Small Succulents",
};

const SPECIMEN_SEASONS: Record<string, string> = {
  cones_bracts_seedpods: "All Year",
  protea_pincushion_blooms_heads: "Spring & Summer",
  bulb_spikes: "Spring",
  branches_leaves: "Year Round",
  aloe_inflorescence_heads: "Summer & Autumn",
  flower_heads: "Spring & Summer",
  erica_sprays: "Winter & Spring",
  restios_seedheads_grasses: "Summer & Autumn",
  small_succulents: "Year Round",
};

export default function MainLaunch() {
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
  const [selectedSpecimen, setSelectedSpecimen] = useState<string | null>(null);
  const [specimenAvailability, setSpecimenAvailability] = useState<Record<string, boolean>>({});
  const [expandedSpecimen, setExpandedSpecimen] = useState<string | null>(null);
  const [specimenImages, setSpecimenImages] = useState<Record<string, string>>(SPECIMEN_IMAGES);

  // Load custom specimen images from backend on mount
  const { data: customizations } = useQuery({
    queryKey: ['/api/specimen-customizations'],
    queryFn: async () => {
      const response = await fetch('/api/specimen-customizations');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update specimen images when customizations change
  useQuery({
    queryKey: ['/api/specimen-customizations'],
    enabled: !!customizations,
    queryFn: async () => {
      if (customizations) {
        const custom: Record<string, string> = {};
        customizations.forEach((c: any) => {
          if (c.imageUrl) custom[c.specimenKey] = c.imageUrl;
        });
        setSpecimenImages({ ...DEFAULT_SPECIMEN_IMAGES, ...custom });
      }
      return customizations;
    },
  });
  
  const { data: seats, isLoading } = useQuery<SeatWithAvailability[]>({
    queryKey: ["/api/seats/availability"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: sculptures } = useQuery<Sculpture[]>({
    queryKey: ["/api/sculptures"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const founderSeat = seats?.find((s) => s.type === "founder");
  const patronSeat = seats?.find((s) => s.type === "patron");
  
  // Get remaining seats from API (defaults to 50 while loading)
  const founderRemaining = seats ? (founderSeat?.remaining ?? 50) : 50;
  const patronRemaining = seats ? (patronSeat?.remaining ?? 50) : 50;
  const totalRemaining = founderRemaining + patronRemaining;

  const scrollToSeats = () => {
    document.getElementById('seats')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePaymentClick = (type: 'full' | 'deposit') => {
    setPaymentType(type);
    setSeatModalOpen(true);
  };

  // Check if a specimen is available RIGHT NOW (not wait for season)
  const isSpecimenAvailableNow = (specimen: Sculpture): boolean => {
    if (!specimen.seasonWindow) return true; // year_round
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const season = getSeason(month);
    return specimen.seasonWindow === 'year_round' || specimen.seasonWindow === season;
  };

  const getSeason = (month: number): string => {
    if (month >= 12 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'autumn';
  };

  // Calculate display prices dynamically from seat data
  const getDisplayPrice = (seat: any) => {
    if (seat?.fireSalePrice && seat?.fireSaleEndsAt && new Date(seat.fireSaleEndsAt) > new Date()) {
      return `R${(seat.fireSalePrice / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `R${(seat?.price ? seat.price / 100 : 0).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getOriginalPrice = (seat: any) => {
    if (seat?.fireSalePrice && seat?.fireSaleEndsAt && new Date(seat.fireSaleEndsAt) > new Date()) {
      if (seat?.price && seat.price > 0) {
        return `R${(seat.price / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
      return seat?.type === 'founder' ? 'R4,500' : 'R6,000';
    }
    return null;
  };

  const founderRegular = getOriginalPrice(founderSeat);
  const founderSale = getDisplayPrice(founderSeat);
  const patronRegular = getOriginalPrice(patronSeat);
  const patronSale = getDisplayPrice(patronSeat);

  return (
    <>
      <div className="bg-aloe" />
      <FlowerTimelapseBackground intensity="medium" />
      <Header />
      <div className="relative z-50" id="top">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          
          {/* HERO SECTION */}
          <section className="relative z-20 text-center mb-8 sm:mb-10 lg:mb-12 pt-12 sm:pt-20 pb-6 sm:pb-8 lg:pb-10" data-testid="section-hero">
            <div className="kicker mb-3 sm:mb-4">FOUNDING 100 INVESTOR LAUNCH</div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 leading-tight">
              We've built this studio 90% with our own hands.
            </h1>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 sm:mb-8 text-accent-gold">
              These 100 seats finish the last 10%
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed font-light">
              And we want the first chapter to belong to our closest people.
            </p>

            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-light text-foreground mb-6 sm:mb-8">
              Before You Invest
            </h3>

            {/* Three Stat Cards */}
            <div className="relative z-30 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <Card className="p-6 bg-card/80 border-card-border backdrop-blur-sm">
                <div className="text-5xl font-bold font-serif text-bronze mb-2">{totalRemaining}</div>
                <div className="text-muted-foreground">Seats Remaining</div>
                <div className="text-xs text-foreground/60 mt-1">{founderRemaining} Founder + {patronRemaining} Patron</div>
              </Card>
              
              <Card className="p-6 bg-card/80 border-card-border backdrop-blur-sm">
                <div className="text-5xl font-bold font-serif text-accent-gold mb-2">R25K+</div>
                <div className="text-muted-foreground">IF Mounted & Patinated</div>
                <div className="text-xs text-foreground/60 mt-1">Optional services available later</div>
              </Card>
              
              <Card className="p-6 bg-card/80 border-card-border backdrop-blur-sm">
                <div className="text-5xl font-bold font-serif text-patina mb-2">LIFE</div>
                <div className="text-muted-foreground">time Benefits</div>
                <div className="text-xs text-foreground/60 mt-1">Shop, Commissions & Workshops</div>
              </Card>
            </div>
          </section>

          {/* WHY THIS EXISTS - The Opportunity */}
          <section className="mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-card/40 via-background to-card/40 rounded-xl border border-bronze/20" data-testid="section-why-this-exists">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center mb-8 sm:mb-12">
                <span className="text-xs tracking-[0.3em] text-bronze/70 uppercase font-light mb-3 sm:mb-4 block">
                  Why This Exists
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light tracking-tight moving-fill">
                  A Once-In-A-Lifetime Founding Opportunity
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-12 items-center">
                {/* Left: Image */}
                <div className="order-2 md:order-1">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-bronze/20">
                    <img 
                      src={bronzeMountedSculpture} 
                      alt="Bronze botanical sculpture on wooden mount" 
                      className="w-full h-full object-cover bronze-warmth image-fade-in"
                    />
                  </div>
                </div>
                
                {/* Right: Text */}
                <div className="order-1 md:order-2 space-y-6">
                  <p className="text-base text-foreground/90 font-light leading-relaxed">
                    <span className="text-bronze font-light">100 founding seats.</span> That's it. 
                    This isn't a subscription. It's not a membership. It's a one-time investment 
                    that gives you a handcrafted bronze sculpture worth R25,000+ and lifetime 
                    benefits worth even more.
                  </p>
                  <p className="text-base text-muted-foreground font-light leading-relaxed">
                    We have built this with our bare hands after extremely unforeseen and suddenly 
                    unexpected brutal circumstances. The founding 100 lifetime opportunity transforms 
                    this into the dream that turns organic matter into permanent bronze art. Without 
                    these 100 founding investors, this is just not going to exist.
                  </p>
                  <p className="text-base text-foreground/90 font-light leading-relaxed">
                    In return, you get first access to workshops, lifetime discounts on everything 
                    we create, priority on custom commissions, and your name etched into our story 
                    from day one.
                  </p>
                  <p className="text-base text-bronze font-light italic border-l-2 border-bronze/40 pl-6">
                    "The value I'm offering is 20 times what you'll pay. 
                    Once these seats are gone, this chapter closes forever."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SEASONAL GUIDE NOTICE - SIMPLE LINK TO FULL PAGE */}
          <section className="relative z-10 mb-8 sm:mb-12 lg:mb-16 py-6 sm:py-8 lg:py-10 bg-gradient-to-br from-card/40 via-background to-card/40 rounded-xl border border-border/50" data-testid="section-specimen-guide">
            <div className="text-center px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/20 rounded-full text-accent-gold text-sm font-bold mb-4">
                <AlertCircle className="w-4 h-4" />
                BEFORE YOU INVEST
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light mb-4">
                Understand Seasonal Availability
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light mb-6">
                Read our seasonal guide for clarity on specimen seasons and selection criteria before investing.
              </p>
              <Link href="/seasonal-guide">
                <Button size="lg" className="gap-2 bg-bronze text-background font-semibold" data-testid="button-view-seasonal-guide">
                  <Calendar className="w-5 h-5" />
                  View Seasonal Guide
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* SEAT SELECTION - NOW AFTER SPECIMEN GUIDE */}
          <section id="seats" className="mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12 lg:py-16 scroll-mt-20" data-testid="section-seats">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4">
                <span className="text-accent-gold">Invest Now</span> — Choose Your Seat
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-light mb-4 sm:mb-5">
                Only 100 seats available. Once they're gone, they're gone forever.
              </p>
              <div className="inline-block px-3 sm:px-5 py-1.5 sm:py-2 bg-amber-600/25 rounded-full border border-amber-500/40 mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-amber-200 font-black tracking-wide">48HR FRIENDS & FAMILY FIRE SALE</p>
              </div>
              <p className="text-sm sm:text-base text-amber-200 font-serif font-bold">THE BEST DEAL ON THE PLANET</p>
              <p className="text-xs sm:text-sm text-amber-100/80 font-light mt-1">Bronze Sculpture + 20-30% Lifetime Discounts Forever</p>
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
                    regularPrice={founderRegular || "R4,500"}
                    fireSalePrice={founderSale}
                    description="Unmounted and unpatinated. Can be purchased now or at a later stage via our shop or at checkout"
                    benefits={[
                      "R25,000+ handcrafted bronze sculpture (unmounted, unpatinated)",
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "50% off first workshop (One-time use, giftable)",
                      "20% lifetime discount — Shop, Commissions, AND Workshops (Forever, unlimited)",
                    ]}
                    onPaymentClick={handlePaymentClick}
                  />
                )}
                {patronSeat && (
                  <SeatCard
                    seat={patronSeat}
                    title="Patron Gift Card"
                    regularPrice={patronRegular || "R6,000"}
                    fireSalePrice={patronSale}
                    description="Full package: Bronze sculpture + Patina + Mounting included"
                    benefits={[
                      "R25,000+ handcrafted bronze sculpture WITH Patina + Mounting included",
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "80% off first workshop (One-time use, giftable)",
                      "30% lifetime discount — Shop, Commissions, AND Workshops (Forever, unlimited)",
                    ]}
                    featured
                    onPaymentClick={handlePaymentClick}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
      <SeatSelectionModal 
        open={seatModalOpen}
        onOpenChange={setSeatModalOpen}
        paymentType={paymentType}
        founderSeat={founderSeat}
        patronSeat={patronSeat}
      />
    </>
  );
}
