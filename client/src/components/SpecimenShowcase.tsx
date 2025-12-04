import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, X, ZoomIn, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { specimenStyles, getCurrentSeason, getAvailabilitySymbol, type SpecimenStyle } from "@/lib/specimenAvailability";

// Map admin panel IDs (underscores) to specimenStyles IDs (hyphens)
const adminToStyleId: Record<string, string> = {
  'cones_bracts_seedpods': 'cones-bracts-seedpods',
  'protea_pincushion_blooms_heads': 'protea-pincushion-blooms',
  'bulb_spikes': 'bulb-spikes',
  'branches_leaves': 'branches-leaves',
  'aloe_inflorescence_heads': 'aloe-inflorescence',
  'flower_heads': 'flower-heads',
  'erica_sprays': 'erica-sprays',
  'restios_seedheads_grasses': 'restios-grasses',
  'small_succulents': 'small-succulents',
};

// Import specimen images from assets/specimens folder
import conebracts1 from "../assets/specimens/cone-bracts-1.jpg";
import conebracts2 from "../assets/specimens/cone-bracts-2.jpg";
import conebracts3 from "../assets/specimens/cone-bracts-3.jpg";
import coneseed1 from "../assets/specimens/cone-seed-1.jpg";
import coneseed2 from "../assets/specimens/cone-seed-2.jpg";
import coneseed3 from "../assets/specimens/cone-seed-3.jpg";

import proteahead1 from "../assets/specimens/protea-head-1.jpg";
import proteahead2 from "../assets/specimens/protea-head-2.jpg";
import proteahead3 from "../assets/specimens/protea-head-3.jpg";
import pincushion1 from "../assets/specimens/pincushion-1.jpg";
import pincushion2 from "../assets/specimens/pincushion-2.jpg";
import pincushion3 from "../assets/specimens/pincushion-3.jpg";

import bulbspike1 from "../assets/specimens/bulb-spike-1.jpg";
import bulbspike2 from "../assets/specimens/bulb-spike-2.jpg";
import bulbspike3 from "../assets/specimens/bulb-spike-3.jpg";

import woodybranch1 from "../assets/specimens/woody-branch-1.jpg";
import woodybranch2 from "../assets/specimens/woody-branch-2.jpg";
import woodybranch3 from "../assets/specimens/woody-branch-3.jpg";

import aloe1 from "../assets/specimens/aloe-1.jpg";
import aloe2 from "../assets/specimens/aloe-2.jpg";
import aloe3 from "../assets/specimens/aloe-3.jpg";

import pelargonium1 from "../assets/specimens/pelargonium-1.jpg";
import pelargonium2 from "../assets/specimens/pelargonium-2.jpg";
import erica1 from "../assets/specimens/erica-1.jpg";

import erica2 from "../assets/specimens/erica-2.jpg";
import pincushion4 from "../assets/specimens/pincushion-4.jpg";
import proteahead4 from "../assets/specimens/protea-head-4.jpg";

import restio1 from "../assets/specimens/restio-1.jpg";
import restio2 from "../assets/specimens/restio-2.jpg";
import restio3 from "../assets/specimens/restio-3.jpg";

import succulent1 from "../assets/specimens/succulent-1.jpg";
import succulent2 from "../assets/specimens/succulent-2.jpg";
import succulent3 from "../assets/specimens/succulent-3.jpg";

// Bronze images (existing in attached_assets)
import proteaBronze1 from "@assets/Gemini_Generated_Image_dx6keedx6keedx6k_result_1764291106964.webp";
import proteaBronze2 from "@assets/Gemini_Generated_Image_qhu6lzqhu6lzqhu6_result_1764291106964.webp";
import proteaBronze3 from "@assets/Gemini_Generated_Image_ie60w2ie60w2ie60_result_1764291291740.webp";

interface SpecimenImage {
  plant: string;
  bronze: string;
}

