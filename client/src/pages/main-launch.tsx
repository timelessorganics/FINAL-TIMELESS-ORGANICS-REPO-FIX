import { useQuery } from "@tanstack/react-query";
import SeatCard from "@/components/seat-card";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
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
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-7 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16 pt-8" data-testid="section-hero">
            <div className="kicker mb-3">FOUNDING 100 INVESTOR LAUNCH</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="moving-fill">Founding 100</span> — Your Investment is Our Investment.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Secure your financial investment in our studio and receive a guaranteed bronze casting 
              of a Studio-Pre-Approved Specimen, where you select and{" "}
              <span className="text-accent-gold font-semibold">where your capital funds our foundry's final fit-out</span>, 
              allowing you to participate in the ancient art of lost-wax casting.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-patina">•</span>
                <span>Studio-approved specimens</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-patina">•</span>
                <span>Guaranteed bronze casting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-patina">•</span>
                <span>Workshop discounts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-patina">•</span>
                <span>Lifetime benefits</span>
              </div>
            </div>
          </section>

          {/* Why This Exists - The Story Section */}
          <section className="mb-20 py-12" data-testid="section-story">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Why the <span className="moving-fill">Founding 100</span>?
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-bronze via-accent-gold to-patina mx-auto mb-8"></div>
              </div>

              <div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
                <p className="text-xl text-foreground/90 font-light">
                  We're building something rare — a studio where ancient bronze-casting traditions meet 
                  contemporary South African artistry. But completing our foundry requires capital, and we 
                  believe that capital should come with <span className="text-accent-gold font-semibold">real, lasting value</span>.
                </p>

                <p>
                  The Founding 100 program isn't just a fundraising campaign. It's an invitation to become 
                  part of our origin story — to fund the final fit-out of our Kommetjie foundry while securing 
                  your own piece of bronze art and lifetime access to the ancient craft of lost-wax casting.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10 not-prose">
                  <div className="bg-card/50 border border-card-border rounded-lg p-6">
                    <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Your Investment Funds</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-patina mt-1">•</span>
                        <span>Foundry equipment & tooling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-patina mt-1">•</span>
                        <span>Studio infrastructure completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-patina mt-1">•</span>
                        <span>Materials for your guaranteed casting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-patina mt-1">•</span>
                        <span>Workshop program development</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-card/50 border border-card-border rounded-lg p-6">
                    <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">You Receive Forever</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-bronze mt-1">•</span>
                        <span>One bronze sculpture (studio-approved specimen)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-bronze mt-1">•</span>
                        <span>Lifetime workshop discount codes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-bronze mt-1">•</span>
                        <span>Founding member status & certificate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-bronze mt-1">•</span>
                        <span>Access to ancient lost-wax casting</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p>
                  Only 100 seats exist. 50 for Founders. 50 for Patrons. Once they're gone, this opportunity 
                  closes forever. Your investment becomes infrastructure, and infrastructure becomes art — 
                  both yours to keep, and ours to build upon.
                </p>

                <p className="text-foreground/90 font-medium text-center text-xl pt-6 border-t border-border mt-8">
                  This isn't crowdfunding. It's co-creation. <span className="text-accent-gold">Your investment is our investment.</span>
                </p>
              </div>
            </div>
          </section>

          {/* Seat Selection Section */}
          <section className="mb-16" data-testid="section-seats">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                <span className="text-accent-gold">FOUNDING 100:</span> LIMITED SEATS!
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
                    subtitle="R3,000"
                    description="One bronze casting included of a Studio-Guaranteed Cutting"
                    benefits={[
                      "50% off your first 2-day workshop (Transferable, one-time use)",
                      "20% lifetime workshop discount code (Unlimited uses, forever)",
                      "Both codes work for workshops only, not for seat purchases",
                    ]}
                  />
                )}
                {patronSeat && (
                  <SeatCard
                    seat={patronSeat}
                    title="Patron Gift Card"
                    subtitle="R5,000"
                    description="One bronze casting included of a Studio-Guaranteed Cutting"
                    benefits={[
                      "80% off your first 2-day workshop (Transferable, one-time use)",
                      "30% lifetime workshop discount code (Unlimited uses, forever)",
                      "Both codes work for workshops only, not for seat purchases",
                    ]}
                    featured
                  />
                )}
              </div>
            )}
          </section>

          {/* Workshop Explanation Section */}
          <section className="mb-16 py-12 border-t border-border" data-testid="section-workshop">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                  The <span className="text-accent-gold">Workshop Experience</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Experience the ancient art of lost-wax bronze casting in our intensive 2-day workshops. 
                  Work hands-on in our Kommetjie studio to create your own bronze sculpture from start to finish.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="text-center p-6 bg-card border border-card-border rounded-lg">
                  <div className="text-accent-gold text-5xl font-bold font-serif mb-3">2</div>
                  <div className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Days</div>
                  <div className="text-xs text-muted-foreground">Intensive hands-on work</div>
                </div>
                <div className="text-center p-6 bg-card border border-card-border rounded-lg">
                  <div className="text-bronze text-5xl font-bold font-serif mb-3">1</div>
                  <div className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Bronze Piece</div>
                  <div className="text-xs text-muted-foreground">Your completed sculpture</div>
                </div>
                <div className="text-center p-6 bg-card border border-card-border rounded-lg">
                  <div className="text-patina text-5xl font-bold font-serif mb-3">∞</div>
                  <div className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">Lifetime Skill</div>
                  <div className="text-xs text-muted-foreground">Ancient craft knowledge</div>
                </div>
              </div>

              <div className="bg-card/50 border border-card-border rounded-lg p-6">
                <h3 className="font-serif text-xl font-bold mb-4 text-foreground">What You'll Learn</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-bronze">→</span>
                    <span>Specimen selection and preparation techniques</span>
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-bronze">→</span>
                    <span>Investment casting process using traditional lost-wax method</span>
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-bronze">→</span>
                    <span>Bronze pouring, finishing, and patina application</span>
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-bronze">→</span>
                    <span>Studio safety and foundry best practices</span>
                  </li>
                </ul>
              </div>

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

          {/* Workshops Section */}
          <section>
            <div className="text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                <span className="moving-fill">Workshops</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Learn the art of lost-wax casting in our immersive 2-day workshops. 
                Founding members receive exclusive discounts.
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-bronze"
                data-testid="button-workshops"
              >
                <span className="moving-fill">Explore Workshops</span>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
