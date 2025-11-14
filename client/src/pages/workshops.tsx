import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InterestForm } from "@/components/InterestForm";
import { Link } from "wouter";
import { Flame, Hammer, Users, Clock, Award, Sparkles, ArrowRight } from "lucide-react";

export default function WorkshopsPage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-16">
          
          <section className="text-center mb-20 pt-8" data-testid="section-hero">
            <div className="kicker mb-4">COMING Q2 2025</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="moving-fill">Bronze Casting</span> Workshops
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Learn the ancient art of lost-wax bronze casting in intimate, hands-on workshops. 
              Guided by master sculptor David Junor in our Kommetjie foundry.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <Card className="p-8 bg-card/50 border-card-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-bronze" />
                </div>
                <h3 className="font-serif text-2xl font-bold">2-Day Intensive</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Day 1: Specimen selection, mold creation, and investment. Your piece burns out overnight.
                Day 2: Bronze pour, reveal, finishing, and patina options. Leave with your completed sculpture.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 border-card-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-patina/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-patina" />
                </div>
                <h3 className="font-serif text-2xl font-bold">Small Groups</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Maximum 6 participants per workshop. Personal attention, hands-on guidance, 
                and direct access to professional bronze casting techniques rarely taught outside apprenticeships.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 border-card-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-accent-gold" />
                </div>
                <h3 className="font-serif text-2xl font-bold">Your Specimen</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Bring your own botanical cutting (within size limits) or select from our curated Cape Fynbos specimens. 
                Each piece becomes a permanent bronze sculpture.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 border-card-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-bronze" />
                </div>
                <h3 className="font-serif text-2xl font-bold">Archival Quality</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Museum-grade casting techniques. Learn proper investment, pour timing, 
                finishing methods, and patina chemistry for bronze that will last generations.
              </p>
            </Card>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                What You'll <span className="text-accent-gold">Master</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-card/50 border border-card-border flex items-center justify-center mx-auto mb-4">
                  <Hammer className="w-8 h-8 text-bronze" />
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Investment Process</h4>
                <p className="text-sm text-muted-foreground">
                  Encasing your specimen in heat-resistant plaster, creating the perfect mold for molten bronze.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-card/50 border border-card-border flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-accent-gold" />
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Bronze Pouring</h4>
                <p className="text-sm text-muted-foreground">
                  The moment of transformation — witnessing 1100°C molten bronze fill your mold.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-card/50 border border-card-border flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-patina" />
                </div>
                <h4 className="font-serif text-xl font-bold mb-2">Finishing & Patina</h4>
                <p className="text-sm text-muted-foreground">
                  Chasing, sanding, and applying chemical patinas to bring out bronze's natural beauty.
                </p>
              </div>
            </div>
          </section>

          <section className="max-w-2xl mx-auto">
            <Card className="p-8 bg-card/50 border-card-border text-center">
              <h3 className="font-serif text-3xl font-bold mb-4">
                Join the Waiting List
              </h3>
              <p className="text-muted-foreground mb-6">
                Workshop dates will be announced in early 2025. Sign up to be notified when bookings open.
              </p>
              <InterestForm />
            </Card>
          </section>

          <section className="mt-16 max-w-3xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-bronze/10 to-accent-gold/10 border-accent-gold/30">
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-accent-gold/20 rounded-full text-xs font-medium text-accent-gold mb-3">
                  LIMITED OPPORTUNITY
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                  Join the Founding 100
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Secure a museum-quality bronze casting now. Founding investors receive a custom Cape Fynbos sculpture, 
                  lifetime workshop discounts, and exclusive access to future opportunities.
                </p>
                <Link href="/#seats">
                  <Button className="btn-bronze gap-2" data-testid="button-founding-cta">
                    Explore Founding 100 Seats <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
