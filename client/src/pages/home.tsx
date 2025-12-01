import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Shield, Award, ArrowRight, Flame, Users, Leaf, Calendar, Plus, Minus } from "lucide-react";

import heroImage from "@assets/Gemini_Generated_Image_rf3vd6rf3vd6rf3v_1764248900779.png";
import bronzeImage1 from "@assets/Gemini_Generated_Image_rf3vd6rf3vd6rf3v_1764170102466.png";
import bronzeImage2 from "@assets/Bronze Aloe Sculpture in Resin Block 2_1763150497628.jpg";
import bronzeImage3 from "@assets/Gemini_Generated_Image_o0oi1oo0oi1oo0oi_1764170102464.png";
import davidStoryImage from "@assets/Gemini_Generated_Image_pgo4cnpgo4cnpgo4_result_1764296343897.webp";

import smokeVideo from "@assets/3 SMOKE HOVERS TINY SPARKS7_1761435915770.mp4";
import flowerBloomVideo from "@assets/Yellow-Lily-Opening-On-Black-Background-4K-2025-08-29-08-44-48-Utc_1764103216693.mp4";
import burntMetalVideo from "@assets/Burnt-Metal-2025-08-29-06-20-21-Utc_1764160699730.mp4";

interface SeatAvailability {
  type: string;
  name: string;
  price: number;
  fireSalePrice?: number;
  fireSaleEndsAt?: string;
  totalAvailable: number;
  sold: number;
  remaining: number;
}

interface PreLaunchStats {
  totalReserved: number;
  founderDeposits: number;
  patronDeposits: number;
  founderHolds: number;
  patronHolds: number;
}

