import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// AI Preview images mapped to new 9 specimen styles  
// These are AI-generated concept renders - the foundry fires haven't been lit yet!
const SPECIMEN_IMAGES: Record<string, string> = {
  cones_bracts_seedpods: new URL("../../attached_assets/Gemini_Generated_Image_t5zvs6t5zvs6t5zv_1761271985175.png", import.meta.url).href,
  protea_pincushion_blooms_heads: new URL("../../attached_assets/Gemini_Generated_Image_f90dtof90dtof90d_1761271985176.png", import.meta.url).href,
  bulb_spikes: new URL("../../attached_assets/Gemini_Generated_Image_r45js4r45js4r45j_1761271985177.png", import.meta.url).href,
  branches_leaves: new URL("../../attached_assets/Gemini_Generated_Image_r7x3y8r7x3y8r7x3_1761271985178.png", import.meta.url).href,
  aloe_inflorescence_heads: new URL("../../attached_assets/Gemini_Generated_Image_an1l12an1l12an1l_1761271985175.png", import.meta.url).href,
  flower_heads: new URL("../../attached_assets/Gemini_Generated_Image_9rrlvn9rrlvn9rrl (1)_1761271985174.png", import.meta.url).href,
  erica_sprays: new URL("../../attached_assets/Gemini_Generated_Image_daxzjqdaxzjqdaxz_1761271985176.png", import.meta.url).href,
  restios_seedheads_grasses: new URL("../../attached_assets/Gemini_Generated_Image_qey8v1qey8v1qey8 (1)_1761271985177.png", import.meta.url).href,
  small_succulents: new URL("../../attached_assets/Gemini_Generated_Image_9rrlvn9rrlvn9rrl_1761271985179.png", import.meta.url).href,
};

interface SpecimenOption {
  value: string;
  label: string;
  description?: string;
}

interface VisualSpecimenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: SpecimenOption[];
  error?: string;
}

export function VisualSpecimenSelector({ value, onChange, options, error }: VisualSpecimenSelectorProps) {
  return (
    <div className="space-y-4">
      {/* AI Image Disclaimer */}
      <Alert className="bg-bronze/10 border-bronze/30">
        <Sparkles className="h-4 w-4 text-bronze" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong className="text-foreground">Preview Images:</strong> These are AI-generated concept renders showing 
          specimen styles and mounting possibilities. The foundry fires haven't been lit yet! Your actual bronze 
          casting will be unique to your specific specimen.
        </AlertDescription>
      </Alert>

      {/* Visual Grid Selector */}
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {options.map((option) => {
          const imageUrl = SPECIMEN_IMAGES[option.value];
          const isSelected = value === option.value;

          return (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="sr-only"
                data-testid={`radio-specimen-${option.value}`}
              />
              <Label
                htmlFor={option.value}
                className={cn(
                  "block cursor-pointer",
                  "transition-all duration-200",
                  "hover-elevate active-elevate-2"
                )}
              >
                <Card
                  className={cn(
                    "overflow-hidden border-2 transition-all",
                    isSelected
                      ? "border-bronze ring-2 ring-bronze/50"
                      : "border-card-border hover:border-bronze/50"
                  )}
                >
                  {/* Image Preview */}
                  <div className="aspect-square relative overflow-hidden bg-card-background">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={option.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-bronze text-white rounded-full p-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className={cn(
                    "p-3 text-center border-t transition-colors",
                    isSelected ? "bg-bronze/10 border-bronze/30" : "bg-card border-card-border"
                  )}>
                    <p className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-bronze" : "text-foreground"
                    )}>
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    )}
                  </div>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <Info className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground bg-card/50 rounded-lg p-4 border border-border">
        <p className="font-medium text-foreground mb-2">About Specimen Selection:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>David personally selects the finest specimen of your chosen style</li>
          <li>Castings occur when specimens reach peak seasonal beauty</li>
          <li>Each bronze is unique - no two pieces are identical</li>
          <li>All pieces are sand/glass bead-blasted (patina available as add-on)</li>
        </ul>
      </div>
    </div>
  );
}
