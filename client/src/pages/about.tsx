import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Flame, Hammer, Leaf, ArrowRight, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-16">
          
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="gap-2" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
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
            <div className="space-y-10 text-muted-foreground leading-relaxed">
              
              <div className="text-center">
                <p className="text-accent-gold text-lg font-medium italic">Built From Zero. Built To Last.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-foreground">Why This Foundry Exists</h3>
                <p className="text-lg">
                  Two parents, two jobs lost overnight. After nearly a decade creating world-class botanical bronzes 
                  for someone else—and 25 years mastering precision casting—our family was suddenly left with zero. 
                  No contract. No safety net. No Plan B.
                </p>
                <p>
                  Quitting wasn't an option. We kept building, brick by brick, on stubborn faith and ridiculous hard work. 
                  Today, the studio is 90% finished. We did the heavy lifting alone, but the final 10% happens with the 
                  people who believe in what we're doing. This is not crowdfunding; it is co-creation. If you know our 
                  story, you know exactly why this matters.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-foreground">What We Are Building</h3>
                <p>
                  Timeless Organics is a focused foundry in Kommetjie dedicated to preserving South Africa's Cape Fynbos 
                  in bronze. We take forms that are fleeting in nature—Proteas, Ericas, Restios, and succulents—and cast 
                  them so they can outlast us all.
                </p>
                <p>
                  Every piece begins with a real specimen. Through the investment and burnout process, the plant is 
                  sacrificed; only its perfect negative remains. We pour bronze into that space to capture the exact 
                  geometry of growth, keeping every vein and cell-level texture forever.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-foreground">Why You Can Trust The Craft</h3>
                <p>We are applying clinical discipline to art. This foundry is built on:</p>
                <ul className="space-y-3 list-none pl-0">
                  <li className="flex items-start gap-3">
                    <span className="text-accent-gold font-bold">25 Years of Precision Casting:</span>
                    <span>Deep technical experience in high-tolerance metalwork.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-gold font-bold">15 Years in London's West End:</span>
                    <span>A background in elite dental labs where a fraction of a millimeter determines success or failure.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent-gold font-bold">Complex Botanical Expertise:</span>
                    <span>Years spent solving the hardest problems in sculpture to achieve faithful organic reproduction.</span>
                  </li>
                </ul>
                <p>
                  We built labs, ran teams, and delivered for demanding clients. Now, that same precision is redirected 
                  toward art that matters.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-foreground">What We Believe</h3>
                <p>
                  We believe in open-handed craft. We don't hoard knowledge or gatekeep; we teach. We believe in art as 
                  an archive, ensuring each casting preserves a living form. Most importantly, we believe in community. 
                  The "Founding 100" isn't a gimmick; it is how we finish the foundry and keep prices sane for future 
                  workshops and commissions.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold text-foreground">Who Is Behind It</h3>
                <p>
                  <span className="text-foreground font-medium">David Junor — Sculptor & Founder.</span> I am a precision 
                  caster by training and a teacher by instinct. I am building this foundry with my wife and our community 
                  because the work matters. We stand for honest craft, durable beauty, and a deep respect for the wild 
                  plants that make this place unlike anywhere else on Earth.
                </p>
              </div>

              <div className="space-y-4 border-t border-accent-gold/30 pt-8">
                <h3 className="font-serif text-2xl font-bold text-accent-gold">An Invitation</h3>
                <p className="text-foreground/90 italic">
                  If you have ever been forced to start again, you understand this feeling: don't quit.
                </p>
                <p className="text-foreground/90 font-medium">
                  If you believe in what we are making, join the Founding 100 or book a workshop. Help us finish the 
                  last 10%—and take home a piece of South African botany that will outlive us both.
                </p>
              </div>

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