// Map specimen styles to their images (3 examples each)
const specimenImages: Record<string, SpecimenImage[]> = {
  'cones-bracts-seedpods': [
    { plant: conebracts1, bronze: coneseed1 },
    { plant: conebracts2, bronze: coneseed2 },
    { plant: conebracts3, bronze: coneseed3 },
  ],
  'protea-pincushion-blooms': [
    { plant: proteahead1, bronze: proteaBronze1 },
    { plant: pincushion1, bronze: proteaBronze2 },
    { plant: proteahead2, bronze: proteaBronze3 },
  ],
  'bulb-spikes': [
    { plant: bulbspike1, bronze: bulbspike2 },
    { plant: bulbspike2, bronze: bulbspike3 },
    { plant: bulbspike3, bronze: bulbspike1 },
  ],
  'branches-leaves': [
    { plant: woodybranch1, bronze: woodybranch2 },
    { plant: woodybranch2, bronze: woodybranch3 },
    { plant: woodybranch3, bronze: woodybranch1 },
  ],
  'aloe-inflorescence': [
    { plant: aloe1, bronze: aloe2 },
    { plant: aloe2, bronze: aloe3 },
    { plant: aloe3, bronze: aloe1 },
  ],
  'flower-heads': [
    { plant: pelargonium1, bronze: pelargonium2 },
    { plant: pelargonium2, bronze: erica1 },
    { plant: proteahead3, bronze: proteaBronze1 },
  ],
  'erica-sprays': [
    { plant: erica1, bronze: erica2 },
    { plant: erica2, bronze: pincushion4 },
    { plant: pincushion2, bronze: proteahead4 },
  ],
  'restios-grasses': [
    { plant: restio1, bronze: restio2 },
    { plant: restio2, bronze: restio3 },
    { plant: restio3, bronze: restio1 },
  ],
  'small-succulents': [
    { plant: succulent1, bronze: succulent2 },
    { plant: succulent2, bronze: succulent3 },
    { plant: succulent3, bronze: succulent1 },
  ],
};

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

        {/* Gradient fade overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`} />

        {/* Zoom icon */}
        <div className={`absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <ZoomIn className="w-4 h-4 text-white" />
        </div>

        {/* Hover label */}
        <div className={`absolute bottom-3 left-3 right-3 text-white text-xs font-medium transition-opacity duration-1000 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          Bronze Casting - Click to enlarge
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 border-bronze/30 bg-background/95 backdrop-blur-xl">
          <div className="relative">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
              data-testid="button-close-lightbox"
            >
              <X className="w-5 h-5" />
            </button>
            
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

            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={lightboxImage === "plant" ? plant : bronze}
                alt={lightboxImage === "plant" ? "Plant specimen" : "Bronze casting"}
                className="w-full h-full object-contain bg-black/90 transition-opacity duration-500"
              />
            </div>
            
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

// Get season display from current season availability
function getSeasonDisplay(style: SpecimenStyle): string {
  const seasons = [];
  if (style.winter === 'peak' || style.winter === 'good') seasons.push('Winter');
  if (style.spring === 'peak' || style.spring === 'good') seasons.push('Spring');
  if (style.summer === 'peak' || style.summer === 'good') seasons.push('Summer');
  if (style.autumn === 'peak' || style.autumn === 'good') seasons.push('Autumn');
  
  if (seasons.length === 4) return 'Year-round';
  if (seasons.length === 0) return 'Limited availability';
  return seasons.join('-');
}

export default function SpecimenShowcase() {
  const currentSeason = getCurrentSeason();
  
  // Fetch admin-uploaded custom images
  const { data: customizations } = useQuery<Array<{ specimenKey: string; imageUrl: string }>>({
    queryKey: ["/api/specimen-customizations"],
  });
  
  // Build map of styleId -> { plants: string[], bronzes: string[] } from customizations
  // Admin uploads use keys like: cones_bracts_seedpods_plant, cones_bracts_seedpods_bronze, 
  // or with index suffix: cones_bracts_seedpods_plant_1, cones_bracts_seedpods_bronze_1
  const customImageArrays: Record<string, { plants: string[]; bronzes: string[] }> = {};
  if (customizations) {
    customizations.forEach((c) => {
      // Parse the key: {baseKey}_(plant|bronze) or {baseKey}_(plant|bronze)_\d+
      const match = c.specimenKey.match(/^(.+?)_(plant|bronze)(?:_\d+)?$/);
      if (match) {
        const [, baseKey, imageType] = match;
        const styleId = adminToStyleId[baseKey] || baseKey;
        if (!customImageArrays[styleId]) {
          customImageArrays[styleId] = { plants: [], bronzes: [] };
        }
        if (imageType === 'plant') {
          customImageArrays[styleId].plants.push(c.imageUrl);
        } else {
          customImageArrays[styleId].bronzes.push(c.imageUrl);
        }
      } else {
        // Legacy: single image key without _plant/_bronze suffix
        const styleId = adminToStyleId[c.specimenKey] || c.specimenKey;
        if (c.imageUrl) {
          if (!customImageArrays[styleId]) {
            customImageArrays[styleId] = { plants: [], bronzes: [] };
          }
          customImageArrays[styleId].plants.push(c.imageUrl);
          customImageArrays[styleId].bronzes.push(c.imageUrl);
        }
      }
    });
  }

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-serif text-3xl font-bold">See the Transformation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Hover over each specimen to see how we transform living botanical forms into timeless bronze sculptures.
          The same delicate detail, preserved forever.
        </p>
        <p className="text-sm text-bronze">
          Current Season: {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} (Cape Town)
        </p>
      </div>

      {/* Specimen Grid - 9 styles with 3 examples each */}
      <div className="space-y-12">
        {specimenStyles.map((style, index) => {
          // Use adminToStyleId mapping for consistent lookups (admin keys → style IDs)
          const mappedId = adminToStyleId[style.id];
          const hyphenId = style.id.replace(/_/g, '-');
          // Use admin-uploaded images, mixing with defaults if only partial upload
          const customArrays = customImageArrays[style.id] || customImageArrays[mappedId] || customImageArrays[hyphenId];
          const defaultImages = specimenImages[mappedId] || specimenImages[hyphenId] || specimenImages[style.id] || [];
          
          // Build images array: pair plants with bronzes from admin uploads
          let images: SpecimenImage[];
          if (customArrays && (customArrays.plants.length > 0 || customArrays.bronzes.length > 0)) {
            // Build pairs from admin uploads - match plant[i] with bronze[i]
            const maxPairs = Math.max(customArrays.plants.length, customArrays.bronzes.length, 3);
            const firstDefault = defaultImages[0] || { plant: '', bronze: '' };
            images = [];
            for (let i = 0; i < Math.min(maxPairs, 3); i++) {
              images.push({
                plant: customArrays.plants[i] || firstDefault.plant,
                bronze: customArrays.bronzes[i] || firstDefault.bronze,
              });
            }
          } else {
            images = defaultImages;
          }
          
          const seasonAvailability = style[currentSeason];
          const availabilitySymbol = getAvailabilitySymbol(seasonAvailability);
          
          return (
            <div key={style.id}>
              <Card
                className="border-bronze/30 hover-elevate overflow-hidden"
                data-testid={`card-specimen-${style.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="text-2xl text-bronze">{style.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-lg" title={`Current availability: ${seasonAvailability}`}>
                        {availabilitySymbol}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        seasonAvailability === 'peak' ? 'bg-bronze/20 text-bronze' :
                        seasonAvailability === 'good' ? 'bg-patina/20 text-patina' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {seasonAvailability === 'peak' ? 'Peak Season' : 
                         seasonAvailability === 'good' ? 'Available' : 'Limited'}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-sm mt-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{getSeasonDisplay(style)}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{style.description}</p>

                  {/* Images - 3 examples per style with hover effect */}
                  {images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      {images.map((img, imgIndex) => (
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

              {/* Invest Now CTA - appears after every 3rd specimen */}
              {(index + 1) % 3 === 0 && index < specimenStyles.length - 1 && (
                <div className="py-8 text-center">
                  <div className="inline-flex flex-col items-center gap-3 px-8 py-6 rounded-lg bg-bronze/5 border border-bronze/20">
                    <p className="text-sm text-muted-foreground">Ready to secure your place?</p>
                    <Link href="/founding-100">
                      <Button 
                        size="lg" 
                        className="gap-2 bg-gradient-to-r from-bronze via-accent-gold to-bronze bg-[length:200%_100%] animate-shimmer border border-bronze/50 text-background font-semibold"
                        data-testid={`button-invest-now-${index}`}
                      >
                        Invest Now
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">Only 100 founding seats available</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
