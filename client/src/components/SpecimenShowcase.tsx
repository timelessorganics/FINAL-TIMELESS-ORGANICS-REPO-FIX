import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import pincushion1 from "../assets/specimens/pincushion-1.jpg";
import pincushion2 from "../assets/specimens/pincushion-2.jpg";
import pincushion3 from "../assets/specimens/pincushion-3.jpg";
import pincushion4 from "../assets/specimens/pincushion-4.jpg";
import pincushion5 from "../assets/specimens/pincushion-5.jpg";
import pincushion6 from "../assets/specimens/pincushion-6.jpg";
import proteaHead1 from "../assets/specimens/protea-head-1.jpg";
import proteaHead2 from "../assets/specimens/protea-head-2.jpg";
import proteaHead3 from "../assets/specimens/protea-head-3.jpg";
import proteaHead4 from "../assets/specimens/protea-head-4.jpg";
import proteaHead5 from "../assets/specimens/protea-head-5.jpg";
import proteaHead6 from "../assets/specimens/protea-head-6.jpg";
import coneBracts1 from "../assets/specimens/cone-bracts-1.jpg";
import coneBracts2 from "../assets/specimens/cone-bracts-2.jpg";
import coneBracts3 from "../assets/specimens/cone-bracts-3.jpg";
import coneBracts4 from "../assets/specimens/cone-bracts-4.jpg";
import coneBracts5 from "../assets/specimens/cone-bracts-5.jpg";
import coneBracts6 from "../assets/specimens/cone-bracts-6.jpg";
import aloe1 from "../assets/specimens/aloe-1.jpg";
import aloe2 from "../assets/specimens/aloe-2.jpg";
import aloe3 from "../assets/specimens/aloe-3.jpg";
import aloe4 from "../assets/specimens/aloe-4.jpg";
import aloe5 from "../assets/specimens/aloe-5.jpg";
import erica1 from "../assets/specimens/erica-1.jpg";
import erica2 from "../assets/specimens/erica-2.jpg";
import restio1 from "../assets/specimens/restio-1.jpg";
import restio2 from "../assets/specimens/restio-2.jpg";
import restio3 from "../assets/specimens/restio-3.jpg";
import bulbSpike1 from "../assets/specimens/bulb-spike-1.jpg";
import bulbSpike2 from "../assets/specimens/bulb-spike-2.jpg";
import bulbSpike3 from "../assets/specimens/bulb-spike-3.jpg";
import bulbSpike4 from "../assets/specimens/bulb-spike-4.jpg";
import bulbSpike5 from "../assets/specimens/bulb-spike-5.jpg";
import pelargonium1 from "../assets/specimens/pelargonium-1.jpg";
import pelargonium2 from "../assets/specimens/pelargonium-2.jpg";
import woodyBranch1 from "../assets/specimens/woody-branch-1.jpg";
import woodyBranch2 from "../assets/specimens/woody-branch-2.jpg";
import woodyBranch3 from "../assets/specimens/woody-branch-3.jpg";
import woodyBranch4 from "../assets/specimens/woody-branch-4.jpg";
import coneSeed1 from "../assets/specimens/cone-seed-1.jpg";
import coneSeed2 from "../assets/specimens/cone-seed-2.jpg";
import coneSeed3 from "../assets/specimens/cone-seed-3.jpg";
import succulent1 from "../assets/specimens/succulent-1.jpg";
import succulent2 from "../assets/specimens/succulent-2.jpg";
import succulent3 from "../assets/specimens/succulent-3.jpg";
import succulent4 from "../assets/specimens/succulent-4.jpg";
import succulent5 from "../assets/specimens/succulent-5.jpg";
import miniatureMix1 from "../assets/specimens/miniature-mix-1.jpg";

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
    images: [proteaHead1, proteaHead2, proteaHead3, proteaHead4, proteaHead5, proteaHead6],
  },
  {
    name: "Pincushion Bloom",
    season: "Late Winter-Spring",
    description: "Leucospermum flower. Peak July-December.",
    images: [pincushion1, pincushion2, pincushion3, pincushion4, pincushion5, pincushion6],
  },
  {
    name: "Cone + Bracts",
    season: "Autumn-Spring",
    description: "Leucadendron cone with coloured bracts. April/May-November.",
    images: [coneBracts1, coneBracts2, coneBracts3, coneBracts4, coneBracts5, coneBracts6],
  },
  {
    name: "Aloe Inflorescence",
    season: "Winter",
    description: "Segment of flower spike. Peak May-August.",
    images: [aloe1, aloe2, aloe3, aloe4, aloe5],
  },
  {
    name: "Erica Spray",
    season: "Winter-Spring",
    description: "Fine heather-like cluster. Year-round diversity, many winter-spring.",
    images: [erica1, erica2],
  },
  {
    name: "Restio Seedheads",
    season: "Autumn-Winter",
    description: "Architectural reed panicles. Textural interest year-round.",
    images: [restio1, restio2, restio3],
  },
  {
    name: "Bulb Spike",
    season: "Spring-Early Summer",
    description: "Watsonia/Nivikia/Gladiolus section. Peak August-December.",
    images: [bulbSpike1, bulbSpike2, bulbSpike3, bulbSpike4, bulbSpike5],
  },
  {
    name: "Pelargonium Leaf/Flower",
    season: "Spring",
    description: "Scented leaf cluster (sometimes with blooms). September-October.",
    images: [pelargonium1, pelargonium2],
  },
  {
    name: "Woody Branch + Leaves",
    season: "Year-round",
    description: "Sculptural twig with foliage (non-sappy). Availability varies.",
    images: [woodyBranch1, woodyBranch2, woodyBranch3, woodyBranch4],
  },
  {
    name: "Cone/Seed Pod",
    season: "Autumn-Spring",
    description: "Serruria/cone/seedpod composition. Woody structures.",
    images: [coneSeed1, coneSeed2, coneSeed3],
  },
  {
    name: "Succulent Rosette",
    season: "Year-round",
    description: "Compact echeveria/aloe rosette. Pre-drying needed.",
    images: [succulent1, succulent2, succulent3, succulent4, succulent5],
  },
  {
    name: "Miniature Mix",
    season: "All Seasons",
    description: "Small curated cluster (buds, pods, grasses). Studio-curated.",
    images: [miniatureMix1],
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
            className="hover-elevate"
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

              {/* Example Images */}
              {specimen.images && specimen.images.length > 0 && (
                <div className="mt-4 border-t border-bronze/10 pt-3 space-y-2">
                  <p className="text-xs text-bronze/70 font-medium">Example specimens:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {specimen.images.map((img, imgIndex) => (
                      <div 
                        key={imgIndex}
                        className="aspect-square rounded overflow-hidden border border-bronze/20"
                      >
                        <img 
                          src={img} 
                          alt={`${specimen.name} example ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
