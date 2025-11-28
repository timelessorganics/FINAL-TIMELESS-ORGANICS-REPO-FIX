import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, X, ZoomIn } from "lucide-react";

// Plant images (real specimens)
import proteaPlant1 from "@assets/2d64bb2fe63096b1f16475d4cf59a842_result_1764290952462.jpg";
import proteaPlant2 from "@assets/Carnival-Red-copy_result_1764291106963.jpg";
import proteaPlant3 from "@assets/Comparison-of-Leucospermum-gracile-and-prostratum-8-1_result_1764291106964.jpg";

// Bronze versions (cast specimens)
import proteaBronze1 from "@assets/Gemini_Generated_Image_dx6keedx6keedx6k_result_1764291106964.webp";
import proteaBronze2 from "@assets/Gemini_Generated_Image_qhu6lzqhu6lzqhu6_result_1764291106964.webp";
import proteaBronze3 from "@assets/Gemini_Generated_Image_ie60w2ie60w2ie60_result_1764291291740.webp";

interface SpecimenImage {
  plant: string;
  bronze: string;
}

interface SpecimenType {
  name: string;
  season: string;
  description: string;
  images: SpecimenImage[];
}

const specimenTypes: SpecimenType[] = [
  {
    name: "Protea / Pincushion Blooms / Heads",
    season: "Winter-Spring",
    description: "Single flower head (Sunguineum types) & Leucospermum flowers. Peak June-December.",
    images: [
      { plant: proteaPlant1, bronze: proteaBronze1 },
      { plant: proteaPlant2, bronze: proteaBronze2 },
      { plant: proteaPlant3, bronze: proteaBronze3 },
    ],
  },
  {
    name: "Cones / Bracts / Seedpods",
    season: "Autumn-Spring",
    description: "Leucadendron cone with coloured bracts. April/May-November.",
    images: [],
  },
  {
    name: "Bulb Spikes",
    season: "Spring-Early Summer",
    description: "Watsonia/Nivikia/Gladiolus section. Peak August-December.",
    images: [],
  },
  {
    name: "Branches + Leaves",
    season: "Year-round",
    description: "Sculptural twig with foliage (non-sappy). Availability varies.",
    images: [],
  },
  {
    name: "Aloe Inflorescence Heads",
    season: "Winter",
    description: "Segment of flower spike. Peak May-August.",
    images: [],
  },
  {
    name: "Flower Heads",
    season: "Late Winter-Spring",
    description: "Fine heather-like cluster & general bloom forms.",
    images: [],
  },
  {
    name: "Erica Sprays",
    season: "Winter-Spring",
    description: "Fine heather-like cluster. Year-round diversity, many winter-spring.",
    images: [],
  },
  {
    name: "Restios / Seedheads / Grasses",
    season: "Autumn-Winter",
    description: "Architectural reed panicles. Textural interest year-round.",
    images: [],
  },
  {
    name: "Small Succulents",
    season: "Year-round",
    description: "Compact echeveria/aloe rosette & miniature forms. Pre-drying needed.",
    images: [],
  },
];

// Hover image component with fade effect and click-to-lightbox
function HoverBronzeImage({ plant, bronze }: SpecimenImage) {
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<"plant" | "bronze">("bronze");

  const openLightbox = () => {
    setLightboxImage(isHovered ? "bronze" : "plant");
    setLightboxOpen(true);
  };

  return (
    <>
      <div
        className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border border-bronze/20 bg-card cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openLightbox}
        data-testid="specimen-hover-image"
      >
        {/* Plant image (base layer) */}
        <img
          src={plant}
          alt="Plant specimen"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Bronze image (overlay, fades in on hover) */}
        <img
          src={bronze}
          alt="Bronze casting"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Gradient fade overlay (like hero) for text readability */}
        <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />

        {/* Zoom icon - always visible on hover */}
        <div className={`absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <ZoomIn className="w-4 h-4 text-white" />
        </div>

        {/* Hover label - fades in with bronze */}
        <div className={`absolute bottom-3 left-3 right-3 text-white text-xs font-medium transition-opacity duration-1000 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          Bronze Casting - Click to enlarge
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 border-bronze/30 bg-background/95 backdrop-blur-xl">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
              data-testid="button-close-lightbox"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Toggle buttons */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={() => setLightboxImage("plant")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-colors ${
                  lightboxImage === "plant" 
                    ? "bg-patina text-white" 
                    : "bg-black/50 text-white/70 hover:bg-black/70"
                }`}
                data-testid="button-lightbox-plant"
              >
                Plant
              </button>
              <button
                onClick={() => setLightboxImage("bronze")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-colors ${
                  lightboxImage === "bronze" 
                    ? "bg-bronze text-white" 
                    : "bg-black/50 text-white/70 hover:bg-black/70"
                }`}
                data-testid="button-lightbox-bronze"
              >
                Bronze
              </button>
            </div>

            {/* Image with smooth transition */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={lightboxImage === "plant" ? plant : bronze}
                alt={lightboxImage === "plant" ? "Plant specimen" : "Bronze casting"}
                className="w-full h-full object-contain bg-black/90 transition-opacity duration-500"
              />
            </div>
            
            {/* Caption */}
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">
                {lightboxImage === "plant" 
                  ? "Original botanical specimen at peak seasonal beauty" 
                  : "Hand-cast bronze sculpture preserving every detail"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SpecimenShowcase() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl font-bold">See the Transformation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hover over each specimen to see how we transform living botanical forms into timeless bronze sculptures.
          The same delicate detail, preserved forever.
        </p>
      </div>

      {/* Specimen Grid - Bigger cards */}
      <div className="space-y-12">
        {specimenTypes.map((specimen, index) => (
          <Card
            key={index}
            className="border-bronze/30 hover-elevate overflow-hidden"
            data-testid={`card-specimen-${index}`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-bronze">{specimen.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm mt-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{specimen.season}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{specimen.description}</p>

              {/* Images - Much bigger, hover effect */}
              {specimen.images && specimen.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {specimen.images.map((img, imgIndex) => (
                    <HoverBronzeImage key={imgIndex} plant={img.plant} bronze={img.bronze} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg border border-bronze/20 bg-muted flex items-center justify-center"
                    >
                      <span className="text-xs text-muted-foreground">Coming Soon</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-bronze/5 border border-bronze/20 rounded-lg p-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong>Plant to Bronze Journey:</strong> Each specimen is carefully selected at peak seasonal beauty, 
          then cast using our precision foundry process. The result is a one-of-a-kind sculpture that captures 
          nature's intricate detail in permanent form.
        </p>
      </div>
    </section>
  );
}
