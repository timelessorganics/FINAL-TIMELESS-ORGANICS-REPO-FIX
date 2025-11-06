import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import pincushionImg1 from "../assets/Leucospermum-prostratum-6-1_1762380839587.jpg";
import pincushionImg2 from "../assets/Comparison-of-Leucospermum-gracile-and-prostratum-8-1_1762380839588.jpg";

interface SpecimenType {
  name: string;
  season: string;
  description: string;
  images?: string[];
}

const specimenTypes: SpecimenType[] = [
  {
    name: "Protea Head",
    season: "Winter-Spring",
    description: "Single flower head (Sunguineum types). Peak June-October.",
    images: [],
  },
  {
    name: "Pincushion Bloom",
    season: "Late Winter-Spring",
    description: "Leucospermum flower. Peak July-December.",
    images: [pincushionImg1, pincushionImg2],
  },
  {
    name: "Cone + Bracts",
    season: "Autumn-Spring",
    description: "Leucadendron cone with coloured bracts. April/May-November.",
    images: [],
  },
  {
    name: "Aloe Inflorescence",
    season: "Winter",
    description: "Segment of flower spike. Peak May-August.",
    images: [],
  },
  {
    name: "Erica Spray",
    season: "Winter-Spring",
    description: "Fine heather-like cluster. Year-round diversity, many winter-spring.",
    images: [],
  },
  {
    name: "Restio Seedheads",
    season: "Autumn-Winter",
    description: "Architectural reed panicles. Textural interest year-round.",
    images: [],
  },
  {
    name: "Bulb Spike",
    season: "Spring-Early Summer",
    description: "Watsonia/Nivikia/Gladiolus section. Peak August-December.",
    images: [],
  },
  {
    name: "Pelargonium Leaf/Flower",
    season: "Spring",
    description: "Scented leaf cluster (sometimes with blooms). September-October.",
    images: [],
  },
  {
    name: "Woody Branch + Leaves",
    season: "Year-round",
    description: "Sculptural twig with foliage (non-sappy). Availability varies.",
    images: [],
  },
  {
    name: "Cone/Seed Pod",
    season: "Autumn-Spring",
    description: "Serruria/cone/seedpod composition. Woody structures.",
    images: [],
  },
  {
    name: "Succulent Rosette",
    season: "Year-round",
    description: "Compact echeveria/aloe rosette. Pre-drying needed.",
    images: [],
  },
  {
    name: "Miniature Mix",
    season: "All Seasons",
    description: "Small curated cluster (buds, pods, grasses). Studio-curated.",
    images: [],
  },
];

export default function SpecimenShowcase() {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl font-bold">Specimen Styles</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Instead of naming exact species, we group botanicals by their visual form. 
          This gives you creative freedom while ensuring we can source A-grade material when the season opens.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {specimenTypes.map((specimen, index) => (
          <Card 
            key={index} 
            className="group relative hover-elevate transition-all duration-300 overflow-visible"
            data-testid={`card-specimen-${index}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-bronze flex items-center gap-2">
                {specimen.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <Calendar className="w-3 h-3" />
                {specimen.season}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {specimen.description}
              </p>

              {/* Example Images - Simple Display with Hover Enlarge */}
              {specimen.images && specimen.images.length > 0 && (
                <div className="mt-4 border-t border-bronze/10 pt-3 space-y-2">
                  <p className="text-xs text-bronze/70 font-medium">Example specimens:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {specimen.images.map((img, imgIndex) => (
                      <div 
                        key={imgIndex}
                        className="group/img relative aspect-square rounded overflow-hidden border border-bronze/20 cursor-pointer hover:border-bronze/40 transition-all"
                      >
                        <img 
                          src={img} 
                          alt={`${specimen.name} example ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Enlarged version on hover - floats above card */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/img:opacity-100 pointer-events-none transition-opacity duration-200 z-[200]">
                          <div className="w-[400px] h-[400px] rounded-lg overflow-hidden border-4 border-bronze shadow-2xl">
                            <img 
                              src={img} 
                              alt={`${specimen.name} enlarged`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-bronze/60 mt-1 italic">Hover any image to enlarge</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
