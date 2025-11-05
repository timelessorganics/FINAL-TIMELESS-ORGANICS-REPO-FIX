import { Link } from "wouter";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import pincushionImg1 from "@assets/Leucospermum-prostratum-6-1_1762380839587.jpg";
import pincushionImg2 from "@assets/Comparison-of-Leucospermum-gracile-and-prostratum-8-1_1762380839588.jpg";

interface SculptureGalleryProps {
  purchaseId?: string;
}

// Specimen examples - these are reference images showing the quality and style
const specimenExamples = [
  {
    id: 1,
    name: "Pincushion (Leucospermum)",
    latinName: "Leucospermum prostratum",
    description: "Compact rosette formation with layered feathery bracts. Perfect detail retention in the delicate needle-like leaves.",
    season: "Winter-Spring",
    image: pincushionImg1,
  },
  {
    id: 2,
    name: "Pincushion Bloom",
    latinName: "Leucospermum gracile",
    description: "Spherical flower heads with distinctive spiky styles. Creates stunning sculptural forms when cast in bronze.",
    season: "Late Winter-Spring",
    image: pincushionImg2,
  },
];

export default function SculptureGallery({ purchaseId }: SculptureGalleryProps) {
  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="font-serif text-5xl font-bold text-bronze">
            Founding 100 Specimen Examples
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Reference images showing the caliber and style of specimens David selects. 
            Your actual piece will be hand-selected from the current season's finest harvests.
          </p>
        </header>

        {/* Important Notice */}
        <Card className="bg-accent-gold/10 border-accent-gold/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" />
              <CardTitle className="text-lg">Studio-Selected Specimens</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">For the Founding 100 launch:</strong> David personally curates each botanical specimen from this season's finest Cape Fynbos. No selection required—every piece is hand-picked for optimal detail retention and sculptural beauty.
            </p>
            <p>
              You'll receive photos of your personally selected specimen for approval before casting begins. Each piece is one-of-a-kind, signed and numbered (1 of 100).
            </p>
          </CardContent>
        </Card>

        {/* Specimen Examples Gallery */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold mb-2">Example Specimens</h2>
            <p className="text-muted-foreground">
              These images showcase the quality and detail you can expect
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {specimenExamples.map((specimen) => (
              <Card key={specimen.id} className="hover-elevate overflow-hidden" data-testid={`card-specimen-${specimen.id}`}>
                <div className="aspect-square bg-muted/20 overflow-hidden">
                  <img 
                    src={specimen.image} 
                    alt={specimen.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-bronze">{specimen.name}</CardTitle>
                  <CardDescription className="italic">{specimen.latinName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {specimen.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-bronze/70">
                    <span className="font-semibold">Peak Season:</span>
                    <span>{specimen.season}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* View Full Seasonal Guide */}
        <div className="text-center pt-8">
          <Link href="/seasonal-guide">
            <Button variant="outline" size="lg" className="gap-2" data-testid="button-view-seasonal-guide">
              View Full Seasonal Guide
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
