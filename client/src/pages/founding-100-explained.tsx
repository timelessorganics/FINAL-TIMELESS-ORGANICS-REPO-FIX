import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Award, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Founding100ExplainedPage() {
  return (
    <>
      <Header />
      <main className="relative z-50 bg-background">
        {/* Hero Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-card/30 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight moving-fill">
              The Founding 100
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 font-light max-w-3xl mx-auto leading-relaxed">
              One hundred investors. One extraordinary chapter. Bronze sculptures cast from Cape Fynbos botanicals — preserved in fire, immortalized forever.
            </p>
          </div>
        </section>

        {/* The Two-Tier Investment */}
        <section className="py-24 px-6 bg-card/10 border-y border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6 tracking-tight">
                <span className="text-accent-gold">Two Tiers</span>. One Bronze.
              </h2>
              <p className="text-lg text-foreground/90 font-light">
                Choose what matters to you. Every seat includes a one-of-a-kind bronze casting.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Founder */}
              <div className="p-8 rounded-lg border border-border/50 bg-card/30">
                <div className="text-3xl font-light text-bronze mb-2">Founder</div>
                <div className="text-2xl font-bold text-accent-gold mb-4">R3,000 (Fire Sale)</div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-4">Your Bronze Casting</h3>
                <p className="text-foreground/80 font-light mb-6">
                  Raw bronze casting, studio-guaranteed. Pure craftsmanship. Customize later — patina finish, mounting, base — all available through our shop with your lifetime discount.
                </p>
                <div className="space-y-3 text-sm text-foreground/80 font-light">
                  <div className="flex items-start gap-2">
                    <span className="text-bronze font-bold mt-1">+</span>
                    <span><span className="text-foreground font-medium">50% off</span> your first workshop</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-bronze font-bold mt-1">+</span>
                    <span><span className="text-foreground font-medium">20% lifetime discount</span> — shop, commissions, workshops</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-bronze font-bold mt-1">+</span>
                    <span><span className="text-foreground font-medium">Engraved forever</span> on our Founders & Patrons wall</span>
                  </div>
                </div>
              </div>

              {/* Patron */}
              <div className="p-8 rounded-lg border border-accent-gold/50 bg-gradient-to-br from-accent-gold/10 to-transparent">
                <div className="text-3xl font-light text-accent-gold mb-2">Patron</div>
                <div className="text-2xl font-bold text-bronze mb-4">R4,500 (Fire Sale)</div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-4">Bronze + Finish Included</h3>
                <p className="text-foreground/80 font-light mb-6">
                  Everything a Founder gets, plus your choice of patina finish (antique, verdigris, custom) and professional mounting — ready to display, instantly.
                </p>
                <div className="space-y-3 text-sm text-foreground/80 font-light">
                  <div className="flex items-start gap-2">
                    <span className="text-accent-gold font-bold mt-1">+</span>
                    <span><span className="text-foreground font-medium">80% off</span> your first workshop</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-gold font-bold mt-1">+</span>
                    <span><span className="text-foreground font-medium">30% lifetime discount</span> — shop, commissions, workshops</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-accent-gold font-bold mt-1">+</span>
                    <span><span className="text-foreground font-medium">Patina + Mounting included</span> — ready to hang</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-12 text-center tracking-tight">
              Why Only 100?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-border/50 bg-card/30">
                <Award className="w-8 h-8 text-bronze mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-3">Exclusivity with Purpose</h3>
                <p className="text-sm text-foreground/80 font-light">
                  Limited seats mean each piece receives personal attention. 100 sculptures. Not 1,000. Not "infinite". Just 100.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/30">
                <Flame className="w-8 h-8 text-accent-gold mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-3">Botanical Authenticity</h3>
                <p className="text-sm text-foreground/80 font-light">
                  Cape Fynbos specimens are irreplaceable. They fade, they're lost forever. In bronze, they're immortalized.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/30">
                <Sparkles className="w-8 h-8 text-patina mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-3">Founding Member Status</h3>
                <p className="text-sm text-foreground/80 font-light">
                  After these 100, this chapter closes. You're either in the Founding 100, or you're not. No second chances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The True Value */}
        <section className="py-24 px-6 bg-card/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-12 text-center tracking-tight">
              The Real Numbers
            </h2>

            <div className="space-y-4">
              <div className="p-6 rounded-lg border border-border/50 bg-card/50 flex items-start gap-4">
                <div className="font-bold text-accent-gold text-2xl flex-shrink-0 min-w-24">R25K+</div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Bronze Sculpture Market Value</h3>
                  <p className="text-sm text-foreground/80 font-light">
                    A mounted, patinated bronze casting from a real botanical cutting. That's what a finished piece is worth in today's market.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/50 flex items-start gap-4">
                <div className="font-bold text-bronze text-2xl flex-shrink-0 min-w-24">20-30%</div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Lifetime Discount on Everything</h3>
                  <p className="text-sm text-foreground/80 font-light">
                    Applied to shop products, future commissions, and all workshops — forever. Giftable. Transferable on some benefits.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/50 flex items-start gap-4">
                <div className="font-bold text-patina text-2xl flex-shrink-0 min-w-24">LIFE</div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Your Casting Doesn't Expire</h3>
                  <p className="text-sm text-foreground/80 font-light">
                    You're not locked into a timeline. Customize your piece whenever you want — this year, next decade, whenever.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-card/20 to-background border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-accent-gold/20 rounded-full text-accent-gold text-sm font-bold mb-4">
              24-HOUR FIRE SALE
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6 tracking-tight">
              Once They're Gone, They're Gone
            </h2>
            <p className="text-lg md:text-xl text-foreground/90 font-light max-w-3xl mx-auto leading-relaxed mb-8">
              100 seats. No waiting list. No phase two with different terms. This is the Founding 100. When these sell out, this exclusive opportunity closes forever.
            </p>

            <Link href="/#seats">
              <Button size="lg" className="btn-bronze text-base px-8 py-6 min-h-14 gap-2">
                Choose Your Seat
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
