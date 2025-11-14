import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SeatCard from "@/components/seat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Flame, Hammer, Users, Clock, Leaf } from "lucide-react";
import type { Seat } from "@shared/schema";

export default function HomePage() {
  const { data: seats, isLoading } = useQuery<Seat[]>({
    queryKey: ["/api/seats/availability"],
  });

  const founderSeat = seats?.find((s) => s.type === "founder");
  const patronSeat = seats?.find((s) => s.type === "patron");

  const totalRemaining = seats 
    ? seats.reduce((acc, seat) => acc + (seat.totalAvailable - seat.sold), 0)
    : 0;

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50">
        
        {/* Hero Section - Founding 100 */}
        <section className="min-h-[90vh] flex items-center justify-center px-6 py-20" data-testid="section-hero">
          <div className="max-w-5xl mx-auto text-center">
            <div className="kicker mb-4" data-testid="text-kicker">
              FOUNDING 100 INVESTOR LAUNCH
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="moving-fill">Your Investment</span> is Our Investment
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Fund our Kommetjie foundry's final fit-out. We invest (encase) your chosen botanical specimen now — 
              guaranteeing you a bronze casting when the studio opens (estimated Jan 2026).
            </p>

            {totalRemaining > 0 && (
              <div className="inline-block bg-accent-gold/20 border border-accent-gold/50 rounded-full px-6 py-2 mb-8">
                <span className="text-accent-gold font-bold text-lg">{totalRemaining} seats remaining</span>
                <span className="text-muted-foreground text-sm ml-2">of 100</span>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button variant="default" className="btn-bronze" asChild>
                <a href="#seats">View Founder &amp; Patron Seats</a>
              </Button>
              <Link href="/about">
                <Button variant="outline">Our Story</Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <span className="text-patina">•</span>
                <span>Studio-selected specimens</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-patina">•</span>
                <span>Guaranteed bronze casting</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-patina">•</span>
                <span>Workshop discounts</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-patina">•</span>
                <span>Lifetime benefits</span>
              </div>
            </div>
          </div>
        </section>

        {/* Seat Selection */}
        <section id="seats" className="py-20 px-6" data-testid="section-seats">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Choose Your <span className="text-accent-gold">Investment</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Only 100 seats available. 50 Founders. 50 Patrons. Once they're gone, this opportunity closes forever.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-5xl mx-auto">
                {founderSeat && (
                  <SeatCard
                    seat={founderSeat}
                    title="Founder Pass"
                    subtitle="R3,000"
                    description="Launch our foundry. Secure your bronze. Get lifetime workshop access."
                    benefits={[
                      "One bronze casting of studio-selected specimen",
                      "50% off first 2-day workshop voucher",
                      "20% lifetime workshop discount code",
                      "Your name on our Founders & Patrons Leaf Wall",
                      "Certificate of Authenticity",
                    ]}
                  />
                )}

                {patronSeat && (
                  <SeatCard
                    seat={patronSeat}
                    title="Patron Pass"
                    subtitle="R5,000"
                    description="Premium support. Enhanced benefits. Deeper access to the ancient craft."
                    benefits={[
                      "One bronze casting of studio-selected specimen",
                      "80% off first 2-day workshop voucher",
                      "30% lifetime workshop discount code",
                      "Your name on our Founders & Patrons Leaf Wall",
                      "Certificate of Authenticity",
                    ]}
                    featured
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* What is Timeless Organics */}
        <section className="py-20 px-6 bg-card/20">
          <div className="max-w-[900px] mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              What is <span className="moving-fill">Timeless Organics</span>?
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-8"></div>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              A Kommetjie foundry dedicated to lost-wax bronze casting — preserving South Africa's unique 
              Cape Fynbos botanical heritage in permanent metal sculpture. Ancient craft meets contemporary conservation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card/50 border-card-border text-center">
                <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-6 h-6 text-bronze" />
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Lost-Wax Casting</h4>
                <p className="text-sm text-muted-foreground">
                  Ancient bronze technique. Botanical specimens burn away at 700°C, leaving perfect bronze impressions.
                </p>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border text-center">
                <div className="w-12 h-12 rounded-full bg-patina/20 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-patina" />
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Cape Fynbos</h4>
                <p className="text-sm text-muted-foreground">
                  Proteas, Ericas, Restios — botanical kingdom found nowhere else on Earth, preserved forever in bronze.
                </p>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border text-center">
                <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Hammer className="w-6 h-6 text-accent-gold" />
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Conservation Art</h4>
                <p className="text-sm text-muted-foreground">
                  Every casting is an archive. Craft as conservation. Bronze as a love letter to fragile beauty.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Workshops - Coming Soon */}
        <section className="py-20 px-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="kicker mb-3">COMING Q2 2025</div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  2-Day Bronze Casting <span className="text-accent-gold">Workshops</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Learn the ancient art of lost-wax bronze casting in intimate, hands-on workshops. 
                  Maximum 6 participants. Guided by master sculptor David Junor in our Kommetjie foundry.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Day 1: Specimen selection, mold creation, investment. Day 2: Bronze pour, reveal, 
                  finishing. Leave with your completed sculpture.
                </p>
                <Link href="/workshops">
                  <Button variant="outline" className="gap-2">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <Card className="p-8 bg-card/50 border-card-border">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-bronze mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">2-Day Intensive Format</div>
                      <p className="text-sm text-muted-foreground">Overnight burnout between days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-patina mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Small Group Experience</div>
                      <p className="text-sm text-muted-foreground">Maximum 6 participants per workshop</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Flame className="w-5 h-5 text-accent-gold mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Museum-Grade Techniques</div>
                      <p className="text-sm text-muted-foreground">Professional bronze casting methods</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Commission Work */}
        <section className="py-20 px-6 bg-card/20">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <Card className="p-8 bg-card/50 border-card-border order-2 md:order-1">
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Consultation:</strong> Discuss your vision, specimen style, sizing, and seasonal timing.
                  </p>
                  <p>
                    <strong className="text-foreground">Specimen Selection:</strong> David selects the perfect specimen at peak seasonal beauty.
                  </p>
                  <p>
                    <strong className="text-foreground">Casting Process:</strong> 2-4 weeks for investment, burnout, pour, and finishing.
                  </p>
                  <p>
                    <strong className="text-foreground">Delivery:</strong> Secure packaging with Certificate of Authenticity.
                  </p>
                </div>
              </Card>

              <div className="order-1 md:order-2">
                <div className="kicker mb-3">BESPOKE BRONZE</div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                  Commission a <span className="text-accent-gold">Custom Casting</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Preserve a botanical specimen that holds meaning for you. Choose from 12 Cape Fynbos styles. 
                  Each commission is a unique collaboration between your vision and our craft.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Pricing from R8,500. Includes specimen selection, casting, finishing, and certificate.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/commission">
                    <Button variant="outline" className="gap-2">
                      View Specimen Styles <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/seasonal-guide">
                    <Button variant="ghost">Seasonal Guide</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
