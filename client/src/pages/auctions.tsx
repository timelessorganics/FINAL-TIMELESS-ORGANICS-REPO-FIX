import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gavel, Sparkles } from "lucide-react";

export default function AuctionsPage() {
  return (
    <>
      <div className="bg-aloe" />
      <Header />
      
      <main className="relative z-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-patina/20 mb-6">
              <Gavel className="w-10 h-10 text-patina" />
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Auctions <span className="text-accent-gold">Coming Soon</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Rare one-of-one bronze castings and exceptional specimens will be auctioned to collectors. 
              Join our Founding 100 to get early access and exclusive bidding opportunities.
            </p>

            <div className="inline-flex items-center gap-2 bg-accent-gold/20 border border-accent-gold/50 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold font-bold text-sm uppercase tracking-wide">Limited Time: Founding 100</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="/founding-100#seats">
                <Button size="lg" className="btn-bronze text-lg px-8 py-6" data-testid="button-founding-100">
                  View Founding 100 Seats
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>

            <Card className="p-8 bg-card/80 border-card-border text-left">
              <h3 className="font-serif text-2xl font-bold mb-4">Auction Features Coming Soon</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>✓ Rare specimen auctions (peak seasonal beauty)</p>
                <p>✓ One-of-one bronze casting exclusives</p>
                <p>✓ Founding 100 members get early bidding access</p>
                <p>✓ Provenance certificates with each piece</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
