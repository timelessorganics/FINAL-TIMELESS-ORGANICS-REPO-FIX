import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Flame, Hammer, Leaf, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-16">
          
          <section className="text-center mb-16 pt-8" data-testid="section-hero">
            <div className="kicker mb-4">OUR STORY</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Timeless <span className="moving-fill">Organics</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ancient craft. Contemporary vision. South African botanical heritage preserved in bronze.
            </p>
          </section>

          <section className="prose prose-invert prose-lg max-w-none mb-16">
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-xl text-foreground/90 font-light first-letter:text-5xl first-letter:font-serif first-letter:text-accent-gold first-letter:mr-1 first-letter:float-left first-letter:leading-none">
                Timeless Organics represents 25 years of precision casting expertise, refined through 
                mastery of the most exacting metalwork discipline: dental technology. For 15 years in 
                London's prestigious West End, I crafted microscopic prosthetics for the top echelon of 
                medicine and dentistry — work where a fraction of a millimeter determines success or failure.
              </p>

              <p>
                I owned my own laboratory for three years, serving an elite clientele who demanded perfection. 
                That precision — the ability to capture and reproduce organic forms with absolute accuracy — 
                became the foundation for bronze sculpture. I spent years making botanical castings for an 
                established artist, learning the ancient lost-wax process while perfecting modern techniques.
              </p>

              <p>
                Now, I'm building something of my own: a foundry dedicated to preserving South Africa's 
                extraordinary Cape Fynbos kingdom in permanent bronze. Proteas. Ericas. Restios. Succulents. 
                Plants found nowhere else on Earth, evolved over millions of years, now threatened by climate 
                change and development.
              </p>

              <p>
                Every casting is an act of preservation. The organic matter burns away completely in the 
                investment process, leaving only its perfect impression in bronze. What remains is permanent — 
                every vein, every texture, every curve held forever in metal that will outlive us all.
              </p>

              <p className="text-foreground/90 font-medium">
                But this isn't about hiding knowledge — it's about sharing it. My passion has always been 
                teaching. While others guard their techniques, I believe in empowering people with these skills. 
                The Founding 100 workshops will give you hands-on access to 25 years of expertise. This is 
                craft as conservation, art as archive, and knowledge as a gift passed forward.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                The <span className="text-accent-gold">Lost-Wax Process</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-6"></div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-patina/20 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-patina" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">1. Investment</h4>
                    <p className="text-muted-foreground">
                      The botanical specimen is encased in heat-resistant plaster investment. Every detail 
                      of the plant — cell structure, surface texture, natural imperfections — is captured 
                      in the mold.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">2. Burnout</h4>
                    <p className="text-muted-foreground">
                      The mold is heated to 700°C over 12+ hours. The organic matter burns away completely, 
                      leaving only empty space where the plant once was — a perfect negative of its form.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-6 h-6 text-bronze" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">3. Pour</h4>
                    <p className="text-muted-foreground">
                      Molten bronze at 1100°C is poured into the cavity. Metal flows into every microscopic 
                      channel left by the burned-out plant. Cooling takes hours.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-card-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-patina/20 flex items-center justify-center flex-shrink-0">
                    <Hammer className="w-6 h-6 text-patina" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold mb-2">4. Finishing</h4>
                    <p className="text-muted-foreground">
                      Investment is broken away. Chasing removes casting artifacts. Sanding refines surfaces. 
                      Patina chemistry brings out color — natural bronze, verdigris green, or heat-induced golds and browns.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section>
            <Card className="p-10 bg-card/50 border-card-border">
              <div className="text-center mb-6">
                <h3 className="font-serif text-3xl font-bold mb-3">David Junor</h3>
                <p className="text-accent-gold">Sculptor & Founder</p>
              </div>
              <div className="prose prose-invert max-w-none text-muted-foreground">
                <p>
                  25 years of precision metalwork. 15 years as a dental technologist in London's West End, 
                  serving the top tier of medical professionals. 3 years running my own laboratory. Years more 
                  creating bronze botanical sculptures, mastering the lost-wax process through hands-on practice.
                </p>
                <p>
                  Now I'm building Timeless Organics in Kommetjie — a foundry and workshop space dedicated to 
                  preserving South Africa's botanical heritage in permanent bronze, and sharing this rare craft 
                  with others who want to learn.
                </p>
                <p className="mb-0">
                  This work is personal. It's about holding onto beauty in uncertain times. It's about craft 
                  that matters, art that endures, knowledge freely shared, and a deep love for the wild, strange 
                  plants that make this place unlike anywhere else on Earth.
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
