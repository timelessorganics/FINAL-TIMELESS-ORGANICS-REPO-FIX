import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Shield, Award, ArrowRight, Flame, Users, Leaf, Calendar, Plus, Minus } from "lucide-react";
import SeatSelectionModal from "@/components/seat-selection-modal";

import heroImage from "@assets/Gemini_Generated_Image_rf3vd6rf3vd6rf3v_1764248900779.png";
import bronzeImage1 from "@assets/Gemini_Generated_Image_rf3vd6rf3vd6rf3v_1764170102466.png";
import bronzeImage2 from "@assets/Gemini_Generated_Image_rl9enarl9enarl9e_1764170102466.png";
import bronzeImage3 from "@assets/Gemini_Generated_Image_o0oi1oo0oi1oo0oi_1764170102464.png";
import davidStoryImage from "@assets/Gemini_Generated_Image_pgo4cnpgo4cnpgo4_result_1764296343897.webp";

import smokeVideo from "@assets/3 SMOKE HOVERS TINY SPARKS7_1761435915770.mp4";
import flowerBloomVideo from "@assets/Yellow-Lily-Opening-On-Black-Background-4K-2025-08-29-08-44-48-Utc_1764103216693.mp4";
import burntMetalVideo from "@assets/Burnt-Metal-2025-08-29-06-20-21-Utc_1764160699730.mp4";

