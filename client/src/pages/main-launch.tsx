import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SeatCard from "@/components/seat-card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";
import { FlowerTimelapseBackground } from "@/components/FlowerTimelapseBackground";
import { ArrowRight, Check, Star, Flame, Gift, Award, Users, Sparkles } from "lucide-react";
import SeatSelectionModal from "@/components/seat-selection-modal";
import type { Seat } from "@shared/schema";

// Import AI-generated bronze concept images
import bronzeProtea1 from "@assets/Gemini_Generated_Image_4ipbpv4ipbpv4ipb_1764104071710.png";
import bronzeProtea2 from "@assets/Gemini_Generated_Image_4pcwat4pcwat4pcw_1764104071710.png";
import bronzeSucculent1 from "@assets/Gemini_Generated_Image_bpsd46bpsd46bpsd_1764103956648.png";
import bronzeSucculent2 from "@assets/Gemini_Generated_Image_f8nvk8f8nvk8f8nv_1764103956649.png";
import bronzeAloe1 from "@assets/Gemini_Generated_Image_hrdzhzhrdzhzhrdz_1764103956649.png";
import bronzeMounting from "@assets/Gemini_Generated_Image_o1612no1612no161_1764103956649.png";

export default function MainLaunch() {
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit' | 'reserve'>('full');
  
  const { data: seats, isLoading } = useQuery<Seat[]>({
    queryKey: ["/api/seats/availability"],
  });

  const founderSeat = seats?.find((s) => s.type === "founder");
  const patronSeat = seats?.find((s) => s.type === "patron");

  const scrollToSeats = () => {
    document.getElementById('seats')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePaymentClick = (type: 'full' | 'deposit' | 'reserve') => {
    setPaymentType(type);
    setSeatModalOpen(true);
  };

  return (
    <>
      <div className="bg-aloe" />
      <FlowerTimelapseBackground intensity="medium" />
      <Header />
      <div className="relative z-50 min-h-screen" id="top">
        <div className="max-w-[1100px] mx-auto px-7 py-12">
          
          {/* HERO SECTION */}
          <section className="text-center mb-12 pt-8" data-testid="section-hero">
            <div className="kicker mb-3">FOUNDING 100 INVESTOR LAUNCH</div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Where <span className="moving-fill">Ancient Craft</span><br />
              Meets Modern Investment
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Your investment funds our foundry's final fit-out. In return, we invest (immortalize) your chosen botanical specimen now — 
              guaranteeing you a flawless bronze casting, lifetime discount codes for <strong className="text-foreground">shop sales, commissions, AND workshops</strong>, 
              and exclusive access to the ancient art of lost-wax casting.
            </p>


            {/* Three Stat Cards - Updated Value Messaging */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-bronze mb-2">100</div>
                <div className="text-muted-foreground">Limited Seats</div>
                <div className="text-xs text-foreground/60 mt-1">50 Founder + 50 Patron</div>
              </Card>
              
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-accent-gold mb-2">R25K+</div>
                <div className="text-muted-foreground">IF Mounted & Patinated</div>
                <div className="text-xs text-foreground/60 mt-1">Optional services available later</div>
              </Card>
              
              <Card className="p-6 bg-card/50 border-card-border">
                <div className="text-5xl font-bold font-serif text-patina mb-2">LIFE</div>
                <div className="text-muted-foreground">time Benefits</div>
                <div className="text-xs text-foreground/60 mt-1">Shop, Commissions & Workshops</div>
              </Card>
            </div>
          </section>

          {/* SEAT SELECTION - RIGHT AFTER HERO */}
          <section id="seats" className="mb-16 py-12 scroll-mt-20" data-testid="section-seats">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="text-accent-gold">Invest Now</span> — Choose Your Seat
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Only 100 seats available. 50 Founders + 50 Patrons. Once they're gone, they're gone forever.
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
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "50% off first workshop (Transferable, single-use, never expires)",
                      "20% lifetime discount — Shop, Commissions, AND Workshops (Unlimited, giftable)",
                      "24hr seat reservation — held for you while you decide",
                    ]}
                    onPaymentClick={handlePaymentClick}
                  />
                )}
                {patronSeat && (
                  <SeatCard
                    seat={patronSeat}
                    title="Patron Gift Card"
                    subtitle="R5,000"
                    description="One bronze casting included of a Studio-Guaranteed Cutting"
                    benefits={[
                      "Your name permanently engraved on our Founders & Patrons Leaf Wall",
                      "80% off first workshop (Transferable, single-use, never expires)",
                      "30% lifetime discount — Shop, Commissions, AND Workshops (Unlimited, giftable)",
                      "24hr seat reservation — held for you while you decide",
                    ]}
                    featured
                    onPaymentClick={handlePaymentClick}
                  />
                )}
              </div>
            )}
          </section>

          {/* THE INCREDIBLE VALUE - CRYSTAL CLEAR */}
          <section className="mb-16 py-12 bg-gradient-to-br from-bronze/10 via-card/50 to-accent-gold/10 rounded-xl border border-bronze/30" data-testid="section-value">
            <div className="max-w-5xl mx-auto px-7">
              <div className="text-center mb-10">
                <div className="inline-block px-4 py-2 bg-accent-gold/20 rounded-full text-accent-gold text-sm font-bold mb-4">
                  UNDERSTAND THE VALUE
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  What You're <span className="text-bronze">Actually Getting</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  This isn't just an investment — it's an incredible deal. Let us break down the true value of your Founding 100 seat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Bronze Sculpture Value - UPDATED: Clarify IF mounted & patinated */}
                <Card className="p-8 bg-card/80 border-bronze/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-bronze" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">Bronze Sculpture</h3>
                      <div className="text-accent-gold font-bold text-xl">Worth R25,000+ IF Finished</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    A cutting cast in bronze has established market value of <strong className="text-foreground">R25,000+ when mounted AND patinated</strong>. 
                    These are <strong className="text-accent-gold">optional services</strong> you can add later through our shop.
                  </p>
                  <p className="text-sm text-foreground/80 mb-2">
                    Your Founding 100 seat includes the raw bronze casting. Mounting and patina finishing are available as shop products — 
                    and your <span className="text-accent-gold font-semibold">lifetime discount code</span> applies to them.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bigger sculptures (full aloes, commissions) can fetch R100K to <strong className="text-foreground">MILLIONS</strong>.
                  </p>
                </Card>

                {/* Lifetime Discount Codes - UPDATED: Shop, Commissions, AND Workshops */}
                <Card className="p-8 bg-card/80 border-bronze/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-patina/20 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-patina" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">Lifetime Discount Codes</h3>
                      <div className="text-patina font-bold text-xl">Shop + Commissions + Workshops</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    <strong className="text-foreground">20% (Founders) / 30% (Patrons) off EVERYTHING:</strong> Shop products, custom commissions, AND all future workshops. 
                    <span className="text-patina"> Unlimited uses, transferable, giftable — forever.</span>
                  </p>
                  <p className="text-sm text-foreground/80">
                    PLUS a <span className="text-accent-gold font-semibold">one-time voucher</span> for 50-80% off your first workshop. 
                    These codes work site-wide on all products and services.
                  </p>
                </Card>

                {/* Commission Opportunity - UPDATED: Can go into MILLIONS */}
                <Card className="p-8 bg-card/80 border-bronze/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-accent-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">Commission Opportunity</h3>
                      <div className="text-accent-gold font-bold text-xl">R8,500 to MILLIONS</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Commissions range from simple pieces at R8,500 to monumental installations that can go into the <strong className="text-accent-gold">MILLIONS</strong> 
                    depending on scale, complexity, and artistic scope.
                  </p>
                  <p className="text-sm text-foreground/80">
                    Your founding <span className="text-patina font-semibold">lifetime discount (20-30%)</span> applies to ALL commissions. 
                    A R1M piece becomes R700K-800K for you. Forever.
                  </p>
                </Card>

                {/* Wall of Leaves */}
                <Card className="p-8 bg-card/80 border-bronze/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-bronze/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-bronze" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">Founders Wall</h3>
                      <div className="text-bronze font-bold text-xl">Your Name in Bronze</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Your name will be <strong className="text-foreground">permanently engraved</strong> on our bronze Founders & Patrons Leaf Wall, 
                    displayed at the studio entrance.
                  </p>
                  <p className="text-sm text-foreground/80">
                    This is your <span className="text-bronze font-semibold">permanent recognition</span> as an infrastructure investor who made the foundry possible. 
                    Priceless legacy.
                  </p>
                </Card>
              </div>

              {/* Summary Value Block - UPDATED */}
              <Card className="p-8 bg-gradient-to-r from-bronze/20 to-accent-gold/20 border-bronze/50">
                <div className="text-center">
                  <h3 className="font-serif text-3xl font-bold mb-4 text-foreground">
                    You Pay: <span className="text-bronze">R3,000</span> or <span className="text-accent-gold">R5,000</span>
                  </h3>
                  <h3 className="font-serif text-3xl font-bold mb-4 text-foreground">
                    You Receive: Bronze Casting + <span className="text-patina">Lifetime Benefits</span>
                  </h3>
                  <p className="text-lg text-accent-gold mb-2">
                    R25,000+ market value when mounted and patinated (optional add-ons)
                  </p>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    This is not crowdfunding. This is a <strong className="text-foreground">returnable investment for life</strong>. 
                    Your lifetime discount codes work on shop products, commissions, AND workshops — forever.
                  </p>
                  <Button 
                    size="lg"
                    onClick={scrollToSeats}
                    className="relative overflow-hidden text-lg px-10 py-6 font-bold bg-gradient-to-r from-bronze via-accent-gold to-bronze bg-[length:200%_100%] animate-shimmer border-2 border-bronze/50 text-background"
                    data-testid="button-reserve-seat-value"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    RESERVE YOUR SEAT FOR 24HRS
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Seats reserved for 24 hours. Unpurchased seats return to pool — subscribers notified first.
                  </p>
                </div>
              </Card>
            </div>
          </section>

          {/* AI BRONZE CONCEPT GALLERY */}
          <section className="mb-16 py-12" data-testid="section-bronze-gallery">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                What Your <span className="text-bronze">Bronze</span> Could Look Like
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
                AI-generated concept images showing the type of bronze sculptures you'll receive.
              </p>
              <p className="text-sm text-accent-gold italic">
                *The foundry fires haven't been lit yet — these are previews of what's coming!
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="overflow-hidden bg-card/50 border-card-border">
                <img src={bronzeProtea1} alt="Bronze Protea Concept" className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-foreground">Bronze Protea</p>
                  <p className="text-xs text-muted-foreground">AI Concept</p>
                </div>
              </Card>
              <Card className="overflow-hidden bg-card/50 border-card-border">
                <img src={bronzeSucculent1} alt="Bronze Succulent Concept" className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-foreground">Bronze Succulent</p>
                  <p className="text-xs text-muted-foreground">AI Concept</p>
                </div>
              </Card>
              <Card className="overflow-hidden bg-card/50 border-card-border">
                <img src={bronzeAloe1} alt="Bronze Aloe Concept" className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-foreground">Bronze Aloe</p>
                  <p className="text-xs text-muted-foreground">AI Concept</p>
                </div>
              </Card>
              <Card className="overflow-hidden bg-card/50 border-card-border">
                <img src={bronzeProtea2} alt="Bronze on Wood Base" className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-foreground">Wood Base Mount</p>
                  <p className="text-xs text-muted-foreground">AI Concept</p>
                </div>
              </Card>
              <Card className="overflow-hidden bg-card/50 border-card-border">
                <img src={bronzeSucculent2} alt="Bronze with Patina" className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-foreground">Patina Finish</p>
                  <p className="text-xs text-muted-foreground">AI Concept</p>
                </div>
              </Card>
              <Card className="overflow-hidden bg-card/50 border-card-border">
                <img src={bronzeMounting} alt="Bronze Slate Mount" className="w-full h-48 object-cover" />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium text-foreground">Slate Wall Mount</p>
                  <p className="text-xs text-muted-foreground">AI Concept</p>
                </div>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="border-bronze/50 hover:border-bronze"
                data-testid="button-view-real-specimens"
              >
                <a href="/sculptures">
                  View Real Botanical Specimens
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </section>

          {/* WHAT ARE THE WORKSHOPS - CRYSTAL CLEAR */}
          <section className="mb-16 py-12 bg-card/30 rounded-xl border border-card-border" data-testid="section-workshops-explained">
            <div className="max-w-5xl mx-auto px-7">
              <div className="text-center mb-10">
                <div className="inline-block px-4 py-2 bg-patina/20 rounded-full text-patina text-sm font-bold mb-4">
                  FUTURE WORKSHOPS
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  What Are The <span className="text-accent-gold">Workshops</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  The workshops are hands-on 2-day experiences where YOU create your own bronze sculpture using ancient lost-wax casting techniques.
                </p>
              </div>

              {/* Workshop Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <Card className="p-8 bg-card/80 border-card-border">
                  <div className="text-accent-gold text-4xl font-bold font-serif mb-4">Day 1</div>
                  <h3 className="font-serif text-2xl font-bold mb-4 text-foreground">Preparation & Investment</h3>
                  <p className="text-muted-foreground mb-4">3 hours (11am - 2pm)</p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span>Learn spruing techniques and the science behind bronze casting</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span>Prepare your botanical specimen for casting</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span>Invest (encase) your cutting in the investment mold material</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span>Learn the burn-out process (runs overnight)</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-8 bg-card/80 border-card-border">
                  <div className="text-bronze text-4xl font-bold font-serif mb-4">Day 2</div>
                  <h3 className="font-serif text-2xl font-bold mb-4 text-foreground">Bronze Pour & Reveal</h3>
                  <p className="text-muted-foreground mb-4">4 hours (12pm - 4pm)</p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <Flame className="w-5 h-5 text-bronze mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">Bronze pour experience</strong> — watch molten metal flow into your mold</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span>Break out and reveal your bronze casting</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span>Sand/bead-blast finishing techniques</span>
                    </li>
                    <li className="flex gap-3">
                      <Check className="w-5 h-5 text-patina mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">Leave with your finished bronze sculpture</strong></span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Workshop Value */}
              <Card className="p-8 bg-bronze/10 border-bronze/30 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-accent-gold mb-2">R5,000 - R10,000</div>
                    <div className="text-muted-foreground">Normal Workshop Price</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-patina mb-2">50-80% OFF</div>
                    <div className="text-muted-foreground">Your First Workshop</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-bronze mb-2">R25,000+</div>
                    <div className="text-muted-foreground">Value You Create</div>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  <strong className="text-foreground">Note:</strong> Workshops are NOT included in the Founding 100 purchase — 
                  but you get massive discounts on them. Your vouchers are giftable and never expire.
                </p>
                <p className="text-sm text-accent-gold italic">
                  Workshop scheduling opens after the Founding 100 launch completes.
                </p>
              </div>
            </div>
          </section>

          {/* The Vision - Honest & Vulnerable */}
          <section className="mb-16 py-12" data-testid="section-vision">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  The <span className="text-patina">Vision</span>
                </h2>
              </div>

              <div className="prose prose-invert prose-lg max-w-none space-y-6">
                <p className="text-lg text-foreground/90 leading-relaxed">
                  I'll be honest with you. Recent events and unforeseen circumstances left us in a difficult position. 
                  The foundry we've been building — the dream I've nurtured for years — suddenly needed immediate capital 
                  to complete the final fit-out.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  But here's the thing about hardship: it forces you to get creative. And in that creative struggle, 
                  I realized this challenge opened a door to something I've <em>always</em> wanted to do — share this 
                  ancient craft with people who genuinely care about art, craftsmanship, and preservation.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  Yes, we need to keep the lights on. Yes, we need capital to finish the foundry. But this isn't 
                  crowdfunding where you donate and hope for the best. Instead, we've created something different — 
                  a <strong className="text-accent-gold">returnable investment for life</strong>.
                </p>

                <Card className="p-6 bg-bronze/10 border-l-4 border-bronze rounded-l-none">
                  <p className="text-foreground/90 font-medium mb-3">
                    Your investment funds our infrastructure. That infrastructure creates <em>your</em> bronze art. 
                    And you gain lifetime access to the knowledge, the craft, and the community we're building.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Out of hardship comes opportunity. This is ours. And yours.
                  </p>
                </Card>

                <p className="text-center text-xl text-foreground/90 font-medium pt-6 border-t border-border">
                  Thank you for believing in what we're building. <span className="text-patina">— David Junor</span>
                </p>
              </div>

              <div className="text-center mt-8">
                <Button 
                  size="lg"
                  onClick={scrollToSeats}
                  className="btn-bronze text-lg px-10 py-6 font-bold"
                  data-testid="button-secure-seat-vision"
                >
                  JOIN THE FOUNDING 100
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </section>

          {/* David Junor Bio Section */}
          <section className="mb-16 py-12" data-testid="section-david-bio">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  Meet <span className="text-bronze">David Junor</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  The artist and craftsman behind Timeless Organics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <Card className="p-6 bg-card/50 border-card-border h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-bronze/20 border-2 border-bronze flex items-center justify-center">
                        <span className="text-5xl font-serif text-bronze">DJ</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Founder & Bronze Artist</p>
                    </div>
                  </Card>
                </div>

                <div className="md:col-span-2">
                  <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
                    <p className="text-foreground/90 leading-relaxed">
                      David Junor is a South African bronze artist and craftsman specializing in lost-wax casting 
                      of Cape Fynbos botanical specimens. Based in Kommetjie, he combines traditional metalworking 
                      techniques with contemporary artistic vision.
                    </p>
                    
                    <p className="leading-relaxed">
                      His work preserves the intricate beauty of indigenous South African flora — proteas, aloes, 
                      restios, and succulents — transforming ephemeral botanical specimens into permanent bronze sculptures. 
                      Each piece captures the exact detail of the original plant material, down to the smallest leaf vein 
                      and petal texture.
                    </p>
                    
                    <p className="leading-relaxed">
                      Through Timeless Organics, David is building more than a foundry. He's creating a space where 
                      ancient bronze-casting traditions meet modern artistic practice, where knowledge is shared through 
                      hands-on workshops, and where South Africa's unique botanical heritage is preserved in metal for 
                      generations to come.
                    </p>

                    <p className="text-foreground/90 font-medium italic pt-4 border-t border-border">
                      "Bronze casting isn't just about creating art — it's about preserving moments in time, 
                      teaching forgotten skills, and building a community around craft."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How Investment Works */}
          <section className="mb-16 py-12 bg-card/20 rounded-xl border border-card-border" data-testid="section-investment-meaning">
            <div className="max-w-4xl mx-auto px-7">
              <div className="text-center mb-10">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  What Does <span className="text-accent-gold">"Investment"</span> Mean?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The word "investment" carries a double meaning in our program — one financial, one technical.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-accent-gold" />
                    <h3 className="font-serif text-2xl font-bold text-foreground">Your Financial Investment</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    You invest capital (R3,000 or R5,000) to fund our foundry's final fit-out — equipment, tooling, and infrastructure that makes Timeless Organics possible.
                  </p>
                </Card>

                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-8 h-8 text-bronze" />
                    <h3 className="font-serif text-2xl font-bold text-foreground">Our Technical Investment</h3>
                  </div>
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

          {/* How the Founding 100 Works */}
          <section className="mb-16 py-12" data-testid="section-how-it-works">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  How It Works
                </h2>
                <p className="text-lg text-muted-foreground">
                  Four simple steps to your bronze masterpiece.
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
                      <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Select Your Cutting</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Choose from our studio-approved botanical cuttings. Each specimen is unique — no two are alike.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-card/50 border-card-border">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl font-bold font-serif text-bronze flex-shrink-0">3</div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">We Cast Your Bronze</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Your capital funds equipment. We invest your specimen immediately using lost-wax casting.
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
                        Your bronze is couriered to you, along with workshop vouchers, lifetime codes, and founding certificate.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="text-center mt-10">
                <Button 
                  size="lg"
                  onClick={scrollToSeats}
                  className="btn-bronze text-lg px-10 py-6 font-bold"
                  data-testid="button-secure-seat-how"
                >
                  START NOW — SECURE YOUR SEAT
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16" data-testid="section-faq">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-accent-gold">Questions</span>
              </h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">What exactly do I get for R3,000 / R5,000?</h3>
                <p className="text-muted-foreground text-sm">
                  A guaranteed bronze casting of a studio-approved botanical specimen (worth R25,000+ when mounted and patinated — optional add-ons), 
                  your name on the Founders Wall, 50-80% off your first workshop, and a lifetime discount code (20-30% off) for 
                  <strong className="text-foreground"> shop products, commissions, AND all future workshops</strong>. Plus founding member certificate.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">What about mounting and patina finishing?</h3>
                <p className="text-muted-foreground text-sm">
                  Your Founding 100 seat includes the raw bronze casting. Mounting (wall/base) and patina finishing are 
                  <strong className="text-foreground"> optional services available in our shop</strong>. Your lifetime discount code 
                  applies to these add-ons! This is how your casting reaches the R25,000+ market value.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">How does the 24-hour seat reservation work?</h3>
                <p className="text-muted-foreground text-sm">
                  When you reserve a seat, it's held for you for 24 hours while you decide. If you don't complete your purchase, 
                  the seat automatically returns to the pool. Subscribers get <strong className="text-foreground">first notification</strong> when 
                  reserved seats become available again.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">How do the lifetime discount codes work?</h3>
                <p className="text-muted-foreground text-sm">
                  You receive two codes: (1) A single-use voucher for 50-80% off your first 2-day workshop (transferable, never expires). 
                  (2) A lifetime discount code (20% Founders / 30% Patrons) for <strong className="text-foreground">shop products, 
                  custom commissions, AND all future workshops</strong>. Unlimited uses, giftable forever. Works site-wide!
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">What is the Wall of Leaves?</h3>
                <p className="text-muted-foreground text-sm">
                  A permanent bronze installation at our studio entrance featuring the engraved names of all Founding 100 members. 
                  Your contribution will be remembered forever as part of our origin story.
                </p>
              </Card>

              <Card className="bg-card border-card-border p-6">
                <h3 className="font-semibold text-foreground mb-2">Do you ship internationally?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes — we ship throughout South Africa (from R100) and internationally. Customs/VAT at destination are the recipient's responsibility.
                </p>
              </Card>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="mb-16 py-16 bg-gradient-to-br from-bronze/20 to-accent-gold/20 rounded-xl border border-bronze/30" data-testid="section-final-cta">
            <div className="text-center max-w-3xl mx-auto px-7">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Ready to Become a <span className="text-bronze">Founding Member</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Only 100 seats available. Join the founding members who believe in preserving ancient craft and creating timeless art.
              </p>
              <Button 
                size="lg"
                onClick={scrollToSeats}
                className="btn-bronze text-xl px-12 py-8 font-bold shadow-lg shadow-bronze/30"
                data-testid="button-secure-seat-final"
              >
                <Flame className="w-6 h-6 mr-3" />
                SECURE YOUR SEAT NOW
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Questions? Email us at <a href="mailto:studio@timeless.organic" className="text-bronze hover:underline">studio@timeless.organic</a>
              </p>
            </div>
          </section>

          {/* Subscribe - At Bottom */}
          <section className="mb-16" data-testid="section-subscribe">
            <Card className="p-8 bg-card/50 border-card-border text-center">
              <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Not Ready Yet?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Stay updated on the Founding 100 launch and be first to know when workshops become available.
              </p>
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="border-bronze/50 hover:border-bronze"
                data-testid="button-subscribe"
              >
                <a href="/#subscribe">
                  Subscribe for Updates
                </a>
              </Button>
            </Card>
          </section>
        </div>
      </div>
      
      <SeatSelectionModal 
        open={seatModalOpen} 
        onOpenChange={setSeatModalOpen}
        paymentType={paymentType}
      />
      <Footer />
    </>
  );
}
