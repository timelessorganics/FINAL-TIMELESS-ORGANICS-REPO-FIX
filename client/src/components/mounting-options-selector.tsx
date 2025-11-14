import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Hammer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MountingOption {
  id: string;
  label: string;
  description: string;
  priceCents: number;
  isAvailable: boolean;
}

// Default mounting options (can be fetched from API later)
export const DEFAULT_MOUNTING_OPTIONS: MountingOption[] = [
  {
    id: "none",
    label: "No Mounting",
    description: "Bronze only - unmounted",
    priceCents: 0,
    isAvailable: true,
  },
  {
    id: "wall",
    label: "Wall Mount",
    description: "Professional wall mounting system",
    priceCents: 1000, // R10 for testing
    isAvailable: true,
  },
  {
    id: "base",
    label: "Display Base",
    description: "Wood or stone display base",
    priceCents: 1500, // R15 for testing
    isAvailable: true,
  },
  {
    id: "custom",
    label: "Custom Mounting",
    description: "Bespoke mounting solution",
    priceCents: 2500, // R25 for testing
    isAvailable: true,
  },
];

interface MountingOptionsSelectorProps {
  value: string;
  onChange: (optionId: string, priceCents: number) => void;
  options?: MountingOption[];
}

export function MountingOptionsSelector({ 
  value, 
  onChange, 
  options = DEFAULT_MOUNTING_OPTIONS 
}: MountingOptionsSelectorProps) {
  
  const handleChange = (optionId: string) => {
    const selectedOption = options.find(opt => opt.id === optionId);
    if (selectedOption) {
      onChange(optionId, selectedOption.priceCents);
    }
  };

  return (
    <div className="space-y-4">
      {/* Future Work Notice */}
      <Alert className="bg-patina/10 border-patina/30">
        <Hammer className="h-4 w-4 text-patina" />
        <AlertDescription className="text-sm text-muted-foreground">
          <strong className="text-foreground">Mounting Service:</strong> Your bronze will be cast first, then professionally 
          mounted according to your choice. This service will be completed after casting - not same-day. Mounting style details 
          (wall placement, base material, custom specs) will be discussed during production.
        </AlertDescription>
      </Alert>

      {/* Mounting Options Grid */}
      <RadioGroup value={value} onValueChange={handleChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = value === option.id;
          const priceDisplay = option.priceCents === 0 
            ? "Included" 
            : `+R${(option.priceCents / 100).toFixed(0)}`;

          return (
            <div key={option.id} className="relative">
              <RadioGroupItem
                value={option.id}
                id={`mounting-${option.id}`}
                className="sr-only"
                disabled={!option.isAvailable}
                data-testid={`radio-mounting-${option.id}`}
              />
              <Label
                htmlFor={`mounting-${option.id}`}
                className={cn(
                  "block cursor-pointer",
                  "transition-all duration-200",
                  option.isAvailable && "hover-elevate active-elevate-2",
                  !option.isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <Card
                  className={cn(
                    "border-2 transition-all",
                    isSelected
                      ? "border-patina ring-2 ring-patina/50 bg-patina/5"
                      : "border-card-border",
                    !option.isAvailable && "bg-muted"
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-semibold text-base mb-1",
                          isSelected ? "text-patina" : "text-foreground"
                        )}>
                          {option.label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="ml-3 bg-patina text-white rounded-full p-1.5 flex-shrink-0">
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

                    {/* Price Display */}
                    <div className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
                      isSelected 
                        ? "bg-patina/20 text-patina border border-patina/30" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {priceDisplay}
                    </div>

                    {!option.isAvailable && (
                      <div className="mt-3 text-xs text-muted-foreground italic">
                        Currently unavailable
                      </div>
                    )}
                  </div>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Retail Value Messaging */}
      {value !== "none" && (
        <div className="text-xs text-muted-foreground bg-accent-gold/10 rounded-lg p-4 border border-accent-gold/20">
          <p className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-accent-gold" />
            Investment Value
          </p>
          <p>
            Mounted and patinated bronze pieces from our studio typically sell for <strong className="text-foreground">R25,000-R40,000</strong>. 
            Your Founding 100 investment includes exceptional value.
          </p>
        </div>
      )}
    </div>
  );
}
