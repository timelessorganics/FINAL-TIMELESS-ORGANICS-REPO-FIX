import { useState } from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Eye } from "lucide-react";

const SPECIMEN_STYLES = [
  "cones_bracts_seedpods",
  "protea_pincushion_blooms_heads",
  "bulb_spikes",
  "branches_leaves",
  "aloe_inflorescence_heads",
  "flower_heads",
  "erica_sprays",
  "restios_seedheads_grasses",
  "small_succulents",
];

const SPECIMEN_NAMES: Record<string, string> = {
  cones_bracts_seedpods: "Cones, Bracts & Seedpods",
  protea_pincushion_blooms_heads: "Protea Pincushion Blooms",
  bulb_spikes: "Bulb Spikes",
  branches_leaves: "Branches & Leaves",
  aloe_inflorescence_heads: "Aloe Inflorescence",
  flower_heads: "Flower Heads",
  erica_sprays: "Erica Sprays",
  restios_seedheads_grasses: "Restios & Seedheads",
  small_succulents: "Small Succulents",
};

export default function SpecimenManager() {
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    const stored = sessionStorage.getItem("specimenCustomImages");
    return stored ? JSON.parse(stored) : {};
  });

  const handleImageUpload = (style: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const updated = { ...customImages, [style]: dataUrl };
      setCustomImages(updated);
      sessionStorage.setItem("specimenCustomImages", JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (style: string) => {
    const updated = { ...customImages };
    delete updated[style];
    setCustomImages(updated);
    sessionStorage.setItem("specimenCustomImages", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setCustomImages({});
    sessionStorage.removeItem("specimenCustomImages");
  };

  return (
    <>
      <Header />
      <main className="relative z-50 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-light mb-2">Specimen Image Manager</h1>
            <p className="text-muted-foreground">
              Upload custom images for each specimen style to test the gallery. Images are stored temporarily in your browser session.
            </p>
          </div>

          <div className="mb-6 flex gap-3">
            <Button
              onClick={() => window.open("/founding-100", "_blank")}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="button-view-gallery"
            >
              <Eye className="w-4 h-4" />
              View Gallery in New Tab
            </Button>
            {Object.keys(customImages).length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="flex items-center gap-2"
                data-testid="button-clear-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Images
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIMEN_STYLES.map((style) => (
              <Card key={style} className="overflow-hidden" data-testid={`card-${style}`}>
                <div className="aspect-square relative bg-muted overflow-hidden">
                  {customImages[style] ? (
                    <img
                      src={customImages[style]}
                      alt={SPECIMEN_NAMES[style]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">No image uploaded</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium mb-3 text-sm">{SPECIMEN_NAMES[style]}</h3>

                  <div className="flex gap-2">
                    <label className="flex-1">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer flex items-center gap-2"
                        data-testid={`button-upload-${style}`}
                      >
                        <span className="cursor-pointer flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(style, e.target.files[0]);
                            }
                          }}
                        />
                      </Button>
                    </label>

                    {customImages[style] && (
                      <Button
                        onClick={() => handleClearImage(style)}
                        variant="ghost"
                        size="sm"
                        data-testid={`button-clear-${style}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {customImages[style] && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      ✓ Custom image loaded
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg border">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Upload an image for each specimen style above</li>
              <li>Images are stored in your browser session (temporary)</li>
              <li>Click "View Gallery in New Tab" to see your custom images in the gallery</li>
              <li>Images will be shown until you clear them or close your browser</li>
              <li>Refresh the page and upload again if needed</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
