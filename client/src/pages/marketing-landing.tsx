import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";
import { Flame, Hammer, Users, Award, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Seat {
  id: number;
  type: string;
  price: number;
  totalSeats: number;
  seatsSold: number;
}

export default function MarketingLanding() {
  const [, setLocation] = useLocation();

  const { data: seats } = useQuery<Seat[]>({
    queryKey: ["/api/seats/availability"],
  });

  const founderSeats = seats?.find(s => s.type === "Founder");
  const patronSeats = seats?.find(s => s.type === "Patron");
  const totalRemaining = (founderSeats ? founderSeats.totalSeats - founderSeats.seatsSold : 0) + 
                        (patronSeats ? patronSeats.totalSeats - patronSeats.seatsSold : 0);

  return (
    <>
      <div className="bg-aloe" />
      <SmokeFireBackground />
      
      {/* Fixed Header with Logo and Seat Counter */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-card/10 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              David Junor
            </h1>
            <p className="text-sm text-accent-gold">Timeless Organics</p>
          </div>
          
          {seats && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <div className="text-muted-foreground">Seats Remaining</div>
                <div className="text-2xl font-bold font-serif text-accent-gold">
                  {totalRemaining} / 100
                </div>
              </div>
              <div className="h-10 w-px bg-card-border"></div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Founders</div>
                <div className="text-lg font-semibold text-bronze">
                  {founderSeats ? founderSeats.totalSeats - founderSeats.seatsSold : 0} left
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Patrons</div>
                <div className="text-lg font-semibold text-patina">
                  {patronSeats ? patronSeats.totalSeats - patronSeats.seatsSold : 0} left
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Hero Section - Full Screen */}
      <section className="relative z-50 min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="kicker mb-6 text-lg" data-testid="text-kicker">
            FOUNDING 100 INVESTOR LAUNCH
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="moving-fill">Where Ancient Craft</span><br />
            Meets Modern Investment
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Your investment funds our foundry's final fit-out. In return, we <span className="text-accent-gold font-semibold">invest</span> (encase) 
            your chosen botanical specimen now — guaranteeing you a flawless bronze casting, 
            lifetime workshop discounts, and exclusive access to the ancient art of lost-wax casting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => setLocation("/founding100")}
              size="lg"
              className="btn-bronze text-lg px-8 py-6"
              data-testid="button-explore"
            >
              <span className="moving-fill flex items-center gap-2">
                Explore the Founding 100
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <Button
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ 
                  behavior: "smooth" 
                });
              }}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 backdrop-blur-md bg-card/30 border-card-border hover:bg-card/50"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-lg p-8">
              <div className="text-4xl font-bold font-serif text-accent-gold mb-2">100</div>
              <div className="text-sm text-muted-foreground">Limited Seats</div>
            </div>
            <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-lg p-8">
              <div className="text-4xl font-bold font-serif text-bronze mb-2">1</div>
              <div className="text-sm text-muted-foreground">Bronze Casting</div>
            </div>
            <div className="bg-card/40 backdrop-blur-md border border-card-border rounded-lg p-8">
              <div className="text-4xl font-bold font-serif text-patina mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Lifetime Benefits</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="how-it-works" 
        className="relative z-50 min-h-screen flex items-center py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
              How the <span className="moving-fill">Founding 100</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your investment becomes infrastructure. Infrastructure becomes art. 
              Art becomes yours to keep, forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Step 1 */}
            <Card className="bg-card/80 backdrop-blur-md border-card-border p-8 hover-elevate active-elevate-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl font-bold font-serif text-accent-gold/20">1</div>
                <Users className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Choose Your Seat</h3>
              <p className="text-muted-foreground">
                Select between Founder (R3,000) or Patron (R5,000) passes. Only 100 seats exist: 50 Founders, 50 Patrons.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="bg-card/80 backdrop-blur-md border-card-border p-8 hover-elevate active-elevate-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl font-bold font-serif text-bronze/20">2</div>
                <Hammer className="w-10 h-10 text-bronze" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Invest in the Foundry</h3>
              <p className="text-muted-foreground">
                Your capital funds equipment, tooling, and our Kommetjie studio's final fit-out. We invest your chosen piece immediately.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="bg-card/80 backdrop-blur-md border-card-border p-8 hover-elevate active-elevate-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl font-bold font-serif text-patina/20">3</div>
                <Sparkles className="w-10 h-10 text-patina" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Select Your Cutting</h3>
              <p className="text-muted-foreground">
                Choose from our studio-approved botanical cuttings (same style you choose). Specimens will differ — these are one-of-a-kind pieces. You get a guaranteed bronze casting.
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="bg-card/80 backdrop-blur-md border-card-border p-8 hover-elevate active-elevate-2">
              <div className="flex items-center justify-between mb-4">
                <div className="text-6xl font-bold font-serif text-accent-gold/20">4</div>
                <Award className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Receive Forever</h3>
              <p className="text-muted-foreground">
                Your bronze casting will be sandblasted or glass bead-blasted and couriered to you, along with a once-off discount voucher for your first real workshop, plus lifetime workshop codes and founding member certificate.
              </p>
            </Card>
          </div>

          {/* Investment Explanation Callout */}
          <div className="max-w-4xl mx-auto mt-16">
            <Card className="bg-gradient-to-br from-accent-gold/10 via-bronze/5 to-patina/10 backdrop-blur-md border-accent-gold/30 p-10">
              <div className="text-center mb-6">
                <h3 className="font-serif text-3xl font-bold text-foreground mb-3">
                  What Does "<span className="text-accent-gold">Investment</span>" Mean?
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-bronze to-accent-gold mx-auto"></div>
              </div>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="text-lg text-center">
                  The word "<span className="text-accent-gold font-semibold">investment</span>" carries a double meaning in our program — one financial, one technical.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-card/30 border border-card-border rounded-lg p-8">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="text-accent-gold">💰</span> Your Financial Investment
                    </h4>
                    <p className="text-sm">
                      You invest capital (R3,000 or R5,000) to fund our foundry's final fit-out — equipment, tooling, 
                      and infrastructure that makes Timeless Organics possible.
                    </p>
                  </div>
                  
                  <div className="bg-card/30 border border-card-border rounded-lg p-8">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="text-bronze">🔥</span> Our Technical Investment
                    </h4>
                    <p className="text-sm">
                      We <span className="font-semibold text-accent-gold">invest</span> your chosen botanical cutting — encasing it in a ceramic shell 
                      (a powder/water mix) using the ancient lost-wax method. This "investment" creates the mold for your bronze.
                    </p>
                  </div>
                </div>

                <p className="text-center text-sm italic pt-4 border-t border-border">
                  Both investments happen simultaneously. You invest in our future. We invest your cutting. 
                  Together, we create something <span className="text-accent-gold font-semibold">timeless</span>.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="relative z-50 min-h-screen flex items-center py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
              What <span className="moving-fill">You Receive</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              This isn't crowdfunding. It's co-creation. Your investment unlocks tangible, 
              lasting value that grows with our studio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Founder Benefits */}
            <Card className="bg-gradient-to-br from-bronze/10 to-accent-gold/5 backdrop-blur-md border-bronze/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Flame className="w-8 h-8 text-bronze" />
                <div>
                  <h3 className="font-serif text-3xl font-bold text-foreground">Founders Pass</h3>
                  <p className="text-2xl text-bronze font-semibold">R3,000</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bronze mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">One bronze casting</strong> — Studio-approved cutting, lost-wax cast, sand/glass bead-blasted finish (patina extra)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bronze mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">50% off first workshop</strong> — Transferable, 2-day experience
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bronze mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">20% lifetime workshop code</strong> — Unlimited uses, forever
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bronze mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Founding member certificate</strong> — Digital + PDF delivery
                  </span>
                </li>
              </ul>
            </Card>

            {/* Patron Benefits */}
            <Card className="bg-gradient-to-br from-patina/10 to-accent-gold/5 backdrop-blur-md border-patina/30 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="bg-accent-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Best Value
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <Flame className="w-8 h-8 text-patina" />
                <div>
                  <h3 className="font-serif text-3xl font-bold text-foreground">Patron Gift Card</h3>
                  <p className="text-2xl text-patina font-semibold">R5,000</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-patina mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">One bronze casting</strong> — Studio-approved cutting, lost-wax cast, sand/glass bead-blasted finish (patina extra)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-patina mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">80% off first workshop</strong> — Transferable, 2-day experience
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-patina mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">30% lifetime workshop code</strong> — Unlimited uses, forever
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-patina mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Founding member certificate</strong> — Digital + PDF delivery
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* David Junor - The Founder Section */}
      <section className="relative z-50 min-h-screen flex items-center py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-4">
              <span className="moving-fill">David Junor</span>
            </h2>
            <p className="text-xl text-accent-gold">Founder, Timeless Organics</p>
            <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <Card className="bg-card/60 backdrop-blur-md border-card-border p-8">
              <div className="prose prose-invert prose-lg max-w-none space-y-5">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  My foundation in <span className="text-foreground font-semibold">25 years of technical precision casting</span> began 
                  with 15 years in high-end London dental laboratories, including 3 years owning my own 
                  Harley Street lab. This work—focusing on metallurgy, investment casting techniques, 
                  and assembly—provided the technical mastery required for flawless results.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Returning to Cape Town, I leveraged my specialist technical background, which led me 
                  to connect with a <span className="text-patina font-semibold">globally recognized bronze artist</span>. I became the primary 
                  technical fabricator for their botanical bronze collection. In this role, I successfully 
                  cast hundreds of botanical bronzes that sold internationally, proving my technical skills 
                  at the highest level of the art world.
                </p>

                <p className="text-xl text-foreground/90 font-medium italic leading-relaxed pt-4 border-t border-border">
                  "Those pieces weren't mine to sign; the craft became mine to master."
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Timeless Organics is the necessary next step — where decades of technical precision 
                  meet artistic independence. Where priceless craft meets timeless art.
                </p>
              </div>
            </Card>

            <Card className="bg-card/60 backdrop-blur-md border-card-border p-8">
              <h3 className="font-serif text-2xl font-bold mb-6 text-foreground">Expertise & Process</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-accent-gold mb-2">Technical Foundation</h4>
                  <p className="text-muted-foreground">
                    25 years in high-precision investment casting and assembly, with specialized 
                    training in metallurgy and lost-wax techniques.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-bronze mb-2">Casting Process</h4>
                  <p className="text-muted-foreground">
                    Direct casting from real plant matter, silicon bronze pour, sand/glass 
                    bead-blast finish. Each piece a perfect botanical replica.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-patina mb-2">Studio Location</h4>
                  <p className="text-muted-foreground">
                    Independent studio in Kommetjie, Cape Town. Where the Atlantic meets ancient craft.
                  </p>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ready to connect with the craft?
                  </p>
                  <a 
                    href="mailto:studio@timeless.organic"
                    className="text-accent-gold hover:text-accent-gold/80 font-semibold text-lg"
                  >
                    studio@timeless.organic
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* The Vision Section */}
      <section className="relative z-50 min-h-screen flex items-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
              The <span className="moving-fill">Vision</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-8"></div>
          </div>

          <Card className="bg-card/60 backdrop-blur-md border-card-border p-10">
            <div className="prose prose-invert prose-lg max-w-none space-y-6">
              <p className="text-xl text-foreground/90 font-light leading-relaxed">
                We're building something rare — a studio where <span className="text-accent-gold font-semibold">ancient bronze-casting traditions</span> meet 
                contemporary South African artistry. But completing our foundry requires capital, and we 
                believe that capital should come with <span className="text-accent-gold font-semibold">real, lasting value</span>.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                The Founding 100 isn't crowdfunding — it's co-creation. You invest capital in our final fit-out. 
                We <span className="text-accent-gold font-semibold">invest</span> (encase in ceramic) your chosen botanical specimen <span className="font-semibold">immediately</span>, 
                guaranteeing you a flawless bronze casting plus <span className="text-patina font-semibold">lifetime workshop access</span> at the ancient craft of lost-wax casting.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Only 100 seats exist. 50 for Founders. 50 for Patrons. Once they're gone, this opportunity 
                closes forever. Your investment becomes infrastructure, and infrastructure becomes art — 
                both yours to keep, and ours to build upon.
              </p>

              <p className="text-xl text-foreground/90 font-medium text-center pt-6 border-t border-border">
                This isn't crowdfunding. It's co-creation. <span className="text-accent-gold">Your investment is our investment.</span>
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="moving-fill">Join the Founding 100</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Secure your seat in our founding community. Limited to 100 investors. 
            Once they're gone, they're gone forever.
          </p>
          
          <Button
            onClick={() => setLocation("/founding100")}
            size="lg"
            className="btn-bronze text-xl px-12 py-7"
            data-testid="button-get-started"
          >
            <span className="moving-fill flex items-center gap-3">
              Secure Your Seat Now
              <ArrowRight className="w-6 h-6" />
            </span>
          </Button>

          <p className="text-sm text-muted-foreground mt-8">
            Questions? Contact us at{" "}
            <a 
              href="mailto:hello@timeless.organic" 
              className="text-accent-gold hover:text-accent-gold/80 underline"
            >
              hello@timeless.organic
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
