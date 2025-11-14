import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Leaf, Flower, TreePine, Shell } from "lucide-react";

const specimenStyles = [
  { name: "Protea Head", icon: Flower, description: "King Protea or Sugarbush blooms", season: "Winter-Spring" },
  { name: "Pincushion Bloom", icon: Flower, description: "Leucospermum flowering heads", season: "Spring" },
  { name: "Cone + Bracts", icon: TreePine, description: "Woody Protea cones with bracts", season: "Year-round" },
  { name: "Aloe Inflorescence", icon: Flower, description: "Flowering spikes and rosettes", season: "Winter" },
  { name: "Erica Spray", icon: Leaf, description: "Heath flowering branches", season: "Spring-Summer" },
  { name: "Restio Seedheads", icon: Leaf, description: "Reed-like stems with seeds", season: "Summer-Autumn" },
  { name: "Bulb Spike", icon: Flower, description: "Watsonia or Gladiolus blooms", season: "Spring-Summer" },
  { name: "Pelargonium", icon: Leaf, description: "Geranium leaves and flowers", season: "Spring-Summer" },
  { name: "Woody Branch", icon: TreePine, description: "Bark textures and twigs", season: "Year-round" },
  { name: "Cone/Seed Pod", icon: Shell, description: "Dry seed structures", season: "Autumn-Winter" },
  { name: "Succulent Rosette", icon: Leaf, description: "Compact leaf formations", season: "Year-round" },
  { name: "Miniature Mix", icon: Flower, description: "Multiple small specimens", season: "Varies" },
];

export default function CommissionPage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 py-16">
          
          <section className="text-center mb-20 pt-8" data-testid="section-hero">
            <div className="kicker mb-4">BESPOKE BRONZE</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Commission a <span className="moving-fill">Custom Casting</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Preserve a botanical specimen that holds meaning for you. Each commission is a unique collaboration 
              between your vision and our craft.
            </p>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Cape Fynbos <span className="text-accent-gold">Specimen Styles</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-6"></div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                David personally selects the finest specimen of your chosen style from current or upcoming seasonal harvest. 
                Each casting captures peak seasonal beauty.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {specimenStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <Card key={style.name} className="p-6 bg-card/50 border-card-border hover-elevate">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent-gold" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-bold mb-1">{style.name}</h4>
                        <p className="text-xs text-accent-gold">{style.season}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Link href="/seasonal-guide">
                <Button variant="outline" className="gap-2" data-testid="link-seasonal-guide">
                  View Full Seasonal Guide <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                The <span className="text-accent-gold">Commission Process</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-8"></div>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">Consultation</h4>
                    <p className="text-muted-foreground">
                      Discuss your vision, specimen style preference, intended placement, and sizing. 
                      We'll explore seasonal timing and patina options.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">Specimen Selection</h4>
                    <p className="text-muted-foreground">
                      David selects the perfect specimen at peak seasonal beauty. You'll receive photos for approval 
                      before we proceed with investment.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">Casting & Finishing</h4>
                    <p className="text-muted-foreground">
                      Lost-wax casting process takes 2-4 weeks. Includes investment, burnout, bronze pour, 
                      chasing, and your choice of natural, verdigris, or heat-patina finish.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">Delivery & Mounting</h4>
                    <p className="text-muted-foreground">
                      Secure packaging with Certificate of Authenticity. Optional custom mounting (wall bracket, 
                      base, or bespoke display) available.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="max-w-2xl mx-auto">
            <Card className="p-10 bg-card/50 border-card-border text-center">
              <h3 className="font-serif text-3xl font-bold mb-4">
                Start Your Commission
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Custom bronze commissions begin at R8,500. Pricing varies based on specimen complexity, 
                size, and finishing requirements. Contact us to discuss your vision.
              </p>
              <div className="space-y-3">
                <Button variant="default" className="btn-bronze w-full" data-testid="button-email">
                  <a href="mailto:david@timeless.organic">Email: david@timeless.organic</a>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Or message via Instagram: <a href="https://instagram.com/timeless.organic" className="text-accent-gold hover:underline">@timeless.organic</a>
                </p>
              </div>
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
