import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Sparkles, Award } from "lucide-react";
import aloeImage from "@assets/aloe-certificate-background.png";

export default function HomePage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50">
        
        {/* Hero Section - Timeless Organics Brand */}
        <section 
          className="min-h-[70vh] flex items-center justify-center px-6 py-20 relative overflow-hidden" 
          data-testid="section-hero"
          style={{
            backgroundImage: `url(${aloeImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-4 text-sm tracking-widest text-bronze uppercase opacity-80">
              Bronze • Patina • Organic Casting
            </div>
            
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Timeless </span>
              <span className="text-accent-gold">Organics</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground max-w-2xl mx-auto mb-8 leading-relaxed font-light">
              One-of-a-kind castings from organic matter.<br />
              Nature's originals, held forever in bronze.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="/founding-100">
                <Button size="lg" className="btn-bronze text-lg px-8 py-6" data-testid="button-founding-100">
                  Limited Seats - Founding 100
                </Button>
              </Link>
              <Link href="/workshops">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-background/30 backdrop-blur-sm border-bronze/50 hover:border-bronze" 
                  data-testid="button-explore-future"
                >
                  Explore The Future Website
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section className="py-20 px-6 bg-card/20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-8 bg-card/80 border-card-border text-center hover-elevate">
                <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">From Nature</div>
                <h3 className="font-serif text-2xl font-bold mb-3">Organic<br />Matter</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cape Fynbos botanical specimens selected at peak seasonal beauty
                </p>
              </Card>

              <Card className="p-8 bg-card/80 border-card-border text-center hover-elevate">
                <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Finish</div>
                <h3 className="font-serif text-2xl font-bold mb-3">Patina<br />Bronze</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lost-wax casting with museum-grade bronze finishing techniques
                </p>
              </Card>

              <Card className="p-8 bg-card/80 border-card-border text-center hover-elevate">
                <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Edition</div>
                <h3 className="font-serif text-2xl font-bold mb-3">One-of-<br />One</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each botanical specimen is unique — no two castings are identical
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Founding 100 Launch Callout */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent-gold/20 border border-accent-gold/50 rounded-full px-6 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold font-bold text-sm uppercase tracking-wide">Limited Time Offer</span>
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Join the <span className="text-accent-gold">Founding 100</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Fund our Kommetjie foundry's final fit-out. We invest (encase) your chosen botanical specimen now — 
              guaranteeing you a bronze casting when the studio opens (estimated Jan 2026).
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
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
              <Button size="lg" className="btn-bronze text-lg px-8 py-6" data-testid="button-view-founding-seats">
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
