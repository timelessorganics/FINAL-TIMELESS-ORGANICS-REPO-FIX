import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SeatCard from "@/components/seat-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlowerTimelapseBackground } from "@/components/FlowerTimelapseBackground";
import { ArrowRight, Sparkles, Flame, AlertCircle, Check, Calendar } from "lucide-react";
import SeatSelectionModal from "@/components/seat-selection-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Seat, Sculpture } from "@shared/schema";

const DEFAULT_SPECIMEN_IMAGES: Record<string, string> = {
  cones_bracts_seedpods: new URL("../../attached_assets/Gemini_Generated_Image_t5zvs6t5zvs6t5zv_1761271985175.png", import.meta.url).href,
  protea_pincushion_blooms_heads: new URL("../../attached_assets/Gemini_Generated_Image_f90dtof90dtof90d_1761271985176.png", import.meta.url).href,
  bulb_spikes: new URL("../../attached_assets/Gemini_Generated_Image_r45js4r45js4r45j_1761271985177.png", import.meta.url).href,
  branches_leaves: new URL("../../attached_assets/Gemini_Generated_Image_r7x3y8r7x3y8r7x3_1761271985178.png", import.meta.url).href,
  aloe_inflorescence_heads: new URL("../../attached_assets/Gemini_Generated_Image_an1l12an1l12an1l_1761271985175.png", import.meta.url).href,
  flower_heads: new URL("../../attached_assets/Gemini_Generated_Image_9rrlvn9rrlvn9rrl (1)_1761271985174.png", import.meta.url).href,
  erica_sprays: new URL("../../attached_assets/Gemini_Generated_Image_daxzjqdaxzjqdaxz_1761271985176.png", import.meta.url).href,
  restios_seedheads_grasses: new URL("../../attached_assets/Gemini_Generated_Image_qey8v1qey8v1qey8 (1)_1761271985177.png", import.meta.url).href,
  small_succulents: new URL("../../attached_assets/Gemini_Generated_Image_9rrlvn9rrlvn9rrl_1761271985179.png", import.meta.url).href,
};

const getSpecimenImages = (): Record<string, string> => {
  const custom = typeof window !== 'undefined' ? sessionStorage.getItem("specimenCustomImages") : null;
  const customImages = custom ? JSON.parse(custom) : {};
  return { ...DEFAULT_SPECIMEN_IMAGES, ...customImages };
};

const SPECIMEN_IMAGES = getSpecimenImages();

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
  const [seasonGuideOpen, setSeasonGuideOpen] = useState(false);
  
  const { data: seats, isLoading } = useQuery<Seat[]>({
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
      <div className="relative z-50 min-h-screen" id="top">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          
          {/* HERO SECTION */}
          <section className="text-center mb-8 sm:mb-12 pt-6 sm:pt-8" data-testid="section-hero">
            <div className="kicker mb-3 sm:mb-4">FOUNDING 100 INVESTOR LAUNCH</div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 leading-tight whitespace-nowrap">
              Your Investment Is <span className="moving-fill">Our Investment</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed font-light">
              Three investments happen simultaneously. You invest capital. You invest your cutting. We invest our mastery. <strong className="text-accent-gold">Together, we create something Timeless.</strong>
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

          {/* WAIT BEFORE YOU BUY - SEASONAL GUIDE */}
          <section className="mb-8 sm:mb-12 lg:mb-16 py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-card/40 via-background to-card/40 rounded-xl border border-border/50" data-testid="section-specimen-guide">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-block px-4 py-2 bg-accent-gold/20 rounded-full text-accent-gold text-sm font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                WAIT BEFORE YOU BUY
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light mb-4 sm:mb-6">
                Choose Your Specimen
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto font-light mb-6">
                Cape Fynbos changes with the seasons. Each specimen has optimal collection windows. Select your style—we'll tell you if it's available now or if you need to wait.
              </p>
            </div>

            {/* Season Guide Button */}
            <div className="mb-6 flex justify-center">
              <Button
                onClick={() => setSeasonGuideOpen(true)}
                variant="outline"
                className="gap-2"
                data-testid="button-season-guide"
              >
                <Calendar className="w-4 h-4" />
                View Season Guide
              </Button>
            </div>

            {/* Specimen Gallery Grid - 9 columns, compact */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-8">
              {sculptures?.filter(s => s.specimenStyle).map((specimen) => {
                const isAvailableNow = isSpecimenAvailableNow(specimen);
                const isSelected = selectedSpecimen === specimen.specimenStyle;

                return (
                  <div
                    key={specimen.specimenStyle}
                    onClick={() => {
                      setSelectedSpecimen(specimen.specimenStyle || null);
                      setSpecimenAvailability({ [specimen.specimenStyle || '']: isAvailableNow });
                    }}
                    className={`cursor-pointer transition-all group relative`}
                    data-testid={`specimen-card-${specimen.specimenStyle}`}
                  >
                    <div className={`relative overflow-hidden rounded-lg border-2 transition-all h-full aspect-square ${
                      isSelected 
                        ? 'border-bronze ring-2 ring-bronze/50' 
                        : 'border-card-border hover:border-bronze/50'
                    } bg-card-background`}>
                      <img
                        src={SPECIMEN_IMAGES[specimen.specimenStyle || '']}
                        alt={SPECIMEN_NAMES[specimen.specimenStyle || '']}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-bronze text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      {/* Availability Badge - tiny */}
                      <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[0.65rem] font-semibold ${
                        isAvailableNow
                          ? 'bg-green-500/90 text-white'
                          : 'bg-orange-500/90 text-white'
                      }`}>
                        {isAvailableNow ? 'Now' : 'Wait'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Availability Status */}
            {selectedSpecimen && (
              <Alert className={`${
                specimenAvailability[selectedSpecimen]
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}>
                {specimenAvailability[selectedSpecimen] ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      <strong>{SPECIMEN_NAMES[selectedSpecimen]}</strong> is in season NOW! You can receive your casting soon after purchase.
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700 dark:text-orange-400">
                      <strong>{SPECIMEN_NAMES[selectedSpecimen]}</strong> is out of season. Select "BUY & WAIT" at checkout to secure your specimen now and receive it when it's in peak condition.
                    </AlertDescription>
                  </>
                )}
              </Alert>
            )}
          </section>

          {/* SEAT SELECTION - RIGHT AFTER SPECIMEN GUIDE */}
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
                    regularPrice={founderRegular || "R4,500"}
                    fireSalePrice={founderSale}
                    description="Unmounted and unpatinated. Can be purchased now or at a later stage via our shop or at checkout"
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
                    regularPrice={patronRegular || "R6,000"}
                    fireSalePrice={patronSale}
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
      
      {/* Season Guide Modal - stays on page */}
      <Dialog open={seasonGuideOpen} onOpenChange={setSeasonGuideOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Specimen Season Guide</DialogTitle>
            <DialogDescription>
              Each specimen has optimal collection windows. Choose one now, or select "Buy & Wait" at checkout to secure your specimen and receive it when it's in peak condition.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            {Object.entries(SPECIMEN_NAMES).map(([key, name]) => (
              <div key={key} className="flex items-start gap-4 p-3 border rounded-lg bg-card/50">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={SPECIMEN_IMAGES[key]}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-bronze">Available:</span> {SPECIMEN_SEASONS[key]}
                  </p>
                  {selectedSpecimen === key && (
                    <p className="text-xs text-accent-gold font-semibold mt-2">✓ Selected</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
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