interface SeatAvailability {
  type: string;
  name: string;
  price: number;
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
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPaymentType, setCheckoutPaymentType] = useState<'full' | 'deposit'>('full');
  const [founderQuantity, setFounderQuantity] = useState(1);
  const [patronQuantity, setPatronQuantity] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<string>("24:00:00");
  const [, setLocation] = useLocation();
  
  const { data: seats } = useQuery<SeatAvailability[]>({
    queryKey: ['/api/seats/availability'],
  });
  
  const { data: prelaunchStats } = useQuery<PreLaunchStats>({
    queryKey: ['/api/prelaunch/stats'],
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

  const handleSeatSelection = (seatType: 'founder' | 'patron', quantity: number = 1) => {
    let url = `/checkout/${seatType}?quantity=${quantity}`;
    if (checkoutPaymentType === 'deposit') {
      url += '&mode=deposit';
    }
    setCheckoutModalOpen(false);
    setLocation(url);
  };

  const founderSeats = seats?.find(s => s.type === 'founder');
  const patronSeats = seats?.find(s => s.type === 'patron');
  const founderRemaining = founderSeats?.remaining || 0;
  const patronRemaining = patronSeats?.remaining || 0;
  const totalRemaining = founderRemaining + patronRemaining;
  const totalReserved = prelaunchStats?.totalReserved || 0;

  return (
    <>
      <Header />
      
      <main className="relative z-50">
        
        {/* HERO: Bronze emerging from darkness - STABLE GRID LAYOUT */}
        <section 
          className="relative min-h-screen overflow-hidden bg-[#050505]" 
          data-testid="section-hero"
        >
          {/* Layer 1: Full-bleed hero image */}
          <div className="absolute inset-0 hero-image-reveal">
            <img 
              src={heroImage} 
              alt="Wall-mounted bronze botanical sculpture on slate" 
              className="w-full h-full object-cover bronze-warmth-subtle"
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
                <span className="inline-block font-serif text-base sm:text-2xl md:text-4xl font-semibold tracking-[0.08em] sm:tracking-[0.12em] uppercase moving-fill">
                  Founding 100 Investor Launch
                </span>
              </div>
            </div>
          </div>

          {/* Layer 4: Content grid - stable positioning */}
          <div className="relative z-10 min-h-screen grid grid-rows-[1fr_auto_1fr] px-4 sm:px-6 py-12 sm:py-16">
            
            {/* Spacer - first row pushes content down */}
            <div />
            
            {/* Center content - fixed height area */}
            <div className="text-center max-w-4xl mx-auto w-full">
              
              {/* Main title with glassy effect - responsive sizing */}
              <h1 className="hero-text-reveal hero-text-reveal-delay-2 font-serif text-[clamp(2.5rem,8vw,6rem)] font-light mb-4 sm:mb-6 leading-[1.05] tracking-tight">
                <span className="hero-glass-text">Timeless Organics</span>
              </h1>
              
              {/* Tagline - Playfair Display font, responsive */}
              <p className="hero-text-reveal hero-text-reveal-delay-3 font-serif text-base sm:text-xl md:text-2xl lg:text-3xl text-white/90 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
                One-Of-A-Kind Castings From Organic Matter
              </p>

              {/* Seat Selection Cards - 24hr Friends & Family Discount */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                {/* FOUNDER SEAT CARD */}
                <div className="group relative flex-1 max-w-xs p-6 sm:p-8 border border-white/20 rounded-lg bg-black backdrop-blur-sm hover:bg-black/80 hover:border-white/30 transition-all duration-300 hover-elevate">
                  <div className="text-left space-y-4">
                    <div>
                      <p className="text-xs text-white font-bold uppercase tracking-wider mb-1">Founder Seat</p>
                      <p className="text-xs text-white/60 font-light mb-2">Unmounted and Unpatinated</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-white/50 font-light line-through">Full Price: R4,500</p>
                      <p className="font-serif text-3xl sm:text-4xl font-bold text-bronze">R3,000</p>
                      <p className="text-xs text-bronze/80 font-light">24hr Friends & Family</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border border-white/30 rounded-md p-2 w-fit">
                      <button
                        onClick={() => setFounderQuantity(Math.max(1, founderQuantity - 1))}
                        className="p-1 hover:text-white transition-colors text-white/70"
                        data-testid="button-founder-qty-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-white w-8 text-center">{founderQuantity}</span>
                      <button
                        onClick={() => setFounderQuantity(founderQuantity + 1)}
                        className="p-1 hover:text-white transition-colors text-white/70"
                        data-testid="button-founder-qty-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-white/60 font-light">The Perfect Gift</p>
                    
                    <button
                      onClick={() => { setCheckoutPaymentType('full'); handleSeatSelection('founder', founderQuantity); }}
                      className="w-full py-2 px-3 bg-white/10 border border-white/30 rounded-md hover:bg-white/20 transition-colors flex items-center gap-2 justify-center text-sm font-semibold text-white"
                      data-testid="button-select-founder"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PATRON SEAT CARD */}
                <div className="group relative flex-1 max-w-xs p-6 sm:p-8 border border-teal-600/40 rounded-lg bg-teal-950/40 backdrop-blur-sm hover:bg-teal-950/60 hover:border-teal-600/60 transition-all duration-300 hover-elevate">
                  <div className="text-left space-y-4">
                    <div>
                      <p className="text-xs text-teal-400 font-bold uppercase tracking-wider mb-1">Patron Seat</p>
                      <p className="text-xs text-teal-300/80 font-light mb-2">Includes Patina + Mounting (R2,000 value)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-white/50 font-light line-through">Full Price: R6,000</p>
                      <p className="font-serif text-3xl sm:text-4xl font-bold text-accent-gold">R4,500</p>
                      <p className="text-xs text-accent-gold/80 font-light">24hr Friends & Family</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border border-teal-500/40 rounded-md p-2 w-fit">
                      <button
                        onClick={() => setPatronQuantity(Math.max(1, patronQuantity - 1))}
                        className="p-1 hover:text-teal-400 transition-colors text-teal-300/70"
                        data-testid="button-patron-qty-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-teal-400 w-8 text-center">{patronQuantity}</span>
                      <button
                        onClick={() => setPatronQuantity(patronQuantity + 1)}
                        className="p-1 hover:text-teal-400 transition-colors text-teal-300/70"
                        data-testid="button-patron-qty-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-teal-300/70 font-light">The Perfect Gift</p>
                    
                    <button
                      onClick={() => { setCheckoutPaymentType('full'); handleSeatSelection('patron', patronQuantity); }}
                      className="w-full py-2 px-3 bg-teal-500/20 border border-teal-500/50 rounded-md hover:bg-teal-500/30 transition-colors flex items-center gap-2 justify-center text-sm font-semibold text-teal-400"
                      data-testid="button-select-patron"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fire Sale Info Banner - With countdown and seats remaining */}
              <div className="hero-text-reveal hero-text-reveal-delay-3 space-y-2 text-center">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="text-xs text-white/50 font-light">
                    <span className="text-bronze font-semibold">{founderRemaining}</span> Founder / <span className="text-teal-400 font-semibold">{patronRemaining}</span> Patron remaining
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="text-xs text-white/50 font-light">
                    <span className="text-accent-gold font-semibold">{timeRemaining}</span>
                  </div>
                </div>
                <p className="text-sm text-accent-gold font-semibold">Friends and Family Early Bird Fire Sale Expires in 24 hrs!!</p>
              </div>
                
              {/* Reservation counter - shows live reservations */}
              {totalReserved > 0 && (
                <div className="hero-text-reveal hero-text-reveal-delay-3 flex items-center gap-2 text-sm text-white/70 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm justify-center">
                  <Sparkles className="w-4 h-4 text-bronze" />
                  <span className="font-semibold text-white">{totalReserved}</span>
                  <span>seats already reserved</span>
                </div>
              )}
            </div>
            
            {/* Bottom area - seat counter and scroll hint */}
            <div className="flex flex-col items-center justify-start pt-4 gap-4">
              {/* Seat counter */}
              {totalRemaining > 0 && (
                <div className="hero-text-reveal hero-text-reveal-delay-3">
                  <span className="text-xs sm:text-sm text-white/50 font-light">
                    {totalRemaining} of 100 seats remaining
                  </span>
                </div>
              )}
              
              {/* Scroll indicator */}
              <div className="text-white/30 animate-bounce">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
              </div>
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
            </div>

            {/* Seat Cards - Luxe Premium Design */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Founder Seat */}
              <div className="group relative rounded-xl overflow-hidden border border-bronze/50 bg-gradient-to-br from-bronze/15 via-background to-background shadow-lg hover-elevate transition-all duration-300">
                {/* Accent glow */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-bronze/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Subtle patina accent */}
                <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-patina/40 to-transparent" />
                
                <div className="relative p-8 md:p-10">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 bg-bronze rounded-full" />
                    <span className="text-xs font-semibold text-bronze uppercase tracking-wider">Best Value</span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-serif text-3xl md:text-4xl text-bronze mb-1">Founder</h3>
                  <div className="h-1 w-12 bg-gradient-to-r from-bronze via-patina/20 to-bronze/30 mb-6 rounded-full" />
                  
                  <div className="mb-8">
                    <div className="text-5xl font-light text-bronze">R{((founderSeats?.price || 300000) / 100).toLocaleString()}</div>
                    <p className="text-xs text-bronze/50 mt-2 font-light">
                      {founderSeats?.remaining || 50} of 50 seats remaining
                    </p>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1 h-1 bg-bronze rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground font-light">One-of-a-kind bronze casting from real specimen</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1 h-1 bg-bronze rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground font-light">50% off future 2-day workshop</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1 h-1 bg-bronze rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground font-light">20% lifetime discount on all future works</span>
                    </li>
                  </ul>

                  {/* 2-Tier Buttons: BUY NOW + SECURE */}
                  <div className="space-y-3">
                    <Button 
                      asChild
                      className="w-full min-h-11 text-sm font-semibold btn-bronze"
                      data-testid="button-buy-founder"
                    >
                      <Link href="/checkout/founder">BUY NOW</Link>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full min-h-11 text-sm font-medium border-bronze/40 text-bronze hover:bg-bronze/10"
                      data-testid="button-secure-founder"
                    >
                      <Link href="/checkout/founder?mode=deposit">
                        <Shield className="w-4 h-4 mr-2" />
                        SECURE R1K
                      </Link>
                    </Button>
                    <p className="text-[10px] text-muted-foreground/70 text-center">
                      48hr deadline to pay balance
                    </p>
                  </div>
                </div>
              </div>

              {/* Patron Seat - PREMIUM */}
              <div className="group relative rounded-xl overflow-hidden border border-accent-gold/60 bg-gradient-to-br from-accent-gold/20 via-background to-background shadow-xl hover-elevate transition-all duration-300">
                {/* Accent glow - more prominent */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-gold/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Premium indicator */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent" />
                {/* Subtle patina accent */}
                <div className="absolute top-0 right-0 w-1 h-16 bg-gradient-to-b from-patina/30 to-transparent" />
                
                <div className="relative p-8 md:p-10">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                    <span className="text-xs font-semibold text-accent-gold uppercase tracking-wider">Premium Choice</span>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-serif text-3xl md:text-4xl text-accent-gold mb-1">Patron</h3>
                  <div className="h-1 w-12 bg-gradient-to-r from-accent-gold to-accent-gold/30 mb-6 rounded-full" />
                  
                  <div className="mb-8">
                    <div className="text-5xl font-light text-accent-gold">R{((patronSeats?.price || 500000) / 100).toLocaleString()}</div>
                    <p className="text-xs text-accent-gold/50 mt-2 font-light">
                      {patronSeats?.remaining || 50} of 50 seats remaining
                    </p>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1 h-1 bg-accent-gold rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground font-light">One-of-a-kind bronze casting from real specimen</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1 h-1 bg-accent-gold rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground font-light">80% off future 2-day workshop</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <span className="w-1 h-1 bg-accent-gold rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground font-light">30% lifetime discount on all future works</span>
                    </li>
                  </ul>

                  {/* 2-Tier Buttons: BUY NOW + SECURE */}
                  <div className="space-y-3">
                    <Button 
                      asChild
                      className="w-full min-h-11 text-sm font-semibold bg-accent-gold text-background hover:bg-accent-gold/90"
                      data-testid="button-buy-patron"
                    >
                      <Link href="/checkout/patron">BUY NOW</Link>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full min-h-11 text-sm font-medium border-accent-gold/40 text-accent-gold hover:bg-accent-gold/10"
                      data-testid="button-secure-patron"
                    >
                      <Link href="/checkout/patron?mode=deposit">
                        <Shield className="w-4 h-4 mr-2" />
                        SECURE R1K
                      </Link>
                    </Button>
                    <p className="text-[10px] text-muted-foreground/70 text-center">
                      48hr deadline to pay balance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

              <div className="text-center border border-patina/20 rounded-lg p-8 bg-white/[0.02] backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-patina" />
                </div>
                <h3 className="font-serif text-2xl font-light text-white mb-3">Your Bronze Asset</h3>
                <p className="text-white/70 leading-relaxed text-base font-light">
                  A one-of-a-kind sculpture worth R25,000+ cast by a master craftsperson with 30 years of world-renowned precision work.
                </p>
              </div>
            </div>

            {/* The punchline */}
            <div className="text-center border-t border-bronze/20 pt-10">
              <p className="text-lg text-white/90 font-light max-w-3xl mx-auto leading-relaxed mb-6">
                Both investments happen <span className="text-bronze font-medium">simultaneously</span>. You invest in our future. We invest your cutting. Together, we create something 
                <span className="text-bronze font-serif italic"> Timeless</span>.
              </p>
              
              <p className="text-xl text-bronze font-light italic mb-10 pb-10 border-b border-bronze/20">
                "Once they're gone, this chapter closes. The kiln doors shut. 
                This founding group becomes the story — and you become part of it."
              </p>
              
              <Button asChild size="lg" className="btn-bronze gap-2 min-h-14 text-lg px-10" data-testid="button-investments-cta">
                <Link href="#seats">
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

      </main>

      <Footer />
      
      {/* Seat Selection Modal */}
      <SeatSelectionModal 
        open={checkoutModalOpen}
        onOpenChange={setCheckoutModalOpen}
        paymentType={checkoutPaymentType}
      />
    </>
  );
}
