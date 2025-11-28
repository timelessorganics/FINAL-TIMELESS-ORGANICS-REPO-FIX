import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SpecimenShowcase from "@/components/SpecimenShowcase";
import { FlowerTimelapseBackground } from "@/components/FlowerTimelapseBackground";

interface SculptureGalleryProps {
  purchaseId?: string;
}

export default function SculptureGallery({ purchaseId }: SculptureGalleryProps) {
  return (
    <>
      <Header />
      <FlowerTimelapseBackground intensity="subtle" />
      <div className="min-h-screen bg-background relative z-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        
        {/* Back Navigation */}
        <div>
          <Link href="/">
            <Button variant="ghost" className="gap-2" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <header className="text-center space-y-4">
          <h1 className="font-serif text-5xl font-bold moving-fill">
            Specimen Styles
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Browse the 12 botanical forms we work with. Hover over cards to see example photos 
            where available. David hand-selects each specimen for the Founding 100.
          </p>
        </header>

        {/* Important Notice */}
        <Card className="bg-accent-gold/10 border-accent-gold/30">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" />
              <p className="font-semibold text-lg">Studio-Selected for Founding 100</p>
            </div>
            <p className="text-sm text-muted-foreground">
              For this exclusive launch, David personally curates each botanical specimen from this season's finest Cape Fynbos. 
              No selection required—every piece is hand-picked for optimal detail retention and sculptural beauty. 
              You'll receive photos of your personally selected specimen for approval before casting begins.
            </p>
          </CardContent>
        </Card>

        {/* Specimen Showcase (same as seasonal guide) */}
        <SpecimenShowcase />

        {/* View Full Seasonal Guide */}
        <div className="text-center pt-8">
          <Link href="/seasonal-guide">
            <Button variant="outline" size="lg" className="gap-2" data-testid="button-view-seasonal-guide">
              View Full Seasonal Guide & Workshop Options
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
    <Footer />
    </>
  );
}
