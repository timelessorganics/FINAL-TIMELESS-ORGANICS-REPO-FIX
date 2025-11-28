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
import { Users, Package, DollarSign, Award, Download, Gift, Copy, CheckCircle, XCircle, Upload, Image as ImageIcon, ShoppingBag, Gavel, Calendar, Trash2, Edit, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [codeCount, setCodeCount] = useState("10");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: seats } = useQuery<Seat[]>({
    queryKey: ["/api/admin/seats"],
  });

  const { data: purchases } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/purchases"],
  });

  const { data: codes } = useQuery<Code[]>({
    queryKey: ["/api/admin/codes"],
  });

  const { data: promoCodes } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  const { data: customSpecimens } = useQuery<Purchase[]>({
    queryKey: ["/api/admin/custom-specimens"],
  });

  // New admin queries for media, products, auctions
  const { data: mediaAssets } = useQuery<MediaAsset[]>({
    queryKey: ["/api/admin/media"],
  });

  const { data: productsList } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: auctionsList } = useQuery<Auction[]>({
    queryKey: ["/api/admin/auctions"],
  });

  const { data: workshopDates } = useQuery<any[]>({
    queryKey: ["/api/admin/workshops"],
  });

  const [approvalNotes, setApprovalNotes] = useState<{[key: string]: string}>({});
  
  // Media upload dialog state
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [mediaForm, setMediaForm] = useState({ url: "", altText: "", caption: "", tags: "" });
  
  // Product dialog state
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productForm, setProductForm] = useState({ 
    name: "", slug: "", description: "", priceCents: "", category: "", status: "draft" 
  });
  
  // Auction dialog state
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [auctionForm, setAuctionForm] = useState({ 
    title: "", slug: "", description: "", startingBidCents: "", startAt: "", endAt: "", status: "draft" 
  });
  
  // Workshop dialog state
  const [showWorkshopDialog, setShowWorkshopDialog] = useState(false);
  const [workshopForm, setWorkshopForm] = useState({ 
    date: "", startTime: "09:00", endTime: "17:00", maxParticipants: "6", depositAmount: "100000", location: "Franschhoek Studio" 
  });

  const approveSpecimen = useMutation({
    mutationFn: async ({ purchaseId, notes }: { purchaseId: string; notes?: string }) => {
      const response = await apiRequest("POST", `/api/admin/custom-specimens/${purchaseId}/approve`, { notes });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-specimens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      toast({
        title: "Specimen Approved!",
        description: "The custom specimen has been approved for casting.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Could not approve specimen.",
      });
    },
  });

  const rejectSpecimen = useMutation({
    mutationFn: async ({ purchaseId, notes }: { purchaseId: string; notes: string }) => {
      const response = await apiRequest("POST", `/api/admin/custom-specimens/${purchaseId}/reject`, { notes });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-specimens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchases"] });
      toast({
        title: "Specimen Rejected",
        description: "The custom specimen has been rejected. User has been notified.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "Could not reject specimen.",
      });
    },
  });

  const generateCodes = useMutation({
    mutationFn: async (count: number) => {
      const response = await apiRequest("POST", "/api/admin/promo-codes/generate", { count });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Codes Generated!",
        description: `Successfully generated ${codeCount} promo codes.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Could not generate codes.",
      });
    },
  });

  const syncToMailchimp = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/mailchimp/sync", {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mailchimp Sync Complete!",
        description: `Synced ${data.totalContacts} contacts (${data.subscribers} subscribers, ${data.purchasers} purchasers). Success: ${data.success}, Failed: ${data.failed}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Mailchimp Sync Failed",
        description: error.message || "Could not sync to Mailchimp. Check if API credentials are configured.",
      });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Code ${code} copied to clipboard.`,
    });
  };

  // Create media asset mutation
  const createMedia = useMutation({
    mutationFn: async (data: { url: string; altText?: string; caption?: string; tags?: string[] }) => {
      const filename = data.url.split('/').pop() || 'image';
      const response = await apiRequest("POST", "/api/admin/media", {
        filename,
        originalName: filename,
        mimeType: data.url.includes('.png') ? 'image/png' : data.url.includes('.webp') ? 'image/webp' : 'image/jpeg',
        size: 0,
        url: data.url,
        altText: data.altText,
        caption: data.caption,
        tags: data.tags,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setShowMediaDialog(false);
      setMediaForm({ url: "", altText: "", caption: "", tags: "" });
      toast({ title: "Media Added!", description: "Image has been added to the library." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add media", description: error.message });
    },
  });

  // Delete media mutation
  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      toast({ title: "Media Deleted", description: "Image has been removed from the library." });
    },
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/products", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setShowProductDialog(false);
      setProductForm({ name: "", slug: "", description: "", priceCents: "", category: "", status: "draft" });
      toast({ title: "Product Created!", description: "New product has been added to the shop." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to create product", description: error.message });
    },
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Product Deleted" });
    },
  });

  // Create auction mutation
  const createAuction = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/auctions", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auctions"] });
      setShowAuctionDialog(false);
      setAuctionForm({ title: "", slug: "", description: "", startingBidCents: "", startAt: "", endAt: "", status: "draft" });
      toast({ title: "Auction Created!", description: "New auction has been scheduled." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to create auction", description: error.message });
    },
  });

  // Delete auction mutation
  const deleteAuction = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/auctions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auctions"] });
      toast({ title: "Auction Deleted" });
    },
  });

  // Create workshop date mutation
  const createWorkshopDate = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/workshops", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workshops"] });
      setShowWorkshopDialog(false);
      setWorkshopForm({ date: "", startTime: "09:00", endTime: "17:00", maxParticipants: "6", depositAmount: "100000", location: "Franschhoek Studio" });
      toast({ title: "Workshop Date Added!", description: "New workshop date has been scheduled." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to create workshop", description: error.message });
    },
  });

  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0) || 0;
  const completedPurchases = purchases?.filter((p) => p.status === "completed").length || 0;
  const totalSeats = seats?.reduce((sum, s) => sum + s.sold, 0) || 0;
  const unusedPromoCodes = promoCodes?.filter((pc) => !pc.used).length || 0;

  return (
    <>
      <div className="bg-aloe" />
      <Header />
      <div className="relative z-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-7 py-12">
          {/* Header */}
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="kicker mb-3">ADMINISTRATOR</div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="moving-fill">Admin Panel</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Founding 100 Launch Analytics & Management
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                data-testid="button-sync-mailchimp"
                onClick={() => syncToMailchimp.mutate()}
                disabled={syncToMailchimp.isPending}
              >
                <Upload className="w-4 h-4" />
                {syncToMailchimp.isPending ? "Syncing..." : "Sync to Mailchimp"}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                data-testid="button-export-customers"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/admin/export/subscribers`;
                }}
              >
                <Download className="w-4 h-4" />
                Export Customers
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                data-testid="button-export-subscribers"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/admin/subscribers/export`;
                }}
              >
                <Download className="w-4 h-4" />
                Export Pre-Launch List
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex gap-1">
              <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2" data-testid="tab-media">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2" data-testid="tab-products">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="auctions" className="gap-2" data-testid="tab-auctions">
                <Gavel className="w-4 h-4" />
                <span className="hidden sm:inline">Auctions</span>
              </TabsTrigger>
              <TabsTrigger value="workshops" className="gap-2" data-testid="tab-workshops">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Workshops</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Original Content */}
            <TabsContent value="overview" className="mt-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-patina" />
                <Badge className="bg-patina text-white">Live</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                {completedPurchases}
              </div>
              <div className="text-sm text-muted-foreground">Total Investors</div>
            </Card>

            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-bronze" />
                <Badge className="bg-bronze text-white">Seats</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                {totalSeats}/100
              </div>
              <div className="text-sm text-muted-foreground">Seats Sold</div>
            </Card>

            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-accent-gold" />
                <Badge className="bg-accent-gold text-black">Revenue</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                R{(totalRevenue / 100).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{completedPurchases} Purchases</div>
            </Card>

            <Card className="bg-card border-card-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-patina" />
                <Badge className="bg-patina text-white">Active</Badge>
              </div>
              <div className="text-3xl font-bold font-serif text-foreground mb-1">
                {codes?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Codes Issued</div>
            </Card>
          </div>

          {/* Seat Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {seats?.map((seat) => {
              const available = seat.totalAvailable - seat.sold;
              const percentage = (seat.sold / seat.totalAvailable) * 100;

              return (
                <Card key={seat.id} className="bg-card border-card-border p-7">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold mb-1 text-foreground">
                        {seat.type === "founder" ? "Founders Pass" : "Patron Gift Card"}
                      </h3>
                      <div className="text-accent-gold font-semibold">
                        R{(seat.price / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold font-serif text-foreground">
                        {available}
                      </div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-bronze to-accent-gold transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{seat.sold} sold</span>
                    <span>{percentage.toFixed(1)}% claimed</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Promo Code Management */}
          <Card className="bg-card border-card-border p-7 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                  Free Patron Passes
                </h2>
                <p className="text-sm text-muted-foreground">
                  Generate and manage promo codes for friends & family
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-patina" />
                <span className="font-semibold text-foreground">
                  {unusedPromoCodes} unused
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-muted rounded-lg border border-border">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Codes
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={codeCount}
                  onChange={(e) => setCodeCount(e.target.value)}
                  className="bg-background"
                  data-testid="input-code-count"
                />
              </div>
              <Button
                onClick={() => generateCodes.mutate(parseInt(codeCount) || 1)}
                disabled={generateCodes.isPending}
                className="bg-patina hover:bg-patina/90 text-white"
                data-testid="button-generate-codes"
              >
                <Gift className="w-4 h-4 mr-2" />
                {generateCodes.isPending ? "Generating..." : "Generate Codes"}
              </Button>
            </div>

            {promoCodes && promoCodes.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {promoCodes.map((promoCode) => (
                  <div
                    key={promoCode.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="font-mono text-lg font-bold text-foreground">
                          {promoCode.code}
                        </code>
                        {promoCode.used ? (
                          <Badge className="bg-bronze text-white">Used</Badge>
                        ) : (
                          <Badge className="bg-patina text-white">Active</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {promoCode.used && promoCode.redeemedAt
                          ? `Redeemed on ${new Date(promoCode.redeemedAt).toLocaleDateString()}`
                          : "Ready to redeem"}
                      </div>
                    </div>
                    {!promoCode.used && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(promoCode.code)}
                        data-testid={`button-copy-${promoCode.code}`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No promo codes generated yet
              </div>
            )}
          </Card>

          {/* Custom Specimen Review */}
          {customSpecimens && customSpecimens.length > 0 && (
            <Card className="bg-card border-card-border p-7 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-accent" />
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                    Custom Specimens Awaiting Review
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Approve or reject custom botanical specimens submitted by investors
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {customSpecimens.map((purchase) => (
                  <div key={purchase.id} className="p-6 bg-muted rounded-lg border border-border space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            Purchase #{purchase.id.slice(0, 8)}
                          </h3>
                          <Badge className="bg-bronze/20 text-bronze border-bronze/30">
                            {purchase.seatType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Submitted on {new Date(purchase.createdAt!).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {purchase.customSpecimenPhotoUrl && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <ImageIcon className="w-4 h-4" />
                              View Photo
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Custom Specimen Photo</DialogTitle>
                              <DialogDescription>
                                Review the botanical specimen submitted by the investor
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <img
                                src={purchase.customSpecimenPhotoUrl}
                                alt="Custom specimen"
                                className="w-full rounded-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Studio Notes (optional for approval, required for rejection)
                        </label>
                        <Textarea
                          placeholder="Enter notes about cast-ability, timing, or alternative suggestions..."
                          value={approvalNotes[purchase.id] || ""}
                          onChange={(e) => setApprovalNotes({ ...approvalNotes, [purchase.id]: e.target.value })}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => approveSpecimen.mutate({ 
                            purchaseId: purchase.id, 
                            notes: approvalNotes[purchase.id] 
                          })}
                          disabled={approveSpecimen.isPending}
                          className="bg-patina hover:bg-patina/90 text-white gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve for Casting
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Custom Specimen</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for rejection. The investor will be notified and can choose an alternative path.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Explain why this specimen is not viable for casting..."
                                value={approvalNotes[purchase.id] || ""}
                                onChange={(e) => setApprovalNotes({ ...approvalNotes, [purchase.id]: e.target.value })}
                                className="min-h-[120px]"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  if (!approvalNotes[purchase.id]?.trim()) {
                                    toast({
                                      variant: "destructive",
                                      title: "Notes Required",
                                      description: "Please provide a reason for rejection.",
                                    });
                                    return;
                                  }
                                  rejectSpecimen.mutate({ 
                                    purchaseId: purchase.id, 
                                    notes: approvalNotes[purchase.id] 
                                  });
                                }}
                                disabled={rejectSpecimen.isPending}
                                className="bg-destructive hover:bg-destructive/90 text-white"
                              >
                                Confirm Rejection
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Purchases */}
          <Card className="bg-card border-card-border p-7">
            <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">
              Recent Purchases
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Add-ons
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases?.slice(0, 10).map((purchase) => (
                    <tr key={purchase.id} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm text-foreground">
                        {new Date(purchase.createdAt!).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground capitalize">
                        {purchase.seatType}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-accent-gold">
                        R{(purchase.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {purchase.hasPatina && (
                            <Badge variant="outline" className="text-xs w-fit">
                              Patina
                            </Badge>
                          )}
                          {purchase.hasMounting && (
                            <Badge variant="outline" className="text-xs w-fit">
                              Mounting
                            </Badge>
                          )}
                          {purchase.commissionVoucher && (
                            <Badge variant="outline" className="text-xs w-fit bg-accent-gold/10 text-accent-gold border-accent-gold/30">
                              Comm. Voucher
                            </Badge>
                          )}
                          {purchase.internationalShipping && (
                            <Badge variant="outline" className="text-xs w-fit bg-accent-gold/10 text-accent-gold border-accent-gold/30">
                              Int'l Ship
                            </Badge>
                          )}
                          {!purchase.hasPatina && !purchase.hasMounting && !purchase.commissionVoucher && !purchase.internationalShipping && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            purchase.status === "completed"
                              ? "bg-patina text-white"
                              : purchase.status === "pending"
                              ? "bg-bronze text-white"
                              : "bg-destructive text-white"
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {purchase.paymentReference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
            </TabsContent>

            {/* Media Library Tab */}
            <TabsContent value="media" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Media Library</h2>
                <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-add-media">
                      <Plus className="w-4 h-4" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Media Asset</DialogTitle>
                      <DialogDescription>Enter the image URL and details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="media-url">Image URL</Label>
                        <Input id="media-url" placeholder="https://..." value={mediaForm.url} onChange={(e) => setMediaForm({...mediaForm, url: e.target.value})} data-testid="input-media-url" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-alt">Alt Text</Label>
                        <Input id="media-alt" placeholder="Describe the image" value={mediaForm.altText} onChange={(e) => setMediaForm({...mediaForm, altText: e.target.value})} data-testid="input-media-alt" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-caption">Caption</Label>
                        <Input id="media-caption" placeholder="Optional caption" value={mediaForm.caption} onChange={(e) => setMediaForm({...mediaForm, caption: e.target.value})} data-testid="input-media-caption" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-tags">Tags (comma separated)</Label>
                        <Input id="media-tags" placeholder="hero, gallery, product" value={mediaForm.tags} onChange={(e) => setMediaForm({...mediaForm, tags: e.target.value})} data-testid="input-media-tags" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowMediaDialog(false)}>Cancel</Button>
                      <Button onClick={() => createMedia.mutate({ url: mediaForm.url, altText: mediaForm.altText, caption: mediaForm.caption, tags: mediaForm.tags ? mediaForm.tags.split(',').map(t => t.trim()) : undefined })} disabled={createMedia.isPending} data-testid="button-save-media">
                        {createMedia.isPending ? "Adding..." : "Add Image"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaAssets?.map((asset) => (
                  <Card key={asset.id} className="bg-card border-card-border overflow-hidden group">
                    <div className="aspect-square relative bg-muted">
                      <img src={asset.url} alt={asset.altText || asset.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="ghost" className="text-white" onClick={() => deleteMedia.mutate(asset.id)} data-testid={`button-delete-media-${asset.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white" onClick={() => window.open(asset.url, '_blank')} data-testid={`button-view-media-${asset.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{asset.originalName}</p>
                      <p className="text-xs text-muted-foreground truncate">{asset.altText || 'No alt text'}</p>
                      {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {asset.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {(!mediaAssets || mediaAssets.length === 0) && (
                  <Card className="col-span-full bg-card border-card-border p-12 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No media assets yet. Add your first image above.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Products</h2>
                <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-add-product">
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Product</DialogTitle>
                      <DialogDescription>Create a new product for the shop</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-name">Name</Label>
                          <Input id="product-name" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} data-testid="input-product-name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-price">Price (Rands)</Label>
                          <Input id="product-price" type="number" placeholder="1000" value={productForm.priceCents ? (parseInt(productForm.priceCents) / 100).toString() : ''} onChange={(e) => setProductForm({...productForm, priceCents: (parseFloat(e.target.value) * 100).toString()})} data-testid="input-product-price" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-category">Category</Label>
                          <Select value={productForm.category} onValueChange={(v) => setProductForm({...productForm, category: v})}>
                            <SelectTrigger data-testid="select-product-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bronze">Bronze</SelectItem>
                              <SelectItem value="print">Print</SelectItem>
                              <SelectItem value="merchandise">Merchandise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-status">Status</Label>
                          <Select value={productForm.status} onValueChange={(v) => setProductForm({...productForm, status: v})}>
                            <SelectTrigger data-testid="select-product-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="sold_out">Sold Out</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-description">Description</Label>
                        <Textarea id="product-description" placeholder="Product description" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} data-testid="input-product-description" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowProductDialog(false)}>Cancel</Button>
                      <Button onClick={() => createProduct.mutate({ name: productForm.name, slug: productForm.slug, description: productForm.description, priceCents: parseInt(productForm.priceCents), category: productForm.category, status: productForm.status })} disabled={createProduct.isPending} data-testid="button-save-product">
                        {createProduct.isPending ? "Creating..." : "Create Product"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsList?.map((product) => (
                  <Card key={product.id} className="bg-card border-card-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={product.status === 'active' ? 'default' : 'outline'}>{product.status}</Badge>
                          <span className="text-sm font-semibold text-accent-gold">R{(product.priceCents / 100).toLocaleString()}</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteProduct.mutate(product.id)} data-testid={`button-delete-product-${product.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {(!productsList || productsList.length === 0) && (
                  <Card className="col-span-full bg-card border-card-border p-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No products yet. Add your first product above.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Auctions Tab */}
            <TabsContent value="auctions" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Auctions</h2>
                <Dialog open={showAuctionDialog} onOpenChange={setShowAuctionDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-add-auction">
                      <Plus className="w-4 h-4" />
                      Create Auction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Auction</DialogTitle>
                      <DialogDescription>Schedule a new bronze auction</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="auction-title">Title</Label>
                        <Input id="auction-title" placeholder="Auction title" value={auctionForm.title} onChange={(e) => setAuctionForm({...auctionForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} data-testid="input-auction-title" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="auction-start">Start Date/Time</Label>
                          <Input id="auction-start" type="datetime-local" value={auctionForm.startAt} onChange={(e) => setAuctionForm({...auctionForm, startAt: e.target.value})} data-testid="input-auction-start" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auction-end">End Date/Time</Label>
                          <Input id="auction-end" type="datetime-local" value={auctionForm.endAt} onChange={(e) => setAuctionForm({...auctionForm, endAt: e.target.value})} data-testid="input-auction-end" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auction-starting-bid">Starting Bid (Rands)</Label>
                        <Input id="auction-starting-bid" type="number" placeholder="5000" value={auctionForm.startingBidCents ? (parseInt(auctionForm.startingBidCents) / 100).toString() : ''} onChange={(e) => setAuctionForm({...auctionForm, startingBidCents: (parseFloat(e.target.value) * 100).toString()})} data-testid="input-auction-starting-bid" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auction-description">Description</Label>
                        <Textarea id="auction-description" placeholder="Describe the piece" value={auctionForm.description} onChange={(e) => setAuctionForm({...auctionForm, description: e.target.value})} data-testid="input-auction-description" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAuctionDialog(false)}>Cancel</Button>
                      <Button onClick={() => createAuction.mutate({ title: auctionForm.title, slug: auctionForm.slug, description: auctionForm.description, startingBidCents: parseInt(auctionForm.startingBidCents), startAt: auctionForm.startAt, endAt: auctionForm.endAt, status: auctionForm.status })} disabled={createAuction.isPending} data-testid="button-save-auction">
                        {createAuction.isPending ? "Creating..." : "Create Auction"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auctionsList?.map((auction) => (
                  <Card key={auction.id} className="bg-card border-card-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{auction.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{auction.description || 'No description'}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant={auction.status === 'active' ? 'default' : 'outline'}>{auction.status}</Badge>
                          <span className="text-sm text-muted-foreground">Start: {new Date(auction.startAt).toLocaleDateString()}</span>
                          <span className="text-sm font-semibold text-accent-gold">R{(auction.startingBidCents / 100).toLocaleString()} starting</span>
                          {auction.currentBidCents && <span className="text-sm font-bold text-patina">Current: R{(auction.currentBidCents / 100).toLocaleString()}</span>}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteAuction.mutate(auction.id)} data-testid={`button-delete-auction-${auction.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {(!auctionsList || auctionsList.length === 0) && (
                  <Card className="col-span-full bg-card border-card-border p-12 text-center">
                    <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No auctions yet. Create your first auction above.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Workshops Tab */}
            <TabsContent value="workshops" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">Workshop Dates</h2>
                <Dialog open={showWorkshopDialog} onOpenChange={setShowWorkshopDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-add-workshop">
                      <Plus className="w-4 h-4" />
                      Add Date
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Workshop Date</DialogTitle>
                      <DialogDescription>Schedule a new workshop date</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="workshop-date">Date</Label>
                        <Input id="workshop-date" type="date" value={workshopForm.date} onChange={(e) => setWorkshopForm({...workshopForm, date: e.target.value})} data-testid="input-workshop-date" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="workshop-start-time">Start Time</Label>
                          <Input id="workshop-start-time" type="time" value={workshopForm.startTime} onChange={(e) => setWorkshopForm({...workshopForm, startTime: e.target.value})} data-testid="input-workshop-start-time" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workshop-end-time">End Time</Label>
                          <Input id="workshop-end-time" type="time" value={workshopForm.endTime} onChange={(e) => setWorkshopForm({...workshopForm, endTime: e.target.value})} data-testid="input-workshop-end-time" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="workshop-max">Max Participants</Label>
                          <Input id="workshop-max" type="number" value={workshopForm.maxParticipants} onChange={(e) => setWorkshopForm({...workshopForm, maxParticipants: e.target.value})} data-testid="input-workshop-max" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workshop-deposit">Deposit (cents)</Label>
                          <Input id="workshop-deposit" type="number" value={workshopForm.depositAmount} onChange={(e) => setWorkshopForm({...workshopForm, depositAmount: e.target.value})} data-testid="input-workshop-deposit" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workshop-location">Location</Label>
                        <Input id="workshop-location" value={workshopForm.location} onChange={(e) => setWorkshopForm({...workshopForm, location: e.target.value})} data-testid="input-workshop-location" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowWorkshopDialog(false)}>Cancel</Button>
                      <Button onClick={() => createWorkshopDate.mutate({ date: workshopForm.date, startTime: workshopForm.startTime, endTime: workshopForm.endTime, maxParticipants: parseInt(workshopForm.maxParticipants), depositAmount: parseInt(workshopForm.depositAmount), location: workshopForm.location })} disabled={createWorkshopDate.isPending} data-testid="button-save-workshop">
                        {createWorkshopDate.isPending ? "Adding..." : "Add Date"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workshopDates?.map((date: any) => (
                  <Card key={date.id} className="bg-card border-card-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={date.status === 'fully_booked' ? 'destructive' : date.status === 'available' ? 'default' : 'outline'}>{date.status}</Badge>
                      <span className="text-sm text-muted-foreground">{date.currentParticipants}/{date.maxParticipants} spots</span>
                    </div>
                    <h3 className="font-semibold">{new Date(date.date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{date.startTime} - {date.endTime}</p>
                    <p className="text-sm text-muted-foreground">{date.location}</p>
                    <p className="text-sm font-semibold text-accent-gold mt-2">Deposit: R{(date.depositAmount / 100).toLocaleString()}</p>
                  </Card>
                ))}
                {(!workshopDates || workshopDates.length === 0) && (
                  <Card className="col-span-full bg-card border-card-border p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No workshop dates scheduled. Add your first date above.</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
