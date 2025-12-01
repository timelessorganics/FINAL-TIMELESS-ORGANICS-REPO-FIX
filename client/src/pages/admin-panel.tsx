import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Seat, Purchase, Code, PromoCode, MediaAsset, Product, Auction } from "@shared/schema";
import { Users, Package, DollarSign, Award, Download, Gift, Copy, CheckCircle, XCircle, Upload, Image as ImageIcon, ShoppingBag, Gavel, Calendar, Trash2, Edit, Plus, ExternalLink, Flame, Leaf } from "lucide-react";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("specimens");
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const stored = sessionStorage.getItem("specimenCustomImages");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-7 py-12">
          <div className="mb-12">
            <div className="kicker mb-3">ADMINISTRATOR</div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="moving-fill">Admin Panel</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Founding 100 Launch - Specimen Image Manager
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="inline-flex gap-1">
              <TabsTrigger value="specimens" className="gap-2" data-testid="tab-specimens">
                <Leaf className="w-4 h-4" />
                <span>Specimens</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specimens" className="mt-6 w-full">
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold mb-2">Specimen Image Manager</h2>
                <p className="text-muted-foreground">
                  Upload custom images for each specimen style to test the gallery. Images are stored temporarily in your browser session.
                </p>
              </div>

              <div className="mb-6 flex gap-3">
                <Button
                  onClick={() => window.open("/founding-100", "_blank")}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="button-view-gallery-from-admin"
                >
                  <Eye className="w-4 h-4" />
                  View Gallery in New Tab
                </Button>
                {Object.keys(customImages).length > 0 && (
                  <Button
                    onClick={() => {
                      setCustomImages({});
                      sessionStorage.removeItem("specimenCustomImages");
                    }}
                    variant="destructive"
                    className="flex items-center gap-2"
                    data-testid="button-clear-all-specimens"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Images
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: "cones_bracts_seedpods", name: "Cones, Bracts & Seedpods" },
                  { id: "protea_pincushion_blooms_heads", name: "Protea Pincushion Blooms" },
                  { id: "bulb_spikes", name: "Bulb Spikes" },
                  { id: "branches_leaves", name: "Branches & Leaves" },
                  { id: "aloe_inflorescence_heads", name: "Aloe Inflorescence" },
                  { id: "flower_heads", name: "Flower Heads" },
                  { id: "erica_sprays", name: "Erica Sprays" },
                  { id: "restios_seedheads_grasses", name: "Restios & Seedheads" },
                  { id: "small_succulents", name: "Small Succulents" },
                ].map((specimen) => (
                  <Card key={specimen.id} className="overflow-hidden" data-testid={`card-${specimen.id}`}>
                    <div className="aspect-square relative bg-muted overflow-hidden">
                      {customImages[specimen.id] ? (
                        <img
                          src={customImages[specimen.id]}
                          alt={specimen.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-muted-foreground text-sm">No image uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium mb-3 text-sm">{specimen.name}</h3>

                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const dataUrl = event.target?.result as string;
                                  const updated = { ...customImages, [specimen.id]: dataUrl };
                                  setCustomImages(updated);
                                  sessionStorage.setItem("specimenCustomImages", JSON.stringify(updated));
                                  toast({ title: "Image Uploaded", description: `${specimen.name} image set.` });
                                };
                                reader.readAsDataURL(e.target.files[0]);
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full cursor-pointer flex items-center gap-2"
                            data-testid={`button-upload-${specimen.id}`}
                            onClick={(e) => {
                              const input = (e.currentTarget.parentElement as HTMLLabelElement)?.querySelector('input[type="file"]') as HTMLInputElement;
                              input?.click();
                            }}
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </Button>
                        </label>

                        {customImages[specimen.id] && (
                          <Button
                            onClick={() => {
                              const updated = { ...customImages };
                              delete updated[specimen.id];
                              setCustomImages(updated);
                              sessionStorage.setItem("specimenCustomImages", JSON.stringify(updated));
                            }}
                            variant="ghost"
                            size="sm"
                            data-testid={`button-clear-${specimen.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {customImages[specimen.id] && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Custom image loaded
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
