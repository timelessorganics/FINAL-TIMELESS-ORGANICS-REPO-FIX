import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Users, Award, Clock, Shield, Sparkles } from "lucide-react";

export default function Founding100ExplainedPage() {
  return (
    <>
      <Header />
      <main className="relative z-50 bg-background">
        {/* Hero Section */}
        <section className="py-24 px-6 bg-gradient-to-b from-card/30 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-tight">
              The Founding 100
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 font-light max-w-3xl mx-auto leading-relaxed">
              One hundred investors. One extraordinary chapter. One-of-a-kind bronze sculptures preserved from Cape Fynbos botanicals.
            </p>
          </div>
        </section>

        {/* The Investment Wordplay */}
        <section className="py-24 px-6 bg-card/10 border-y border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6 tracking-tight">
                <span className="hero-glass-text">Your Investment Is Our Investment</span>
              </h2>
              <p className="text-lg text-foreground/90 font-light">
                This phrase means three things at once
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Financial */}
              <div className="p-8 rounded-lg border border-border/50 bg-card/30">
                <div className="text-4xl font-light text-accent-gold mb-4">R3,000 - R5,000</div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-4">Your Financial Investment</h3>
                <p className="text-foreground/80 font-light mb-4">
                  Capital that funds our foundry's final fit-out — the kilns, crucibles, and precision equipment that makes Timeless Organics possible. Your money builds the infrastructure.
                </p>
              </div>

              {/* Technical */}
              <div className="p-8 rounded-lg border border-border/50 bg-card/30">
                <div className="text-4xl font-light text-bronze mb-4">700°C</div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-4">Our Technical Investment</h3>
                <p className="text-foreground/80 font-light mb-4">
                  "<span className="text-bronze font-medium">Invest</span>" is the ancient metalworking term for encasing your specimen in a heat-resistant plaster mix inside a flask. This investment creates the mold for your bronze.
                </p>
              </div>

              {/* Asset */}
              <div className="p-8 rounded-lg border border-border/50 bg-card/30">
                <div className="text-4xl font-light text-patina mb-4">R25,000+</div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-4">Your Bronze Asset</h3>
                <p className="text-foreground/80 font-light mb-4">
                  A tangible, one-of-a-kind casting with intrinsic value. Bronze sculpture by a master craftsperson with 30 years of precision work. An investment that appreciates, not depreciates.
                </p>
              </div>
            </div>

            <div className="text-center mt-12 pt-12 border-t border-border/50">
              <p className="text-xl md:text-2xl text-foreground/90 font-light leading-relaxed">
                Both investments happen <span className="text-bronze font-medium">simultaneously</span>. You invest in our future. We invest your cutting. 
                Together, we create something <span className="text-bronze font-serif italic">Timeless</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Why Now? */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-12 text-center tracking-tight">
              Why Now? Why Only 100?
            </h2>

            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="font-serif text-2xl font-medium text-foreground mb-4">The Founder's Moment</h3>
                  <p className="text-foreground/80 font-light mb-4 leading-relaxed">
                    David spent 30 years perfecting precision metalwork in London. Those skills weren't meant to be hidden. Now they're ready to be shared. This is the launch moment — when the foundry infrastructure is complete, when the vision becomes reality.
                  </p>
                  <p className="text-foreground/80 font-light leading-relaxed">
                    100 seats isn't arbitrary. It's the number that sustains us without compromising quality. After these 100, this chapter closes. You're either part of the Founding 100, or you're part of what comes next.
                  </p>
                </div>
                <div className="p-8 rounded-lg border border-bronze/30 bg-gradient-to-b from-bronze/5 to-transparent">
                  <Award className="w-12 h-12 text-bronze mb-4" />
                  <h4 className="font-serif text-xl font-medium text-foreground mb-3">Exclusivity with Purpose</h4>
                  <p className="text-sm text-foreground/80 font-light">
                    Limited seats ensure each piece receives personal attention. Each casting is selected, poured, and finished with care. This isn't mass production — it's co-creation between you and a master.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8 rounded-lg border border-accent-gold/30 bg-gradient-to-b from-accent-gold/5 to-transparent order-2 md:order-1">
                  <Flame className="w-12 h-12 text-accent-gold mb-4" />
                  <h4 className="font-serif text-xl font-medium text-foreground mb-3">Seasonal Specimens</h4>
                  <p className="text-sm text-foreground/80 font-light">
                    Cape Fynbos specimens bloom at specific times. We can't force them. You choose: cast now, or wait for your specimen to reach peak seasonal beauty. That's how we guarantee authenticity.
                  </p>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="font-serif text-2xl font-medium text-foreground mb-4">Why Botanical Matter?</h3>
                  <p className="text-foreground/80 font-light mb-4 leading-relaxed">
                    These specimens are irreplaceable. Proteas, aloes, restios — they won't wait. They fade, they're lost forever. By preserving them in bronze now, you're immortalizing something that would otherwise disappear.
                  </p>
                  <p className="text-foreground/80 font-light leading-relaxed">
                    Each casting is a dialogue between you, nature, and fire. The original burns away completely. Only its perfect impression remains — forever.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 px-6 bg-card/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-12 text-center tracking-tight">
              What You Get
            </h2>

            <div className="space-y-6 mb-12">
              <div className="p-6 rounded-lg border border-border/50 bg-card/50 flex gap-4">
                <Award className="w-6 h-6 text-bronze flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Your Bronze Sculpture</h3>
                  <p className="text-sm text-foreground/80 font-light">
                    A one-of-a-kind casting from a real Cape Fynbos specimen. Retail value R25,000+. Choose your specimen style, choose your casting timing, customize your finish later.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/50 flex gap-4">
                <Sparkles className="w-6 h-6 text-accent-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Three Lifetime Voucher Codes</h3>
                  <p className="text-sm text-foreground/80 font-light">
                    (1) Free bronze casting slot in future workshops. (2) 50-80% off one workshop. (3) 20-30% off all future workshops. Learn the lost-wax process yourself.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-border/50 bg-card/50 flex gap-4">
                <Shield className="w-6 h-6 text-patina flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Lifetime Benefits</h3>
                  <p className="text-sm text-foreground/80 font-light">
                    20-30% off everything in our shop. Commission priority. First access to auctions. Giftable to family/friends. Founding member status forever.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-bronze/10 to-accent-gold/10 border border-bronze/30 rounded-lg p-8">
              <h3 className="font-serif text-2xl font-medium text-foreground mb-4">Customize Later in Your Dashboard</h3>
              <p className="text-foreground/80 font-light mb-4">
                Don't worry about choices at checkout. You'll have time to select:
              </p>
              <ul className="space-y-2 text-sm text-foreground/80 font-light">
                <li className="flex items-start gap-3">
                  <span className="text-bronze font-medium mt-1">•</span>
                  <span><span className="text-foreground font-medium">Patina Finish</span> — Natural bronze, antique copper, verdigris green, or custom aging</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-bronze font-medium mt-1">•</span>
                  <span><span className="text-foreground font-medium">Mounting Option</span> — Wall mount, base, or custom installation (+R10)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-bronze font-medium mt-1">•</span>
                  <span><span className="text-foreground font-medium">Specimen Approval</span> — See photos of your chosen specimen before it's cast</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-bronze font-medium mt-1">•</span>
                  <span><span className="text-foreground font-medium">Casting Timing</span> — Cast now or wait for peak seasonal beauty</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* The Urgency */}
        <section className="py-24 px-6 bg-gradient-to-b from-card/20 to-background border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-8 tracking-tight">
              Once They're Gone, They're Gone
            </h2>
            <p className="text-lg md:text-xl text-foreground/90 font-light max-w-3xl mx-auto leading-relaxed mb-8">
              100 seats. No waiting list. No "phase two" with different terms. This is the Founding 100. This is the launch chapter. When these are sold out, this exclusive opportunity closes.
            </p>
            <p className="text-foreground/80 font-light mb-8">
              Most investors are checking this on mobile. We're giving everyone a fair 24-hour hold to reserve before they're gone forever. Reserve as many as you like.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link href="/#seats">
                <Button size="lg" className="btn-bronze text-base px-8 py-6 min-h-14 gap-2">
                  <Clock className="w-4 h-4" />
                  Reserve Now
                </Button>
              </Link>
              <Link href="/#seats">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 min-h-14 gap-2">
                  Buy Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