export default function HomePage() {
  const [founderQuantity, setFounderQuantity] = useState(1);
  const [patronQuantity, setPatronQuantity] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<string>("24:00:00");
  const [, setLocation] = useLocation();
  
  const { data: seats } = useQuery<SeatAvailability[]>({
    queryKey: ['/api/seats/availability'],
    staleTime: 0,
    refetchOnMount: true,
  });
  
  const { data: prelaunchStats } = useQuery<PreLaunchStats>({
    queryKey: ['/api/prelaunch/stats'],
    staleTime: 0,
    refetchOnMount: true,
  });

  // 24-hour countdown timer
  useEffect(() => {
    const fireSaleEndsAt = new Date();
    fireSaleEndsAt.setDate(fireSaleEndsAt.getDate() + 1); // 24 hours from now
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = fireSaleEndsAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("EXPIRED");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);


  // Modal is now handled by SeatSelectionModal component, which navigates to /founding-100

  const founderSeats = seats?.find(s => s.type === 'founder');
  const patronSeats = seats?.find(s => s.type === 'patron');
  const founderRemaining = founderSeats?.remaining || 0;
  const patronRemaining = patronSeats?.remaining || 0;
  const totalRemaining = founderRemaining + patronRemaining;
  const totalReserved = prelaunchStats?.totalReserved || 0;
  
  // Fire sale pricing helpers
  const getDisplayPrice = (seat: any) => {
    if (seat?.fireSalePrice && seat?.fireSaleEndsAt && new Date(seat.fireSaleEndsAt) > new Date()) {
      return seat.fireSalePrice / 100; // Fire sale is active
    }
    return seat?.price ? seat.price / 100 : 0;
  };
  
  const getOriginalPrice = (seat: any) => {
    if (seat?.fireSalePrice && seat?.fireSaleEndsAt && new Date(seat.fireSaleEndsAt) > new Date()) {
      // During fire sale, show the regular price (struck through)
      // If seat.price is missing, use known original prices
      if (seat?.price && seat.price > 0) {
        return seat.price / 100;
      }
      // Fallback to known original prices if not in DB
      return seat?.type === 'founder' ? 3500 : 5500;
    }
    return null;
  };
  
  const founderPrice = getDisplayPrice(founderSeats);
  const founderOriginal = getOriginalPrice(founderSeats);
  const patronPrice = getDisplayPrice(patronSeats);
  const patronOriginal = getOriginalPrice(patronSeats);

  return (
    <>
      <Header />
      
      <main className="relative z-50">
        
        {/* HERO: Bronze emerging from darkness - STABLE GRID LAYOUT */}
        <section 
          className="relative h-screen overflow-hidden bg-[#050505]" 
          data-testid="section-hero"
        >
          {/* Layer 1: Full-bleed hero image - full screen, scaled up */}
          <div className="absolute inset-0 hero-image-reveal">
            <img 
              src={heroImage} 
              alt="Wall-mounted bronze botanical sculpture on slate" 
              className="w-full h-full object-cover object-top sm:object-center scale-110 bronze-warmth-subtle"
            />
          </div>
          
          {/* Layer 2: Soft radial vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,5,5,0.5)_70%,rgba(5,5,5,0.9)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-70" />
          
          {/* Layer 3: Subtle overlay for text readability - NO BLUR for crystal clear image */}
          <div className="absolute inset-0 bg-black/[0.15]" />
          <div className="absolute inset-0 border-b border-white/[0.05]" />
          
          {/* Kicker on BLACK space - positioned on dark area just above slate */}
          <div className="absolute top-6 sm:top-10 left-0 right-0 z-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="hero-text-reveal hero-text-reveal-delay-1">
                <span className="inline-block font-serif text-sm sm:text-lg md:text-2xl font-semibold tracking-[0.08em] sm:tracking-[0.12em] uppercase moving-fill">
                  Founding 100 Investor Launch
                </span>
              </div>
            </div>
          </div>

          {/* Layer 4: Content - flex layout for tighter mobile spacing */}
          <div className="relative z-10 h-screen flex flex-col justify-center px-3 sm:px-4 lg:px-6 py-4 sm:py-8 lg:py-12">
            
            {/* Center content */}
            <div className="text-center max-w-6xl mx-auto w-full">
              
              {/* Main title with glassy effect - moved up, more space below */}
              <h1 className="hero-text-reveal hero-text-reveal-delay-2 font-serif text-[clamp(2.2rem,7vw,5.5rem)] font-light mt-2 sm:mt-6 lg:mt-10 mb-1 sm:mb-2 lg:mb-3 leading-[1.05] tracking-tight w-full px-2">
                <span className="hero-glass-text">Timeless Organics</span>
              </h1>
              
              {/* Tagline - responsive */}
              <p className="hero-text-reveal hero-text-reveal-delay-3 font-serif text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 max-w-3xl mx-auto mb-4 sm:mb-6 lg:mb-8 leading-relaxed px-3 sm:px-2">
                One-Of-A-Kind Castings From Organic Matter
              </p>

              {/* FIRE SALE BADGE - Orange Patina Glow */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 mb-4 sm:mb-8">
                <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-orange-500/30 rounded-full text-orange-300 text-[0.75rem] sm:text-sm font-black tracking-wide shadow-lg shadow-orange-500/40 border border-orange-400/50">
                  <div className="flex items-center gap-2 justify-center">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                    <span>24HR FRIENDS & FAMILY FIRE SALE</span>
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Catchy Deal Copy - Emphasize Best Deal + Lifetime Benefits */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 mb-6 sm:mb-10">
                <p className="text-sm sm:text-base text-orange-300 font-serif font-bold">THE BEST DEAL ON THE PLANET</p>
                <p className="text-xs sm:text-sm text-orange-200/90 font-light mt-1">Bronze Sculpture + 20-30% Lifetime Discounts Forever</p>
              </div>

              {/* THIS IS THE FOUNDING 100 MOMENT - Glassy Card on Hero */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 mb-6 sm:mb-8 lg:mb-10">
                <div className="max-w-3xl mx-auto p-3 sm:p-4 lg:p-6 border rounded-xl backdrop-blur-sm" style={{backgroundColor: 'rgba(107, 117, 75, 0.32)', borderColor: 'rgba(107, 117, 75, 0.55)'}}>
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 justify-center moving-fill" style={{color: 'rgba(107, 117, 75, 1)'}}>
                    <Flame className="w-3 sm:w-4 h-3 sm:h-4" />
                    THIS IS THE FOUNDING 100 MOMENT
                  </h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 w-full">
                    <div className="text-center">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-bronze">R25K+</div>
                      <p className="text-[0.55rem] sm:text-[0.65rem] text-white/80 leading-tight">Bronze<br/>Sculpture</p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-accent-gold">50-80%</div>
                      <p className="text-[0.55rem] sm:text-[0.65rem] text-white/80 leading-tight">First<br/>Workshop</p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-accent-gold">20-30%</div>
                      <p className="text-[0.55rem] sm:text-[0.65rem] text-white/80 leading-tight">Lifetime<br/>Discount</p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-base lg:text-lg font-bold text-bronze">FOREVER</div>
                      <p className="text-[0.55rem] sm:text-[0.65rem] text-white/80 leading-tight">Giftable<br/>Benefits</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Selection Cards - Friends & Family Launch Pricing */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-6 lg:gap-16 xl:gap-24 mb-3 sm:mb-6 px-2 sm:px-0 max-w-6xl mx-auto w-full">
                {/* FOUNDER SEAT CARD */}
                <div className="group relative flex-1 min-w-0 max-w-sm sm:max-w-md lg:max-w-md p-3 sm:p-4 lg:p-5 border border-white/20 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/50 hover:border-white/30 transition-all duration-300 hover-elevate">
                  <div className="text-left space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.65rem] sm:text-xs text-white font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Founder</p>
                        <p className="text-[0.55rem] sm:text-[0.65rem] text-white/60 font-light mb-0.5 sm:mb-1 leading-tight">Unmounted & unpatinated<br/>Services available now or later</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-lg font-bold text-white">{founderRemaining}</p>
                        <p className="text-[0.6rem] sm:text-xs text-white/50 font-light">REMAINING</p>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 sm:space-y-1">
                      {founderOriginal && <p className="text-[0.65rem] sm:text-xs text-white/70 font-light line-through">R{founderOriginal.toLocaleString()}</p>}
                      <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-bronze">R{founderPrice.toLocaleString()}</p>
                      {founderOriginal && <p className="text-[0.65rem] sm:text-xs text-bronze/80 font-light">Friends & Family Price</p>}
                    </div>

                    <button
                      onClick={() => setLocation(`/founding-100?seat=founder`)}
                      className="w-full py-1 sm:py-1.5 px-2 bg-white/10 border border-white/30 rounded-md hover:bg-white/20 transition-colors flex items-center gap-1 justify-center text-[0.65rem] sm:text-xs font-semibold text-white"
                      data-testid="button-buy-now-founder"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                {/* PATRON SEAT CARD */}
                <div className="group relative flex-1 min-w-0 max-w-sm sm:max-w-md lg:max-w-md p-3 sm:p-4 lg:p-5 border rounded-lg backdrop-blur-sm transition-all duration-300 hover-elevate" style={{backgroundColor: 'rgba(241, 243, 224, 0.15)', borderColor: 'rgba(241, 243, 224, 0.35)'}}>
                  <div className="text-left space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-0.5 sm:mb-1" style={{color: 'rgba(241, 243, 224, 0.9)'}}>Patron</p>
                        <p className="text-[0.55rem] sm:text-[0.65rem] font-light mb-0.5 sm:mb-1 leading-tight" style={{color: 'rgba(241, 243, 224, 0.7)'}}>+ Patina + Mounting included</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="text-sm sm:text-lg font-bold" style={{color: 'rgba(241, 243, 224, 0.95)'}}>{patronRemaining}</p>
                        <p className="text-[0.6rem] sm:text-xs font-light" style={{color: 'rgba(241, 243, 224, 0.65)'}}>REMAINING</p>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 sm:space-y-1">
                      {patronOriginal && <p className="text-[0.65rem] sm:text-xs font-light line-through" style={{color: 'rgba(241, 243, 224, 0.75)'}}>R{patronOriginal.toLocaleString()}</p>}
                      <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-accent-gold">R{patronPrice.toLocaleString()}</p>
                      {patronOriginal && <p className="text-[0.65rem] sm:text-xs text-accent-gold/80 font-light">Friends & Family Price</p>}
                    </div>

                    <button
                      onClick={() => setLocation(`/founding-100?seat=patron`)}
                      className="w-full py-1.5 px-2 border rounded-md transition-colors flex items-center gap-1 justify-center text-xs font-semibold"
                      style={{backgroundColor: 'rgba(241, 243, 224, 0.2)', borderColor: 'rgba(241, 243, 224, 0.35)', color: 'rgba(241, 243, 224, 0.9)'}}
                      data-testid="button-buy-now-patron"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Founding 100 Value Proposition - LARGER & MORE PROMINENT */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 text-center px-4 sm:px-6 mt-6 sm:mt-8 mb-2 sm:mb-4">
                <p className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto font-semibold tracking-tight">
                  100 seats. No waiting list. No phase two. When these sell out, this exclusive opportunity closes.{' '}
                  <span className="text-bronze">Only Founding 100 members get these terms for life.</span>
                </p>
              </div>
                
              {/* Reservation counter - shows live reservations */}
              {totalReserved > 0 && (
                <div className="hero-text-reveal hero-text-reveal-delay-3 flex items-center gap-2 text-xs sm:text-sm text-white/70 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm justify-center mt-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-bronze" />
                  <span className="font-semibold text-white">{totalReserved}</span>
                  <span>seats already reserved</span>
                </div>
              )}
              
              {/* Seat counter */}
              {totalRemaining > 0 && (
                <div className="hero-text-reveal hero-text-reveal-delay-3 mt-2">
                  <span className="text-[0.65rem] sm:text-xs text-white/50 font-light">
                    {totalRemaining} of 100 seats remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FIRE SALE URGENCY & VALUE - HIDDEN */}
        <section className="hidden py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bronze/10 via-card/50 to-accent-gold/10 border-y border-bronze/30" data-testid="section-urgency">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-accent-gold/20 rounded-full text-accent-gold text-sm font-bold mb-4 flex items-center gap-2 justify-center">
                <Flame className="w-4 h-4" />
                24-HOUR FIRE SALE
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
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

              <p className="text-base sm:text-lg text-foreground/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                100 seats. No waiting list. No phase two. When these sell out, this exclusive opportunity closes. 
                <span className="text-accent-gold font-medium"> Only Founding 100 members get these terms for life.</span>
              </p>

              <Link href="/founding-100">
                <Button 
                  size="lg"
                  className="relative overflow-hidden text-lg px-10 py-6 font-bold bg-gradient-to-r from-bronze via-accent-gold to-bronze bg-[length:200%_100%] animate-shimmer border-2 border-bronze/50 text-background"
                  data-testid="button-urgency-claim-seat"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  CLAIM YOUR SEAT
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* WHY THIS EXISTS - The Opportunity */}
        <section className="py-8 sm:py-16 px-4 sm:px-6" data-testid="section-why-this-exists">
          <div className="max-w-5xl mx-auto">
            
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
                    src={davidStoryImage} 
                    alt="Bronze botanical sculpture" 
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
                  Your investment funds the foundry. The kilns. The crucibles. The equipment 
                  that transforms organic matter into permanent bronze art. Without these 100 
                  founding investors, none of this exists.
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

        {/* WHAT YOU GET - The Full Value */}
        <section id="seats" className="py-8 sm:py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Section header */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light mb-3 sm:mb-4 tracking-tight moving-fill">
                What You Get
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
                Every Founding 100 seat includes your bronze sculpture plus lifetime benefits
              </p>
            </div>

            {/* The Bronze - Star of the show with IMAGES */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-12 items-center mb-12 sm:mb-16">
              {/* Left: Bronze Images Gallery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-lg overflow-hidden border border-bronze/20">
                  <img 
                    src={bronzeImage1} 
                    alt="Bronze botanical sculpture" 
                    className="w-full h-full object-cover bronze-warmth image-fade-in"
                  />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-bronze/20">
                  <img 
                    src={bronzeImage2} 
                    alt="Bronze protea casting" 
                    className="w-full h-full object-cover bronze-warmth image-fade-in"
                  />
                </div>
                <div className="col-span-2 aspect-[21/9] rounded-lg overflow-hidden border border-bronze/20">
                  <img 
                    src={bronzeImage3} 
                    alt="Bronze aloe sculpture detail" 
                    className="w-full h-full object-cover bronze-warmth image-fade-in"
                  />
                </div>
              </div>
              
              {/* Right: Text description */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Award className="w-10 h-10 text-bronze" />
                  <h3 className="font-serif text-3xl md:text-4xl">Your Bronze Sculpture</h3>
                </div>
                <p className="text-base text-foreground/90 font-light leading-relaxed">
                  A one-of-a-kind casting from real organic matter — a protea, aloe, restio, or 
                  other Cape Fynbos specimen. The original burns away completely at 700°C, 
                  leaving only its perfect impression in permanent bronze.
                </p>
                <p className="text-base text-muted-foreground font-light leading-relaxed">
                  Each piece captures every vein, every texture, every delicate detail of the 
                  living specimen. No two castings are ever alike. Your bronze is truly one-of-a-kind.
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-bronze/20">
                  <span className="text-3xl font-light text-bronze">R25,000+</span>
                  <span className="text-sm text-muted-foreground font-light">Retail value</span>
                </div>
              </div>
            </div>

            {/* Lifetime Benefits Grid */}
            <div className="mb-8 sm:mb-12">
              <h3 className="font-serif text-xl sm:text-2xl text-center mb-6 sm:mb-8 font-light">Plus Lifetime Benefits</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 rounded-lg border border-bronze/10 bg-bronze/[0.02]">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent-gold mb-2 sm:mb-3" />
                  <h4 className="font-light mb-1 sm:mb-2 text-sm sm:text-base">Workshop Vouchers</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light">
                    50-80% off future 2-day bronze casting workshops. Learn the ancient lost-wax process yourself.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-patina/10 bg-patina/[0.02]">
                  <Shield className="w-6 h-6 text-patina mb-3" />
                  <h4 className="font-light mb-2">Lifetime Shop Discounts</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    20-30% off everything in our future shop — sculptures, limited editions, tools, materials.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-bronze/10 bg-bronze/[0.02]">
                  <Award className="w-6 h-6 text-bronze mb-3" />
                  <h4 className="font-light mb-2">Commission Priority</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    First access to custom commissions. Your specimen, your vision, cast in bronze.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-bronze/10 bg-bronze/[0.02]">
                  <Flame className="w-6 h-6 text-bronze mb-3" />
                  <h4 className="font-light mb-2">Auction First Dibs</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Early access to future one-of-a-kind works before they go to public auction.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-accent-gold/10 bg-accent-gold/[0.02]">
                  <Sparkles className="w-6 h-6 text-accent-gold mb-3" />
                  <h4 className="font-light mb-2">Giftable for Life</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Transfer your benefits to family or friends. A gift that keeps giving for generations.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-patina/10 bg-patina/[0.02]">
                  <Shield className="w-6 h-6 text-patina mb-3" />
                  <h4 className="font-light mb-2">Founding Member Status</h4>
                  <p className="text-sm text-muted-foreground font-light">
                    Your name in our foundry. Part of the story from day one.
                  </p>
                </div>
              </div>
            </div>          </div>
        </section>

        {/* THE INVESTMENTS MERGED - ONE Unified Black Section */}
        <section className="py-16 px-6 bg-[#050505] relative overflow-hidden" data-testid="section-investments-unified">
          {/* Kiln/forge video background - faded */}
          <div className="absolute inset-0 opacity-[0.12]">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={burntMetalVideo} type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/95 to-[#050505]/80" />
          
          <div className="max-w-5xl mx-auto relative z-10 space-y-14">
            
            {/* Main heading + scarcity */}
            <div className="text-center">
              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight text-white">
                <span className="hero-glass-text">Your Investment Is Our Investment</span>
              </h2>
              
              {/* The 100 believers message */}
              <p className="text-base text-white/90 font-light max-w-3xl mx-auto mb-8 leading-relaxed">
                This foundry will only exist and get finished because of the 100 people who believed in something special. 
                <span className="text-bronze font-light"> Not crowdfunding. Co-creation.</span>
              </p>
              
              {/* Scarcity display */}
              {totalRemaining > 0 && (
                <div className="mb-12">
                  <span className="inline-block text-8xl md:text-9xl font-light text-bronze mb-3">
                    {totalRemaining}
                  </span>
                  <p className="text-base text-white/60 font-light">
                    seats remaining • then this chapter closes
                  </p>
                </div>
              )}
            </div>

            {/* The triple meaning - Three types of investment */}
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center border border-bronze/20 rounded-lg p-8 bg-white/[0.02] backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-accent-gold" />
                </div>
                <h3 className="font-serif text-2xl font-light text-white mb-3">Your Financial Investment</h3>
                <p className="text-white/70 leading-relaxed text-base font-light">
                  Capital (R3,000–R5,000) funds our foundry's final fit-out — the kilns, crucibles, and precision equipment that make this art possible.
                </p>
              </div>

              <div className="text-center border border-bronze/30 rounded-lg p-8 bg-bronze/[0.05] backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Flame className="w-8 h-8 text-bronze" />
                </div>
                <h3 className="font-serif text-2xl font-light text-white mb-3">Our Technical Investment</h3>
                <p className="text-white/70 leading-relaxed text-base font-light">
                  We <span className="text-bronze font-light">invest</span> your specimen in a heat-resistant plaster mix, encasing it to withstand 700°C and create your bronze mold.
                </p>
              </div>

              <div className="text-center border border-patina/20 rounded-lg p-8 bg-white/[0.02] backdrop-blur-sm hover-elevate">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-patina" />
                </div>
                <h3 className="font-serif text-2xl font-light text-white mb-3">Your Bronze Asset</h3>
                <div className="text-4xl font-light mb-4 value-gradient">
                  R25,000+ retail
                </div>
                <p className="text-white/70 leading-relaxed text-base font-light">
                  A one-of-a-kind sculpture cast by a master craftsperson with 30 years of world-renowned precision work.
                </p>
              </div>
            </div>

            {/* The punchline */}
            <div className="text-center border-t border-bronze/20 pt-10">
              <p className="text-lg text-white/90 font-light max-w-3xl mx-auto leading-relaxed mb-6">
                Both <span className="text-accent-gold font-medium">investments</span> happen <span className="text-bronze font-medium">simultaneously</span>. You <span className="text-patina font-medium">invest</span> in our future. We <span className="text-bronze font-medium">invest</span> your cutting. Together, we create something 
                <span className="text-bronze font-serif italic"> Timeless</span>.
              </p>
              
              <p className="text-xl font-light italic mb-10 pb-10 border-b border-bronze/20">
                <span className="text-bronze">"Once they're gone, this chapter closes. The kiln doors shut.</span>
                <br />
                <span className="text-accent-gold">This founding group becomes the story</span> 
                <span className="text-bronze"> — and you become part of it."</span>
              </p>
              
              <Button asChild size="lg" className="btn-bronze gap-2 min-h-14 text-lg px-10" data-testid="button-investments-cta">
                <Link href="/founding-100">
                  Secure Your Seat Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* WHAT ARE THE WORKSHOPS */}
        <section className="py-12 px-6" data-testid="section-workshops">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs tracking-[0.3em] text-patina uppercase font-light mb-4 block">
                  Coming Q2 2025
                </span>
                <h2 className="font-serif text-3xl font-light mb-4 tracking-tight">
                  2-Day Bronze Workshops
                </h2>
                <p className="text-muted-foreground font-light leading-relaxed mb-6">
                  Learn the ancient art of lost-wax casting. Maximum 6 participants. 
                  Take home your own bronze sculpture.
                </p>
                <Button asChild variant="outline" className="gap-2" data-testid="button-workshops">
                  <Link href="/workshops">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Day 1</div>
                  <p className="text-xs text-muted-foreground">Specimen selection, mold making, investment</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Overnight</div>
                  <p className="text-xs text-muted-foreground">700°C kiln burnout</p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Day 2</div>
                  <p className="text-xs text-muted-foreground">Bronze pour, reveal, finishing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REGISTER INTEREST CTA - Horizontal */}
        <section className="py-12 md:py-16 px-6 bg-gradient-to-r from-bronze/10 via-transparent to-patina/10 border-y border-bronze/20" data-testid="section-register-interest">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="font-serif text-2xl md:text-3xl font-light mb-2">
                  Interested but not ready?
                </h3>
                <p className="text-muted-foreground font-light">
                  Join our waitlist for future workshops, custom commissions, and exclusive founding updates.
                </p>
              </div>
              <div className="flex-1 md:flex-none">
                <Button asChild variant="outline" className="w-full md:w-auto" data-testid="button-register-interest">
                  <a href="#subscribe">
                    Register Your Interest
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
