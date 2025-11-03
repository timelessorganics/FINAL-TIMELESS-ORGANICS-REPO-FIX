import { Link } from "wouter";
import { Leaf, CalendarDays, Flower2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SeasonalGuide() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        
        {/* Hero Section */}
        <header className="text-center space-y-4">
          <h1 className="font-serif text-5xl font-bold text-bronze">
            The Seasonal Nature of Fynbos
          </h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
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
              <CardContent className="text-secondary">
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
              <CardContent className="text-secondary">
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

          <p className="text-secondary">
            All 12 specimen styles available for future workshop bookings, organized by peak season:
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
                  <td className="p-4 font-medium">Protea Head</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Pincushion Bloom</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Cone + Bracts</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Aloe Inflorescence</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Erica Spray</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Restio Seedheads</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Bulb Spike (Watsonia)</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Pelargonium Leaf/Flower</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Woody Branch + Leaves</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Cone/Seed Pod</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-border"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze/50"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Succulent Rosette</td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                  <td className="text-center p-4"><span className="inline-block w-3 h-3 rounded-full bg-bronze"></span></td>
                </tr>
                <tr className="hover-elevate">
                  <td className="p-4 font-medium">Miniature Mix</td>
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

        {/* Founding 100 Note */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-bronze" />
            <h2 className="font-serif text-3xl font-bold">For the Founding 100</h2>
          </div>

          <Card className="border-bronze/30">
            <CardContent className="p-6 space-y-4">
              <p className="text-lg font-medium text-foreground">
                Studio-Selected Specimens Only
              </p>
              <p className="text-secondary">
                For this exclusive launch, David Junor personally curates and selects each botanical specimen from the current season's finest Cape Fynbos. Your bronze will be one-of-a-kind, chosen for optimal detail retention and sculptural beauty. No specimen selection required—just complete your checkout and we'll handle the rest.
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-4 mt-4">
                <p className="text-xs text-muted-foreground italic">
                  💡 Note: Custom specimen selection and "bring your own" options will be available for regular workshop bookings after the Founding 100 launch.
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

          <p className="text-secondary">
            After the Founding 100 launch, regular workshop participants will have flexible specimen selection:
          </p>

          <div className="space-y-4">
            <Card className="border-patina/30 hover-elevate opacity-75">
              <CardHeader>
                <CardTitle className="text-patina">Choose Your Style</CardTitle>
                <CardDescription>
                  Pick from 12 specimen styles and wait for peak season
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-secondary">
                  Select your favorite botanical form from the chart above. We'll cast it when that species hits its seasonal sweet spot.
                </p>
                <div className="flex items-center gap-2 text-sm text-tertiary">
                  <CalendarDays className="w-4 h-4" />
                  <span>Coming after Founding 100</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 hover-elevate opacity-75">
              <CardHeader>
                <CardTitle className="text-accent">Bring Your Own</CardTitle>
                <CardDescription>
                  Upload a photo of your exact desired specimen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-secondary">
                  Send us a clear photo of what you'd like cast. We'll confirm viability within 48–72 hours and schedule it for the appropriate season.
                </p>
                <div className="flex items-center gap-2 text-sm text-tertiary">
                  <Sparkles className="w-4 h-4" />
                  <span>Ultimate customization • Approval required</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Specimen Styles */}
        <section className="space-y-6">
          <h2 className="font-serif text-3xl font-bold">Specimen Styles</h2>
          <p className="text-secondary">
            Instead of naming exact species, we group botanicals by their visual form. This gives 
            you creative freedom while ensuring we can source A-grade material when the season opens.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specimenStyles.map((style) => (
              <Card key={style.id} className="hover-elevate">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">{style.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-bronze">
                    <CalendarDays className="w-4 h-4" />
                    <span>{style.season}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-secondary">{style.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Seasonal Calendar */}
        <section className="space-y-6">
          <h2 className="font-serif text-3xl font-bold">The Fynbos Year</h2>
          <p className="text-secondary">
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
                  <ul className="space-y-2 text-sm text-secondary">
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
          <p className="text-secondary max-w-2xl mx-auto">
            Join the Founding 100 and secure your bronze casting. Choose your path—Cast Now, 
            Wait Till Season, or Provide Your Own—and we'll create something timeless.
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

// Specimen styles data
const specimenStyles = [
  {
    id: "protea_head",
    name: "Protea Head",
    season: "Winter–Spring",
    description: "Single flower head (king/queen types). Peak June–October."
  },
  {
    id: "pincushion_bloom",
    name: "Pincushion Bloom",
    season: "Late Winter–Spring",
    description: "Leucospermum flower. Peak July–December."
  },
  {
    id: "cone_bracts",
    name: "Cone + Bracts",
    season: "Autumn–Spring",
    description: "Leucadendron cone with coloured bracts. April/May–November."
  },
  {
    id: "aloe_inflorescence",
    name: "Aloe Inflorescence",
    season: "Winter",
    description: "Segment of flower spike. Peak May–August."
  },
  {
    id: "erica_spray",
    name: "Erica Spray",
    season: "Winter–Spring",
    description: "Fine heather-like cluster. Year-round diversity, many winter–spring."
  },
  {
    id: "restio_seedheads",
    name: "Restio Seedheads",
    season: "Autumn–Winter",
    description: "Architectural reed panicles. Textural interest year-round."
  },
  {
    id: "bulb_spike",
    name: "Bulb Spike",
    season: "Spring–Early Summer",
    description: "Watsonia/ixia/gladiolus section. Peak August–December."
  },
  {
    id: "pelargonium_leaf",
    name: "Pelargonium Leaf/Flower",
    season: "Spring",
    description: "Scented leaf cluster (sometimes with blooms). September–October."
  },
  {
    id: "woody_branch",
    name: "Woody Branch + Leaves",
    season: "Year-round",
    description: "Sculptural twig with foliage (non-sappy). Availability varies."
  },
  {
    id: "cone_seedpod",
    name: "Cone/Seed Pod",
    season: "Autumn–Spring",
    description: "Serruria/cone/seedpod composition. Woody structures."
  },
  {
    id: "succulent_rosette",
    name: "Succulent Rosette",
    season: "Year-round",
    description: "Compact echeveria/aloe rosette. Pre-drying needed."
  },
  {
    id: "miniature_mix",
    name: "Miniature Mix",
    season: "All Seasons",
    description: "Small curated cluster (buds, pods, grasses). Studio-curated."
  },
];

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
