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
                <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-amber-600/30 rounded-full text-amber-200 text-[0.75rem] sm:text-sm font-black tracking-wide shadow-lg shadow-amber-600/40 border border-amber-500/50">
                  <div className="flex items-center gap-2 justify-center">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                    <span>24HR FRIENDS & FAMILY FIRE SALE</span>
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Catchy Deal Copy - Emphasize Best Deal + Lifetime Benefits */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 mb-6 sm:mb-10">
                <p className="text-sm sm:text-base text-amber-200 font-serif font-bold">THE BEST DEAL ON THE PLANET</p>
                <p className="text-xs sm:text-sm text-amber-100/90 font-light mt-1">Bronze Sculpture + 20-30% Lifetime Discounts Forever</p>
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
      </main>
    </>
  );
}
