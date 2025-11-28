import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";
import { Leaf, CalendarDays, Flower2, Sparkles, ArrowLeft, Camera, CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SpecimenShowcase from "@/components/SpecimenShowcase";

export default function SeasonalGuide() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
          
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
              The Seasonal Nature of Fynbos
            </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cape Fynbos is a winter-rainfall ecosystem. Each botanical specimen has its own season 
            of peak beauty—when flowers bloom, bracts colour, and seedheads form. We cast nature 
            at its finest, which means timing matters.
          </p>
        </header>

        {/* Why Seasons Matter */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-bronze" />
            <h2 className="font-serif text-3xl font-bold">Why Seasons Matter</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <Flower2 className="w-10 h-10 text-bronze mb-2" />
                <CardTitle>Peak Beauty Windows</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Proteas bloom in winter-spring. Pincushions peak in late winter through early summer. 
                  Watsonias spike in spring. Each species has a narrow window when it's truly spectacular.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Leaf className="w-10 h-10 text-patina mb-2" />
                <CardTitle>Structural Integrity</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Some specimens (like restios) are architectural year-round, while others need to be 
                  caught at exactly the right moment—too early and the form isn't developed; too late 
                  and petals drop or pods open.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seasonal Availability Chart */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-bronze" />
            <h2 className="font-serif text-3xl font-bold">Seasonal Availability Chart</h2>
          </div>

          <p className="text-muted-foreground">
            All 9 specimen styles available for future workshop bookings, organized by peak season:
          </p>

          {/* Seasonal Chart */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-bronze/30">
                  <th className="text-left p-4 font-serif text-lg text-bronze">Specimen Style</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Winter</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Spring</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Summer</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground">Autumn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Cones / Bracts / Seedpods</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Protea / Pincushion Blooms / Heads</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Bulb Spikes</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Branches + Leaves</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Aloe Inflorescence Heads</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Flower Heads</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Erica Sprays</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Restios / Seedheads / Grasses</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Small Succulents</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 justify-center text-sm mt-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-bronze"></span>
              <span className="text-muted-foreground">Peak Season</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span>
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-border"></span>
              <span className="text-muted-foreground">Not Available</span>
            </div>
          </div>
        </section>

        {/* Specimen Showcase with Hover Images */}
        <SpecimenShowcase />

        {/* Founding 100 Note */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-bronze" />
            <h2 className="font-serif text-3xl font-bold">For the Founding 100</h2>
          </div>

          <Card className="border-bronze/30">
            <CardContent className="p-6 space-y-4">
              <p className="text-lg font-medium text-foreground">
                Choose Your Specimen Style
              </p>
              <p className="text-muted-foreground">
                Select from 9 Cape Fynbos styles during checkout. David will personally curate the finest specimen of your chosen style from the current or upcoming seasonal harvest. If your style is in peak season, we'll begin casting immediately. Otherwise, we'll immortalize it when it reaches its prime - worth the wait for perfection!
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
                <p className="text-xs text-muted-foreground italic">
                  💡 Note: Use the seasonal chart above to see when each style reaches peak beauty. Some styles (like Woody Branch and Succulent Rosette) are available year-round.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Future Workshop Options (Coming Soon) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Flower2 className="w-8 h-8 text-patina" />
            <h2 className="font-serif text-3xl font-bold">Future Workshop Options</h2>
          </div>

          <p className="text-lg text-foreground">
            After the Founding 100 launch, workshops will be available on a <strong>date-based booking system</strong>. You book available dates, and what's available is what's on offer—no seasonal waiting lists. Perfect for tourists and locals alike.
          </p>

          <div className="space-y-6">
            {/* Option 1: Studio Selection */}
            <Card className="border-bronze/40 hover-elevate">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-bronze" />
                  <CardTitle className="text-xl text-bronze">Studio-Selected Specimen</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Let us choose the perfect specimen for you from current availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Choose your preferred botanical style from the specimen ranges and availability charts above. 
                  We'll select a premium specimen that's currently at its peak and has the highest chance of 
                  casting success.
                </p>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground font-medium mb-2">✓ Includes Safety Net:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Free second casting if the first doesn't work out</li>
                    <li>• Worldwide courier (costs to customer or flat international rate)</li>
                    <li>• If second casting fails: Commission option at 50% workshop cost (for similar specimens)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Bring Your Own */}
            <Card className="border-accent-gold/60 hover-elevate bg-gradient-to-br from-background to-accent-gold/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-accent-gold" />
                  <CardTitle className="text-xl text-accent-gold">Bring Your Own Specimen</CardTitle>
                </div>
                <CardDescription className="text-base font-medium text-foreground">
                  Ultimate customization—cast something personally meaningful to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  Bring any botanical specimen you'd like cast, subject to practical restrictions:
                </p>
                <div className="bg-background/80 border border-accent-gold/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Restrictions:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Maximum size limitations (workshop-compatible)</li>
                    <li>• No hardwood (too dense for lost-wax casting)</li>
                    <li>• Not too thin/delicate (must survive burnout)</li>
                    <li>• Structural integrity requirements</li>
                  </ul>
                </div>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground font-medium mb-2">✓ Includes Safety Net:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Free second casting on the house (in our own time)</li>
                    <li>• Worldwide courier (costs to customer or flat international rate)</li>
                    <li>• If second fails: Commission at 50% cost (similar specimen) or full commission costing (different/larger request)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Future Services Callout */}
            <Card className="border-patina/40 bg-gradient-to-br from-background to-patina/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-patina" />
                  <CardTitle className="text-patina">Coming Soon: Bespoke Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Beyond workshops, we'll be offering standalone services to artists, designers, and anyone who needs something cast in bronze:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-patina mt-1">•</span>
                    <span><strong className="text-foreground">Bespoke Commissions:</strong> Custom bronze sculptures designed and cast to your specifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-patina mt-1">•</span>
                    <span><strong className="text-foreground">Casting Service:</strong> Flat-rate casting up to certain size, then scaled pricing for larger works—perfect for artists, jewelers, or anyone needing professional bronze casting</span>
                  </li>
                </ul>
                <p className="text-xs italic text-muted-foreground mt-4">
                  Contact us to discuss your project—we'd love to help bring your vision to life.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Seasonal Calendar */}
        <section className="space-y-6">
          <h2 className="font-serif text-3xl font-bold">The Fynbos Year</h2>
          <p className="text-muted-foreground">
            A quick guide to what's showy when in the Western Cape (winter-rainfall region):
          </p>

          <div className="space-y-4">
            {seasonalCalendar.map((season) => (
              <Card key={season.season} className="hover-elevate">
                <CardHeader>
                  <CardTitle className="text-bronze">{season.season}</CardTitle>
                  <CardDescription>{season.months}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {season.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-bronze mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12">
          <h3 className="font-serif text-3xl font-bold">Ready to Invest?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join the Founding 100 and secure your bronze casting. Choose your specimen style during checkout, 
            and we'll immortalize it at peak seasonal beauty.
          </p>
          <Link href="/founding100">
            <Button 
              size="lg" 
              className="bg-bronze hover:bg-bronze/90 text-white font-semibold"
              data-testid="button-view-founding100"
            >
              View Founding 100 Seats
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

// Seasonal calendar data
const seasonalCalendar = [
  {
    season: "Winter",
    months: "May–August",
    highlights: [
      "Proteas kick into full bloom (many species, especially king protea June–October)",
      "Aloes fire bright red/orange spikes (May–August)",
      "Leucadendron bracts begin colouring (from April onward)",
      "Buchus and confetti bush ramp up fragrance",
      "Restios flower (mostly autumn–winter)",
    ]
  },
  {
    season: "Spring",
    months: "September–November",
    highlights: [
      "Absolute peak season for colour and diversity",
      "Pincushions (Leucospermum) in full tilt (many species July–December)",
      "Geophytes explode: watsonias, ixias, gladioli, babianas",
      "West Coast annuals (if rain cooperates)",
      "Late proteas and leucadendrons still showy",
    ]
  },
  {
    season: "Summer",
    months: "December–February",
    highlights: [
      "Tail-end watsonias flowering into early summer",
      "Summer ericas add colour to heathy beds",
      "Restio seedheads provide architectural interest",
      "Gardens transition to foliage/texture focus",
      "Planning and scouting for autumn–winter specimens",
    ]
  },
  {
    season: "Autumn",
    months: "March–April",
    highlights: [
      "Restios start proper flowering (March–April primary window)",
      "Phylica (featherheads) begin understated displays",
      "Leucadendron bracts begin colouring again",
      "Early preparation for winter bloom season",
      "Woody structures and seed pods become prominent",
    ]
  },
];
