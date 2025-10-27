import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import type { Sculpture, Purchase } from "@shared/schema";
import { useState } from "react";

interface SculptureGalleryProps {
  purchaseId: string;
}

export default function SculptureGallery({ purchaseId }: SculptureGalleryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: sculptures, isLoading } = useQuery<Sculpture[]>({
    queryKey: ["/api/sculptures"],
  });

  const { data: purchase } = useQuery<Purchase>({
    queryKey: ["/api/purchase", purchaseId],
  });

  const selectionMutation = useMutation({
    mutationFn: async (sculptureId: string) => {
      return await apiRequest("POST", "/api/sculpture-selection", {
        purchaseId,
        sculptureId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Selection Confirmed",
        description: "Your sculpture choice has been saved!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase", purchaseId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Selection Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSelection = () => {
    if (selectedId) {
      selectionMutation.mutate(selectedId);
    }
  };

  // Filter sculptures based on seat type
  const availableSculptures = sculptures?.filter(
    (s) => !s.availableFor || s.availableFor === purchase?.seatType
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-7 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="kicker mb-3">YOUR BRONZE SELECTION</div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="moving-fill">Cutting</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select one of our studio-approved botanical specimens for your guaranteed bronze casting.
              Each piece is carefully preserved using traditional lost-wax methods.
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
            {availableSculptures?.map((sculpture) => (
              <div
                key={sculpture.id}
                className={`${sculpture.isBronze ? "bronze-piece" : ""} cursor-pointer`}
                onClick={() => setSelectedId(sculpture.id)}
                data-testid={`sculpture-${sculpture.id}`}
              >
                <Card
                  className={`overflow-hidden transition-all duration-300 ${
                    selectedId === sculpture.id
                      ? "ring-2 ring-bronze ring-offset-2 ring-offset-background"
                      : "hover-elevate"
                  }`}
                >
                  <img
                    src={sculpture.imageUrl}
                    alt={sculpture.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-lg mb-1 text-foreground">
                      {sculpture.name}
                    </h3>
                    {sculpture.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {sculpture.description}
                      </p>
                    )}
                    {sculpture.isBronze && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-bronze uppercase tracking-wide">
                          Premium Bronze
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Confirm Selection */}
          <div className="flex justify-center">
            <Button
              onClick={handleSelection}
              disabled={!selectedId || selectionMutation.isPending}
              className="btn-bronze font-bold px-12 py-6 text-lg"
              data-testid="button-confirm-selection"
            >
              {selectionMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="spinner w-5 h-5 border-2" />
                  <span>Confirming...</span>
                </div>
              ) : (
                <span className="moving-fill">Confirm Selection</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
