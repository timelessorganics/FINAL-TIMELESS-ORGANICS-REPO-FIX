import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Shield, Award, ArrowRight } from "lucide-react";

import heroImage from "@assets/Gemini_Generated_Image_rf3vd6rf3vd6rf3v_1764248900779.png";
import bronzeImage1 from "@assets/Gemini_Generated_Image_rf3vd6rf3vd6rf3v_1764170102466.png";
import bronzeImage2 from "@assets/Gemini_Generated_Image_rl9enarl9enarl9e_1764170102466.png";
import bronzeImage3 from "@assets/Gemini_Generated_Image_o0oi1oo0oi1oo0oi_1764170102464.png";

interface SeatAvailability {
  type: string;
  name: string;
  price: number;
  totalAvailable: number;
  sold: number;
  remaining: number;
}

export default function HomePage() {
  const { data: seats } = useQuery<SeatAvailability[]>({
    queryKey: ['/api/seats/availability'],
  });

  const founderSeats = seats?.find(s => s.type === 'founder');
  const patronSeats = seats?.find(s => s.type === 'patron');
  const totalRemaining = (founderSeats?.remaining || 0) + (patronSeats?.remaining || 0);

  return (
    <>
      <Header />
      
      <main className="relative z-50">
        
        {/* HERO: Bronze emerging from darkness - FULL BLEED */}
        <section 
          className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505]" 
          data-testid="section-hero"
        >
          {/* Full-bleed hero image with slow fade-from-darkness */}
          <div className="absolute inset-0 hero-image-reveal">
            <img 
              src={heroImage} 
              alt="Wall-mounted bronze botanical sculpture on slate" 
              className="w-full h-full object-cover bronze-warmth-subtle"
            />
          </div>
          
          {/* Dark vignette overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-[#050505]/60" />
          
          {/* Hero content with staggered reveal */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            
            {/* Kicker */}
            <div className="hero-text-reveal hero-text-reveal-delay-1">
              <span className="inline-block text-xs tracking-[0.4em] text-bronze/90 uppercase font-light mb-6">
                Founding 100 Launch
              </span>
            </div>
            
            {/* Main title with glassy effect */}
            <h1 className="hero-text-reveal hero-text-reveal-delay-2 font-serif text-5xl md:text-7xl lg:text-8xl font-light mb-6 leading-[1.05] tracking-tight">
              <span className="hero-glass-text">Timeless Organics</span>
            </h1>
            
            {/* Tagline */}
            <p className="hero-text-reveal hero-text-reveal-delay-3 text-lg md:text-xl text-white/80 font-light max-w-xl mx-auto mb-8 leading-relaxed">
              Nature's originals, immortalized in bronze.
            </p>

            {/* CTA - Mobile-first with urgency */}
            <div className="hero-text-reveal hero-text-reveal-delay-3 flex flex-col items-center gap-4">
              <Link href="#seats">
                <Button size="lg" className="btn-bronze text-base px-10 py-6 min-h-14 gap-2" data-testid="button-secure-seat">
                  Reserve Your Seat
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {totalRemaining > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-light text-white/90">
                    {totalRemaining} of 100 seats left
                  </span>
                  <span className="text-xs text-bronze/70 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Reserve now, pay within 24 hours
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FOUNDING 100 LAUNCH - Clear Value Proposition */}
        <section id="seats" className="py-24 px-6 bg-gradient-to-b from-background to-card/30">
          <div className="max-w-5xl mx-auto">
            
            {/* Section header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 border border-bronze/30 rounded-full px-5 py-2 mb-6">
                <Clock className="w-4 h-4 text-bronze" />
                <span className="text-bronze text-xs uppercase tracking-wider font-medium">24-Hour Seat Reservation</span>
              </div>
              
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-4 tracking-tight">
                <span className="hero-glass-text">Founding 100</span>
              </h2>
              
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light leading-relaxed">
                Invest in our Kommetjie foundry. Receive a guaranteed bronze casting 
                and lifetime benefits.
              </p>
            </div>

            {/* What You Get */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="text-center p-6 border border-border/50 rounded-lg bg-card/30">
                <Award className="w-8 h-8 text-bronze mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Bronze Sculpture</h3>
                <p className="text-sm text-muted-foreground font-light">
                  One-of-a-kind botanical casting. Retail value R25,000+
                </p>
              </div>
              <div className="text-center p-6 border border-border/50 rounded-lg bg-card/30">
                <Sparkles className="w-8 h-8 text-accent-gold mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Workshop Vouchers</h3>
                <p className="text-sm text-muted-foreground font-light">
                  50-80% off future 2-day bronze casting workshops
                </p>
              </div>
              <div className="text-center p-6 border border-border/50 rounded-lg bg-card/30">
                <Shield className="w-8 h-8 text-patina mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Lifetime Discounts</h3>
                <p className="text-sm text-muted-foreground font-light">
                  20-30% off all future commissions and purchases
                </p>
              </div>
            </div>

            {/* Seat Cards - Mobile-optimized */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              
              {/* Founder Seat */}
              <div className="relative border border-bronze/40 rounded-lg p-6 md:p-8 bg-gradient-to-b from-bronze/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl text-bronze">Founder</h3>
                  <span className="text-xs text-bronze bg-bronze/10 px-2 py-1 rounded-full">
                    {founderSeats?.remaining || 50} left
                  </span>
                </div>
                <div className="text-4xl font-light mb-4">
                  R{((founderSeats?.price || 300000) / 100).toLocaleString()}
                </div>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-bronze rounded-full" />
                    Guaranteed bronze casting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-bronze rounded-full" />
                    50% off one workshop
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-bronze rounded-full" />
                    20% lifetime discount
                  </li>
                </ul>
                <Link href="/checkout/founder">
                  <Button className="w-full btn-bronze min-h-12 text-base" data-testid="button-checkout-founder">
                    Reserve Now
                  </Button>
                </Link>
              </div>

              {/* Patron Seat */}
              <div className="relative border border-accent-gold/40 rounded-lg p-6 md:p-8 bg-gradient-to-b from-accent-gold/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-2xl text-accent-gold">Patron</h3>
                  <span className="text-xs text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-full">
                    {patronSeats?.remaining || 50} left
                  </span>
                </div>
                <div className="text-4xl font-light mb-4">
                  R{((patronSeats?.price || 500000) / 100).toLocaleString()}
                </div>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent-gold rounded-full" />
                    Guaranteed bronze casting
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent-gold rounded-full" />
                    80% off one workshop
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent-gold rounded-full" />
                    30% lifetime discount
                  </li>
                </ul>
                <Link href="/checkout/patron">
                  <Button className="w-full btn-bronze min-h-12 text-base" data-testid="button-checkout-patron">
                    Reserve Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust note - Mobile-friendly */}
            <div className="text-center mt-8 space-y-2">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-bronze" />
                24-hour reservation holds your seat
              </p>
              <p className="text-xs text-muted-foreground/60">
                Complete payment anytime within 24 hours. Secure checkout via PayFast.
              </p>
            </div>
          </div>
        </section>

        {/* BRONZE GALLERY - Beautiful Examples */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-light mb-3 tracking-tight">
                Wall-Mounted Bronzes
              </h2>
              <p className="text-muted-foreground font-light">
                Each piece is a unique botanical specimen, immortalized in bronze.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="aspect-[4/5] rounded-lg overflow-hidden border border-border/30 bg-card/20">
                <img 
                  src={bronzeImage1} 
                  alt="Bronze botanical sculpture" 
                  className="w-full h-full object-cover bronze-warmth"
                />
              </div>
              <div className="aspect-[4/5] rounded-lg overflow-hidden border border-border/30 bg-card/20">
                <img 
                  src={bronzeImage2} 
                  alt="Bronze botanical sculpture" 
                  className="w-full h-full object-cover bronze-warmth"
                />
              </div>
              <div className="aspect-[4/5] rounded-lg overflow-hidden border border-border/30 bg-card/20">
                <img 
                  src={bronzeImage3} 
                  alt="Bronze botanical sculpture" 
                  className="w-full h-full object-cover bronze-warmth"
                />
              </div>
            </div>

            <div className="text-center mt-10">
              <Link href="/sculptures">
                <Button variant="outline" className="gap-2 border-bronze/30 text-bronze" data-testid="button-view-gallery">
                  View Full Gallery
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT / VISION - Brief */}
        <section className="py-24 px-6 bg-card/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-light mb-6 tracking-tight">
              The Vision
            </h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-8">
              Timeless Organics preserves the fleeting beauty of Cape Fynbos botanicals 
              through the ancient art of lost-wax bronze casting. Each sculpture captures 
              a moment in nature's cycle — a bloom at its peak, a seedhead ready to release, 
              a leaf perfectly curved by the sun.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed mb-10">
              Founded by sculptor David Junor, our Kommetjie studio combines traditional 
              foundry techniques with a deep respect for South Africa's unique botanical heritage.
            </p>
            <Link href="/about">
              <Button variant="ghost" className="text-bronze" data-testid="button-about">
                Meet David
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* WORKSHOPS PREVIEW */}
        <section className="py-24 px-6">
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
                <Link href="/workshops">
                  <Button variant="outline" className="gap-2" data-testid="button-workshops">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="border border-border/30 rounded-lg p-6 bg-card/30 space-y-4">
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

        {/* FINAL CTA */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-bronze/5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-light mb-4 tracking-tight">
              <span className="hero-glass-text">Join the Founding 100</span>
            </h2>
            <p className="text-muted-foreground font-light mb-8">
              Limited seats. Lifetime benefits. Your investment supports the studio.
            </p>
            <Link href="#seats">
              <Button size="lg" className="btn-bronze gap-2" data-testid="button-final-cta">
                Secure Your Seat
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
