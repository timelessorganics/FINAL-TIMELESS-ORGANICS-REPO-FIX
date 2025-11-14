import { useQuery } from "@tanstack/react-query";
import SeatCard from "@/components/seat-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";
import { ArrowRight } from "lucide-react";
import type { Seat } from "@shared/schema";

export default function MainLaunch() {
  const { data: seats, isLoading } = useQuery<Seat[]>({
    queryKey: ["/api/seats/availability"],
  });

  const founderSeat = seats?.find((s) => s.type === "founder");
  const patronSeat = seats?.find((s) => s.type === "patron");

  return (
    <>
      <div className="bg-aloe" />
      <SmokeFireBackground />
      <Header />
      <div className="relative z-50 min-h-screen" id="top">
        <div className="max-w-[1100px] mx-auto px-7 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16 pt-8" data-testid="section-hero">
            <div className="kicker mb-3">FOUNDING 100 INVESTOR LAUNCH</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Where <span className="moving-fill">Ancient Craft</span><br />
              Meets Modern Investment
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Your investment funds our foundry's final fit-out. In return, we invest (immortalize) your chosen botanical specimen now — 
              guaranteeing you a flawless bronze casting, lifetime workshop discounts, and exclusive access to the ancient art of lost-wax casting.
            </p>

            {/* Three Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="bg-background/30 backdrop-blur-sm border-bronze/50 hover:border-bronze"
                data-testid="button-view-specimens"
              >
                <a href="/sculptures">
                  View Botanical Specimens
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="bg-background/30 backdrop-blur-sm border-bronze/50 hover:border-bronze"
                data-testid="button-seasonal-guide"
              >
                <a href="/seasonal-guide">
                  Seasonal Guide
                </a>
              </Button>
              
              <Button 
                size="lg"
                asChild
                className="btn-bronze"
                data-testid="button-explore-founding"
              >
                <a href="#seats">
                  Explore Founding 100
                </a>
              </Button>
            </div>

            {/* Three Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-bronze mb-2">100</div>
                <div className="text-muted-foreground">Limited Seats</div>
              </Card>
              
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-accent-gold mb-2">1</div>
                <div className="text-muted-foreground">Bronze Casting</div>
              </Card>
              
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-patina mb-2">∞</div>
                <div className="text-muted-foreground">Lifetime Benefits</div>
              </Card>
            </div>
          </section>

          {/* How the Founding 100 Works */}
          <section className="mb-20 py-12" data-testid="section-how-it-works">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  How the Founding 100 Works
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your investment becomes infrastructure. Infrastructure becomes art. Art becomes yours to keep, forever.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold font-serif text-bronze flex-shrink-0">1</div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Choose Your Seat</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Select between Founder (R3,000) or Patron (R5,000) passes. Only 100 seats exist: 50 Founders, 50 Patrons.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold font-serif text-bronze flex-shrink-0">2</div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Invest in the Foundry</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Your capital funds equipment, tooling, and our Kommetjie studio's final fit-out. We invest your chosen piece immediately.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold font-serif text-bronze flex-shrink-0">3</div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Select Your Cutting</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Choose from our studio-approved botanical cuttings (same style you choose). Specimens will differ — these are one-of-a-kind pieces. You get a guaranteed bronze casting.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold font-serif text-bronze flex-shrink-0">4</div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Receive Forever</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Your bronze casting will be sandblasted or glass bead-blasted and couriered to you, along with a once-off discount voucher for your first real workshop, plus lifetime workshop codes and founding member certificate.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* What Does "Investment" Mean? */}
          <section className="mb-20 py-12 bg-card/20" data-testid="section-investment-meaning">
            <div className="max-w-4xl mx-auto px-7">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  What Does <span className="text-accent-gold">"Investment"</span> Mean?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The word "investment" carries a double meaning in our program — one financial, one technical.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Your Financial Investment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You invest capital (R3,000 or R5,000) to fund our foundry's final fit-out — equipment, tooling, and infrastructure that makes Timeless Organics possible.
                  </p>
                </Card>

                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="text-4xl mb-4">🔥</div>
                  <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Our Technical Investment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We invest your chosen botanical cutting — immortalizing it in an investment material (a powder/water mix) using the ancient lost-wax method. This "investment" creates the mold for your bronze.
                  </p>
                </Card>
              </div>

              <p className="text-center text-lg text-foreground/90 font-medium mt-10 max-w-2xl mx-auto">
                Both investments happen simultaneously. You invest in our future. We invest your cutting. Together, we create something<span className="text-accent-gold font-serif italic"> Timeless</span>
              </p>
            </div>
          </section>

          {/* What You Receive */}
          <section className="mb-20 py-12" data-testid="section-what-you-receive">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  What You Receive
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  This isn't crowdfunding. It's co-creation. Your investment unlocks tangible, lasting value that grows with our studio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Founders Pass */}
                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="mb-6">
                    <h3 className="font-serif text-3xl font-bold mb-2 text-foreground">Founders Pass</h3>
                    <div className="text-4xl font-bold text-bronze mb-4">R3,000</div>
                  </div>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-bronze mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">One bronze casting</strong> — Studio-approved cutting, lost-wax cast, sand/glass bead-blasted finish (patina extra)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-bronze mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">50% off first workshop</strong> — Transferable, 2-day experience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-bronze mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">20% lifetime workshop code</strong> — Unlimited uses, forever</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-bronze mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Founding member certificate</strong> — Digital + PDF delivery</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-gold mt-1 flex-shrink-0">★</span>
                      <span><strong className="text-foreground">Your name on the Wall of Leaves</strong> — Timeless preservation of our gratitude</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="inline-block px-3 py-1 bg-bronze/20 rounded-full text-xs font-medium text-bronze">
                      Best Value
                    </div>
                  </div>
                </Card>

                {/* Patron Gift Card */}
                <Card className="p-8 bg-card/50 border-card-border relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className="inline-block px-3 py-1 bg-accent-gold/20 rounded-full text-xs font-medium text-accent-gold">
                      Premium
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-serif text-3xl font-bold mb-2 text-foreground">Patron Gift Card</h3>
                    <div className="text-4xl font-bold text-accent-gold mb-4">R5,000</div>
                  </div>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="text-accent-gold mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">One bronze casting</strong> — Studio-approved cutting, lost-wax cast, sand/glass bead-blasted finish (patina extra)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-gold mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">80% off first workshop</strong> — Transferable, 2-day experience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-gold mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">30% lifetime workshop code</strong> — Unlimited uses, forever</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-gold mt-1 flex-shrink-0">•</span>
                      <span><strong className="text-foreground">Founding member certificate</strong> — Digital + PDF delivery</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent-gold mt-1 flex-shrink-0">★</span>
                      <span><strong className="text-foreground">Your name on the Wall of Leaves</strong> — Timeless preservation of our gratitude</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </section>

          {/* Seat Selection Section */}
          <section id="seats" className="mb-16" data-testid="section-seats">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                <span className="text-accent-gold">Ready to Join?</span> Secure Your Seat
              </h2>
              <p className="text-muted-foreground text-lg">
                Choose your pass and become part of our founding community
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {founderSeat && (
                  <SeatCard
                    seat={founderSeat}
                    title="Founders Pass"
                    subtitle="R10"
                    description="One bronze casting included of a Studio-Guaranteed Cutting"
                    benefits={[
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "50% off first workshop (Transferable, single-use, never expires)",
                      "20% lifetime discount code (Unlimited uses, transferable & giftable)",
                      "Both codes for workshops only — not redeemable for Founding 100 seats",
                    ]}
                  />
                )}
                {patronSeat && (
                  <SeatCard
                    seat={patronSeat}
                    title="Patron Gift Card"
                    subtitle="R10"
                    description="One bronze casting included of a Studio-Guaranteed Cutting"
                    benefits={[
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "80% off first workshop (Transferable, single-use, never expires)",
                      "30% lifetime discount code (Unlimited uses, transferable & giftable)",
                      "Both codes for workshops only — not redeemable for Founding 100 seats",
                    ]}
                    featured
                  />
                )}
              </div>
            )}

            {/* Invest Now CTA */}
            <div className="flex justify-center mt-12">
              <Button
                asChild
                size="lg"
                className="btn-bronze font-bold px-12 py-6 text-lg"
                data-testid="button-invest-cta"
              >
                <a href="#seats">
                  <span className="moving-fill">Invest Now</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </section>

          {/* Founding 100 Specimen Options */}
          <section className="mb-16">
            <Card className="bg-card border-card-border p-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-center">
                <span className="moving-fill">Founding 100 Specimen Options</span>
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    Choose your Guaranteed Casting
                  </h3>
                  <p>
                    For this Founding 100 purchase, you select <strong className="text-foreground">one studio-guaranteed specimen</strong> from 
                    a limited range in the payment form above. These pieces are pre-vetted for perfect casting (98-99% confidence) and fit 
                    the flask size limits. This is the bronze you will receive at the studio opening.
                  </p>
                </div>
                
                <div className="bg-bronze/10 border border-bronze/30 rounded-md p-6">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-bronze/50 hover:bg-bronze/20"
                    data-testid="button-view-catalog"
                  >
                    <a href="/sculptures" target="_blank" rel="noopener noreferrer">
                      View the Full 20+ Specimen Catalog (Opens New Window)
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Workshop Specimen Rules */}
          <section className="mb-16">
            <Card className="bg-card border-card-border p-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-center">
                <span className="moving-fill">Workshop Specimen Rules</span>
              </h2>
              
              <p className="text-sm text-muted-foreground/80 mb-6 text-center italic">
                Spec limits (single source of truth)
              </p>
              
              <div className="space-y-6 text-muted-foreground">
                <p className="text-foreground/90">
                  These rules apply to the <strong>personal cutting you bring</strong> to your discounted workshop.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background/50 rounded-md p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Maximum Cost</h3>
                    <p className="text-sm">
                      Final cost of the workshop is capped at <strong className="text-accent-gold">R10,000</strong> for the largest, 
                      densest piece permitted.
                    </p>
                  </div>
                  
                  <div className="bg-background/50 rounded-md p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Casting Confidence</h3>
                    <p className="text-sm">
                      Thin, flat leaves are tricky (low confidence). Compact, solid forms (like small succulents) are high 
                      confidence (98%+).
                    </p>
                  </div>
                  
                  <div className="bg-background/50 rounded-md p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Size Limits</h3>
                    <p className="text-sm">
                      Must fit a <strong className="text-foreground">10 cm diameter flask</strong> and <strong className="text-foreground">≤ 15 cm long</strong>
                    </p>
                  </div>
                  
                  <div className="bg-background/50 rounded-md p-5 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Not Allowed</h3>
                    <p className="text-sm">
                      Hardwood/bark, woody cones or fruit, thick cacti, dense stems.
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-6 space-y-3">
                  <h3 className="font-serif text-xl font-semibold text-foreground">Logistics</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-bronze mt-1">•</span>
                      <span>We can courier finished bronzes worldwide; SA from R100.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-bronze mt-1">•</span>
                      <span><strong className="text-foreground">Rescheduling:</strong> 7-day notice to move your seat.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Workshop Explanation Section */}
          <section className="mb-16 py-12 border-t border-border" data-testid="section-workshop">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  The Upcoming <span className="text-accent-gold">Workshop Experience</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  The 2-Day Botanical Bronze Casting Workshop offers a unique window into the process of investment casting. 
                  This is where you create your personal specimen piece.
                </p>
                <p className="text-sm text-muted-foreground/80 italic">
                  *The actual value lies in the personal authorship — you melt the bronze and cast a piece of art that, 
                  if sold by an expert, starts at <strong className="text-accent-gold">R25,000 value</strong>. You keep the story and the unique piece.
                </p>
              </div>

              {/* Workshop Cost Card */}
              <Card className="bg-bronze/5 border-bronze/30 p-6 mb-8">
                <h3 className="font-serif text-xl font-bold mb-3 text-foreground">Workshop Pricing</h3>
                <p className="text-muted-foreground text-sm">
                  The workshop cost is <strong className="text-foreground">variable</strong>, calculated based on your specimen choice 
                  (complexity/size), with prices ranging from the base workshop cost up to a maximum of <strong className="text-accent-gold">R10,000</strong>.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  <strong className="text-foreground">Vouchers will deduct the relevant percentage off the final price</strong> upon booking, 
                  including Patina add-ons.
                </p>
              </Card>

              {/* Schedule */}
              <div className="mb-8">
                <h3 className="font-serif text-2xl font-bold mb-4 text-center text-foreground">
                  Proposed Schedule <span className="text-sm text-muted-foreground font-normal">(not yet finalized - Kommetjie Studio)</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-card border-card-border p-5">
                    <h4 className="font-semibold text-foreground mb-2">Workshop 1</h4>
                    <p className="text-sm text-muted-foreground">Mon (11am-2pm) & Tue (12:00–16:00)</p>
                  </Card>
                  <Card className="bg-card border-card-border p-5">
                    <h4 className="font-semibold text-foreground mb-2">Workshop 2</h4>
                    <p className="text-sm text-muted-foreground">Thu (11am-2pm) & Fri (12:00–16:00)</p>
                  </Card>
                </div>

                {/* Day-by-Day Breakdown */}
                <div className="space-y-4">
                  <Card className="bg-card border-card-border p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-accent-gold text-3xl font-bold font-serif">1</div>
                      <div className="flex-1">
                        <h4 className="font-serif text-lg font-bold text-foreground mb-2">Day 1 (11am-2pm)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Intake, spruing techniques/science, invest your cutting (hands-on experience), overview of the upcoming casting process. 
                          <strong className="text-foreground"> Burn-out runs overnight only.</strong>
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-bronze">•</span>
                            <span>Specimen selection and preparation</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-bronze">•</span>
                            <span>Investment casting setup</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-bronze">•</span>
                            <span>Mould construction techniques</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-card border-card-border p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-bronze text-3xl font-bold font-serif">2</div>
                      <div className="flex-1">
                        <h4 className="font-serif text-lg font-bold text-foreground mb-2">Day 2 (12pm-4pm)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Bronze pour & reveal (hands-on experience), sand/bead-blast, light finishing, and care tips.
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-2">
                            <span className="text-bronze">•</span>
                            <span>Hands-on bronze pouring experience</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-bronze">•</span>
                            <span>Sand/Bead-blasting and finishing techniques</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-bronze">•</span>
                            <span>Leave with your finished bronze (≤10 cm Ø × ≤15 cm)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Optional Add-Ons */}
              <Card className="bg-patina/10 border-patina/30 p-6 mb-8">
                <h3 className="font-serif text-xl font-bold mb-3 text-foreground">Optional Add-Ons</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-patina">•</span>
                    <span><strong className="text-foreground">Patina service:</strong> R1,000 - R3,000 (available for purchase on-site)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-patina">•</span>
                    <span><strong className="text-foreground">Mounting options:</strong> Available on-site</span>
                  </li>
                </ul>
              </Card>

              {/* What to Bring/Wear */}
              <Card className="bg-card border-card-border p-6">
                <h3 className="font-serif text-xl font-bold mb-4 text-foreground">What to Bring / Wear</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Specimen</h4>
                    <p className="text-sm text-muted-foreground">
                      Fresh specimen within size limits; or choose <strong className="text-foreground">"studio cutting"</strong> and 
                      we'll select on-site.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Clothing & Safety</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-bronze">•</span>
                        <span>Closed shoes (robust)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-bronze">•</span>
                        <span>Long pants</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-bronze">•</span>
                        <span>Cotton top</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-patina">✓</span>
                        <span><strong className="text-foreground">PPE provided</strong> on-site</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <p className="text-sm text-muted-foreground text-center mt-8 italic">
                <span className="text-accent-gold font-semibold">Important:</span> Your workshop voucher codes and lifetime discount codes 
                apply exclusively to workshops—they cannot be used to purchase Founding 100 seats.
              </p>
            </div>
          </section>

          {/* About Expertise Section */}
          <section className="mb-16">
            <div className="bg-card border border-card-border rounded-lg p-7 md:p-10">
              <h2 className="font-serif text-3xl font-bold mb-6 text-center">
                About <span className="text-bronze">Our Expertise</span>
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We specialize in the ancient art of <span className="text-patina font-semibold">lost-wax bronze casting</span>, 
                  preserving organic specimens in timeless metal. Your investment directly funds the final fit-out of our foundry, 
                  allowing you exclusive access to this centuries-old craft.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Each founding member receives a <span className="text-accent-gold font-semibold">studio-approved specimen</span> cast 
                  in bronze, along with exclusive workshop discounts and lifetime referral benefits. You're not just investing in art—you're 
                  investing in a legacy.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16" data-testid="section-faq">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-accent-gold">Questions</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to know about the Founding 100 program
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {/* FAQ Items */}
              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">One bronze of a Studio-Guaranteed Specimen — included</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  This initial purchase guarantees you a perfectly cast bronze piece from our pre-vetted flora range. It will be the size of a typical casting (starting R20,000 value).
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">The true value is the unique authorship</strong> — you are guaranteed a flawless cast created by an expert founder and backed by over two decades of fabrication and casting experience.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">How do the workshop voucher codes work?</h3>
                <div className="space-y-3 text-muted-foreground text-sm">
                  <div>
                    <strong className="text-foreground">First Workshop Voucher (Single-Use):</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Founders get 50% off their first 2-day workshop</li>
                      <li>Patrons get 80% off their first 2-day workshop</li>
                      <li>Transferable & giftable, never expires</li>
                      <li>Not redeemable for Founding 100 seats</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-foreground">Lifetime Workshop Discount (Unlimited Use):</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Founders get 20% off all future workshops (forever)</li>
                      <li>Patrons get 30% off all future workshops (forever)</li>
                      <li>Transferable & giftable for life</li>
                      <li>Applies when workshops launch</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-card-border p-6 bg-gradient-to-br from-bronze/10 to-accent-gold/10 border-bronze/40">
                <h3 className="font-semibold text-foreground mb-2">
                  <span className="text-accent-gold">★</span> Will my name really be on the Founders & Patrons Leaf Wall?
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  <strong className="text-foreground">Yes — permanently engraved!</strong> Every Founding 100 member becomes part of Timeless Organics history.
                </p>
                <p className="text-muted-foreground text-sm">
                  Your name (or the name you designate) will be engraved on our bronze Founders & Patrons Leaf Wall, 
                  displayed at the studio entrance. This is your permanent recognition as an infrastructure investor who 
                  made the foundry possible. <strong className="text-foreground">Priceless!</strong>
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Is there an age restriction?</h3>
                <p className="text-muted-foreground text-sm">
                  Purchases are 18+ only. Ages 16–17 may assist with non-hazardous prep (cleaning, spruing, investing under supervision, basic finishing). No pouring/molten metal for under-18s. Under 16 may observe only.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Do 16–17 year olds need a guardian present?</h3>
                <p className="text-muted-foreground text-sm">
                  Guardian Consent & Indemnity is required. Guardian must be contactable during the session.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">What should I wear?</h3>
                <p className="text-muted-foreground text-sm">
                  Closed robust shoes, long pants, natural-fibre tops. Tie back hair; avoid loose sleeves/jewellery. Studio PPE will be supplied on site.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Is alcohol allowed?</h3>
                <p className="text-muted-foreground text-sm">
                  No alcohol or substances before or during the session—safety first. After we're done, you're welcome to relax in the safe zone. We welcome post-session feedback. If you plan to drink, please arrange safe transport.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">What can I bring to cast?</h3>
                <p className="text-muted-foreground text-sm">
                  Organic specimens only (no shells/pressurised items/batteries/resin). We may refuse unsafe/unsuitable items. You can choose from our range of studio specimens on site or bring your own and decide when you arrive. Availability is seasonal—not all plants/flowers are year-round, and every season makes beautiful work.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Who does the pour?</h3>
                <p className="text-muted-foreground text-sm">
                  Our team handles all molten-metal operations. Guests may assist with approved non-hazardous prep only (16–17 with consent).
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">How long is the experience?</h3>
                <p className="text-muted-foreground text-sm">
                  Expect 1.5–2.5 hours depending on the piece and group size.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">When do I get my finished piece?</h3>
                <p className="text-muted-foreground text-sm">
                  Standard finishing and patina take approximately 5 business days. We'll notify you for collection or arrange shipping.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Do you ship? International?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes—South Africa and international. Shipping quoted at checkout or after weighing. Customs/VAT at destination are the recipient's responsibility.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Can you publish my feedback?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes—opt in on the form. With consent we may quote your name + country; otherwise we'll publish anonymously. POPIA-compliant; consent can be withdrawn.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Contact?</h3>
                <p className="text-muted-foreground text-sm">
                  studio@timeless.organic. For any urgent issues, the confirmation email includes a mobile number.
                </p>
              </Card>
            </div>
          </section>

          {/* Coming Soon Section */}
          <section>
            <div className="text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                <span className="moving-fill">What's Next?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                After you invest in a founding seat, you'll select your botanical cutting from our curated gallery, 
                then receive your workshop discount codes for future 2-day casting sessions.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Workshop scheduling opens after the Founding 100 launch completes.
              </p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
