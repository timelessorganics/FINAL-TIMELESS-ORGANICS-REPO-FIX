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
                    description="One bronze casting included of a Studio-Guaranteed Specimen"
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
                    subtitle="R6,000"
                    description="One bronze casting included of a Studio-Guaranteed Specimen"
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
