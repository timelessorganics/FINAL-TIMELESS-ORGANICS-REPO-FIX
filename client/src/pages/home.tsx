import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Sparkles, Award } from "lucide-react";
import aloeImage from "@assets/Bronze Aloe Sculpture in Resin Block 2_1763150497628.jpg";

export default function HomePage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50">
        
        {/* Hero Section - Timeless Organics Brand */}
        <section 
          className="min-h-[85vh] flex items-center justify-center px-6 py-24 relative overflow-hidden" 
          data-testid="section-hero"
          style={{
            backgroundImage: `url(${aloeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/85" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-6 text-sm tracking-[0.3em] text-accent-gold/90 uppercase font-medium">
              Bronze • Patina • Organic Casting
            </div>
            
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1]">
              <span className="moving-fill">Timeless Organics</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              One-of-a-kind castings from organic matter.<br />
              Nature's originals, held forever in bronze.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/founding-100">
                <Button size="lg" className="btn-bronze text-base px-8 py-6 min-h-14" data-testid="button-founding-100">
                  Limited Seats - Founding 100
                </Button>
              </Link>
              <Link href="/workshops">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-base px-8 py-6 min-h-14 bg-background/30 backdrop-blur-sm border-foreground/20 hover:border-foreground/40" 
                  data-testid="button-explore-workshops"
                >
                  Explore Workshops
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-10 bg-background/40 border-border/50 text-left hover-elevate backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">From Nature</div>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">Organic<br />Matter</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Cape Fynbos botanical specimens selected at peak seasonal beauty
                </p>
              </Card>

              <Card className="p-10 bg-background/40 border-border/50 text-left hover-elevate backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">Finish</div>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">Patina<br />Bronze</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Lost-wax casting with museum-grade bronze finishing techniques
                </p>
              </Card>

              <Card className="p-10 bg-background/40 border-border/50 text-left hover-elevate backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">Edition</div>
                <h3 className="font-serif text-2xl font-bold mb-4 leading-tight">One-of-<br />One</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Each botanical specimen is unique — no two castings are identical
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Founding 100 Launch Callout */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent-gold/20 border border-accent-gold/50 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold font-bold text-sm uppercase tracking-wide">Limited Time Offer</span>
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Join the <span className="text-accent-gold">Founding 100</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Fund our Kommetjie foundry's final fit-out. We invest (encase) your chosen botanical specimen now — 
              guaranteeing you a bronze casting when the studio opens (estimated Jan 2026).
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-gold mb-1">100</div>
                <div className="text-sm text-muted-foreground">Limited Seats</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-bronze mb-1">1</div>
                <div className="text-sm text-muted-foreground">Bronze Casting</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-patina mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Lifetime Benefits</div>
              </div>
            </div>

            <Link href="/founding-100">
              <Button size="lg" className="btn-bronze text-base px-8 py-6 min-h-14" data-testid="button-view-founding-seats">
                View Founder &amp; Patron Seats
              </Button>
            </Link>
          </div>
        </section>

        {/* Workshops Preview */}
        <section className="py-20 px-6 bg-card/20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-patina/20 border border-patina/50 rounded-full px-4 py-1 mb-4">
                  <Calendar className="w-3 h-3 text-patina" />
                  <span className="text-patina font-semibold text-xs uppercase tracking-wide">Coming Q2 2025</span>
                </div>
                
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  2-Day Bronze Casting <span className="text-accent-gold">Workshops</span>
                </h2>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Learn the ancient art of lost-wax bronze casting in intimate, hands-on workshops. 
                  Maximum 6 participants. Guided by master sculptor David Junor in our Kommetjie foundry.
                </p>
                
                <Link href="/workshops">
                  <Button variant="outline" className="gap-2" data-testid="button-learn-workshops">
                    Learn More
                  </Button>
                </Link>
              </div>

              <Card className="p-8 bg-card/80 border-card-border">
                <div className="space-y-6">
                  <div>
                    <div className="font-semibold mb-2">Day 1: Creation</div>
                    <p className="text-sm text-muted-foreground">
                      Specimen selection, mold making, investment preparation
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Overnight: Burnout</div>
                    <p className="text-sm text-muted-foreground">
                      700°C kiln firing transforms organic matter into bronze-ready cavity
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Day 2: Reveal</div>
                    <p className="text-sm text-muted-foreground">
                      Bronze pour, cool down, reveal, finishing, take home your sculpture
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Commission Work */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <Card className="p-8 bg-card/80 border-card-border order-2 md:order-1">
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-bronze" />
                      Consultation
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Discuss your vision, specimen style, sizing, and seasonal timing
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Specimen Selection</div>
                    <p className="text-sm text-muted-foreground">
                      David selects the perfect specimen at peak seasonal beauty
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Casting Process</div>
                    <p className="text-sm text-muted-foreground">
                      2-4 weeks for investment, burnout, pour, and finishing
                    </p>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Delivery</div>
                    <p className="text-sm text-muted-foreground">
                      Secure packaging with Certificate of Authenticity
                    </p>
                  </div>
                </div>
              </Card>

              <div className="order-1 md:order-2">
                <div className="kicker mb-3">Bespoke Bronze</div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  Commission a <span className="text-accent-gold">Custom Casting</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Preserve a botanical specimen that holds meaning for you. Choose from 12 Cape Fynbos styles. 
                  Each commission is a unique collaboration between your vision and our craft.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  <strong>Coming Soon</strong> — Pricing from R8,500. Includes specimen selection, casting, finishing, and certificate.
                </p>
                <Link href="/commission">
                  <Button variant="outline" className="gap-2" data-testid="button-view-commission">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
