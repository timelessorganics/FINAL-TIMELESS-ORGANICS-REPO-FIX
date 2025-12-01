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
import { Users, Package, DollarSign, Award, Download, Gift, Copy, CheckCircle, XCircle, Upload, Image as ImageIcon, ShoppingBag, Gavel, Calendar, Trash2, Edit, Plus, ExternalLink, Flame } from "lucide-react";
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
  const [codeCount, setCodeCount] = useState("10");
  const [activeTab, setActiveTab] = useState("overview");
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const stored = sessionStorage.getItem("specimenCustomImages");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

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
  const [editingPrice, setEditingPrice] = useState<{ founderPrice: string; patronPrice: string }>({ founderPrice: "", patronPrice: "" });
  
  // Update pricing mutation
  const updatePricing = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", "/api/admin/pricing", {
        founderPrice: editingPrice.founderPrice ? parseInt(editingPrice.founderPrice) * 100 : undefined,
        patronPrice: editingPrice.patronPrice ? parseInt(editingPrice.patronPrice) * 100 : undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seats/availability"] });
      setEditingPrice({ founderPrice: "", patronPrice: "" });
      toast({ title: "Pricing Updated!", description: "Seat prices have been updated." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update pricing", description: error.message });
    },
  });
  
  // Media upload dialog state
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [mediaForm, setMediaForm] = useState({ url: "", file: null as File | null, altText: "", caption: "", tags: "" });
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [contentForm, setContentForm] = useState({ 
    heroTitle: "", heroSubtitle: "", aboutText: "", workshopsText: "" 
  });
  
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
    mutationFn: async (data: { url?: string; file?: File; altText?: string; caption?: string; tags?: string[] }) => {
      let mediaUrl = data.url;
      let filename = "image";
      
      if (data.file) {
        // Convert file to base64
        const reader = new FileReader();
        mediaUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.file!);
        });
        filename = data.file.name;
      }
      
      const response = await apiRequest("POST", "/api/admin/media", {
        filename,
        originalName: filename,
        mimeType: data.file?.type || (data.url?.includes('.png') ? 'image/png' : data.url?.includes('.webp') ? 'image/webp' : 'image/jpeg'),
        size: data.file?.size || 0,
        url: mediaUrl,
        altText: data.altText,
        caption: data.caption,
        tags: data.tags,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setShowMediaDialog(false);
      setMediaForm({ url: "", file: null, altText: "", caption: "", tags: "" });
      toast({ title: "Media Added!", description: "Image has been added to the library." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to add media", description: error.message });
    },
  });

  // Website content queries
  const { data: websiteContent, refetch: refetchContent } = useQuery<any[]>({
    queryKey: ["/api/admin/content"],
  });

  // Page assets query
  const { data: pageAssetsData } = useQuery<any[]>({
    queryKey: ["/api/admin/page-assets"],
    enabled: false,
  });

  // Content form state for editing
  const [editingContent, setEditingContent] = useState<{ pageSlug: string; sectionKey: string; content: string } | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [showImageAssigner, setShowImageAssigner] = useState<{ pageSlug: string; slotKey: string } | null>(null);

  // Update content mutation - now uses database
  const updateContent = useMutation({
    mutationFn: async (data: { pageSlug: string; sectionKey: string; content: string }) => {
      const response = await apiRequest("POST", "/api/admin/content", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setEditingContent(null);
      setShowContentEditor(false);
      toast({ title: "Content Updated!", description: "Website content has been saved to database." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update content", description: error.message });
    },
  });

  // Assign image to page slot mutation
  const assignImageToSlot = useMutation({
    mutationFn: async (data: { pageSlug: string; slotKey: string; assetId: string }) => {
      const response = await apiRequest("POST", "/api/admin/page-assets", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-assets"] });
      setShowImageAssigner(null);
      toast({ title: "Image Assigned!", description: "Image has been assigned to the page slot." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to assign image", description: error.message });
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

  // Fire sale mutations
  const [fireSaleForm, setFireSaleForm] = useState({ founderPrice: "2000", patronPrice: "3500", durationHours: "24" });
  
  const activateFireSale = useMutation({
    mutationFn: async (data: { founderPrice: number; patronPrice: number; durationHours: number }) => {
      const response = await apiRequest("POST", "/api/admin/fire-sale", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seats/availability"] });
      toast({ title: "Fire Sale Activated!", description: data.message });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to activate fire sale", description: error.message });
    },
  });

  const deactivateFireSale = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/admin/fire-sale");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seats/availability"] });
      toast({ title: "Fire Sale Deactivated", description: "Prices reverted to normal." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to deactivate fire sale", description: error.message });
    },
  });

  // Check if fire sale is active
  const fireSaleActive = seats?.some(s => s.fireSalePrice && s.fireSaleEndsAt && new Date(s.fireSaleEndsAt) > new Date());
  const fireSaleEndsAt = seats?.find(s => s.fireSaleEndsAt)?.fireSaleEndsAt;

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
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex gap-1">
              <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2" data-testid="tab-content">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2" data-testid="tab-media">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
              <TabsTrigger value="specimens" className="gap-2" data-testid="tab-specimens">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Specimens</span>
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

          {/* Content Management - Quick Access */}
          <Card className="bg-card border-card-border p-7 mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-bold">Website Content</h2>
              <Button className="gap-2" onClick={() => setActiveTab("content")} data-testid="button-goto-content">
                <Edit className="w-4 h-4" />
                Manage Content
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Edit all text and images across your website from the Content tab</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-bronze">{websiteContent?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Content Items</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-patina">{mediaAssets?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Media Assets</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-accent-gold">7</p>
                <p className="text-xs text-muted-foreground">Pages</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">CMS Status</p>
              </div>
            </div>
          </Card>

          {/* Fire Sale Control - 24 Hour Friends & Family Discount */}
          <Card className={`border-2 p-7 mb-12 ${fireSaleActive ? 'bg-amber-600/10 border-amber-600' : 'bg-card border-card-border'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Flame className={`w-8 h-8 ${fireSaleActive ? 'text-amber-600 animate-pulse' : 'text-muted-foreground'}`} />
                <div>
                  <h2 className="font-serif text-2xl font-bold">24-Hour Fire Sale</h2>
                  <p className="text-sm text-muted-foreground">Friends & Family discounted pricing</p>
                </div>
              </div>
              {fireSaleActive && (
                <Badge className="bg-orange-500 text-white text-lg px-4 py-1">ACTIVE</Badge>
              )}
            </div>
            
            {fireSaleActive && fireSaleEndsAt && (
              <div className="bg-background/50 rounded-lg p-4 mb-6 border border-orange-500/30">
                <p className="text-sm text-muted-foreground mb-1">Fire sale ends:</p>
                <p className="text-lg font-bold text-orange-500">{new Date(fireSaleEndsAt).toLocaleString()}</p>
              </div>
            )}
            
            {!fireSaleActive && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="fire-founder-price">Founder Price (R)</Label>
                  <Input id="fire-founder-price" type="number" placeholder="2000" value={fireSaleForm.founderPrice} onChange={(e) => setFireSaleForm({...fireSaleForm, founderPrice: e.target.value})} data-testid="input-fire-founder-price" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fire-patron-price">Patron Price (R)</Label>
                  <Input id="fire-patron-price" type="number" placeholder="3500" value={fireSaleForm.patronPrice} onChange={(e) => setFireSaleForm({...fireSaleForm, patronPrice: e.target.value})} data-testid="input-fire-patron-price" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fire-duration">Duration (hours)</Label>
                  <Input id="fire-duration" type="number" placeholder="24" value={fireSaleForm.durationHours} onChange={(e) => setFireSaleForm({...fireSaleForm, durationHours: e.target.value})} data-testid="input-fire-duration" />
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              {!fireSaleActive ? (
                <Button 
                  onClick={() => activateFireSale.mutate({
                    founderPrice: parseInt(fireSaleForm.founderPrice) * 100,
                    patronPrice: parseInt(fireSaleForm.patronPrice) * 100,
                    durationHours: parseInt(fireSaleForm.durationHours)
                  })} 
                  disabled={activateFireSale.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                  data-testid="button-activate-fire-sale"
                >
                  <Flame className="w-4 h-4" />
                  {activateFireSale.isPending ? "Activating..." : "Activate Fire Sale"}
                </Button>
              ) : (
                <Button 
                  onClick={() => deactivateFireSale.mutate()} 
                  disabled={deactivateFireSale.isPending}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  data-testid="button-deactivate-fire-sale"
                >
                  {deactivateFireSale.isPending ? "Deactivating..." : "End Fire Sale Early"}
                </Button>
              )}
            </div>
          </Card>

          {/* Pricing Management */}
          <Card className="bg-card border-card-border p-7 mb-12">
            <h2 className="font-serif text-2xl font-bold mb-6">Normal Pricing</h2>
            <p className="text-sm text-muted-foreground mb-4">Set the regular prices (used after fire sale ends)</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="founder-price">Founder Seat Price (R)</Label>
                <Input id="founder-price" type="number" placeholder="3500" step="100" value={editingPrice.founderPrice} onChange={(e) => setEditingPrice({...editingPrice, founderPrice: e.target.value})} data-testid="input-founder-price" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patron-price">Patron Seat Price (R)</Label>
                <Input id="patron-price" type="number" placeholder="5500" step="100" value={editingPrice.patronPrice} onChange={(e) => setEditingPrice({...editingPrice, patronPrice: e.target.value})} data-testid="input-patron-price" />
              </div>
            </div>
            <Button onClick={() => updatePricing.mutate()} disabled={updatePricing.isPending || (!editingPrice.founderPrice && !editingPrice.patronPrice)} className="bg-patina text-white" data-testid="button-update-pricing">
              {updatePricing.isPending ? "Updating..." : "Update Normal Pricing"}
            </Button>
          </Card>

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

          {/* ALL INVESTORS HUB - Complete Order Management */}
          <Card className="bg-card border-card-border p-7 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                  Investor HUB
                </h2>
                <p className="text-sm text-muted-foreground">
                  Complete view of all investors, their codes, and order status
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-bronze text-white px-3 py-1">
                  {purchases?.filter(p => p.seatType === 'founder' && p.status === 'completed').length || 0} Founders
                </Badge>
                <Badge className="bg-patina text-white px-3 py-1">
                  {purchases?.filter(p => p.seatType === 'patron' && p.status === 'completed').length || 0} Patrons
                </Badge>
              </div>
            </div>
            
            {/* Add-ons Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg border border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{purchases?.filter(p => p.hasPatina && p.status === 'completed').length || 0}</div>
                <div className="text-xs text-muted-foreground">Patina Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{purchases?.filter(p => p.hasMounting && p.status === 'completed').length || 0}</div>
                <div className="text-xs text-muted-foreground">Mounting Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{purchases?.filter(p => p.commissionVoucher && p.status === 'completed').length || 0}</div>
                <div className="text-xs text-muted-foreground">Commission Vouchers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{purchases?.filter(p => p.internationalShipping && p.status === 'completed').length || 0}</div>
                <div className="text-xs text-muted-foreground">International Ship</div>
              </div>
            </div>

            {/* Codes Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg border border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-gold">{codes?.filter(c => c.type === 'bronze_claim').length || 0}</div>
                <div className="text-xs text-muted-foreground">Bronze Claims</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-gold">{codes?.filter(c => c.type === 'workshop_voucher').length || 0}</div>
                <div className="text-xs text-muted-foreground">Workshop Vouchers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-gold">{codes?.filter(c => c.type === 'lifetime_workshop').length || 0}</div>
                <div className="text-xs text-muted-foreground">Lifetime Workshop</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-patina">{codes?.filter(c => c.lastRedeemedAt).length || 0}</div>
                <div className="text-xs text-muted-foreground">Codes Redeemed</div>
              </div>
            </div>

            {/* Full Investor Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Investor</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Add-ons</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Codes</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases?.filter(p => p.status === 'completed').map((purchase) => {
                    const purchaseCodes = codes?.filter(c => c.purchaseId === purchase.id) || [];
                    return (
                      <tr key={purchase.id} className="border-b border-border/30 hover:bg-muted/30">
                        <td className="py-3 px-3">
                          <div className="font-medium text-foreground">#{purchase.id.slice(0, 8)}</div>
                          {purchase.isGift && <Badge variant="outline" className="text-xs mt-1">Gift</Badge>}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={purchase.seatType === 'founder' ? 'bg-bronze text-white' : 'bg-patina text-white'}>
                            {purchase.seatType}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-semibold text-accent-gold">
                          R{(purchase.amount / 100).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {purchase.hasPatina && <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">Patina</Badge>}
                            {purchase.hasMounting && <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">Mount</Badge>}
                            {purchase.commissionVoucher && <Badge variant="outline" className="text-xs bg-accent-gold/10 text-accent-gold border-accent-gold/30">Comm</Badge>}
                            {purchase.internationalShipping && <Badge variant="outline" className="text-xs">Int'l</Badge>}
                            {!purchase.hasPatina && !purchase.hasMounting && !purchase.commissionVoucher && <span className="text-muted-foreground">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {purchaseCodes.map(code => (
                              <div key={code.id} className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{code.code}</code>
                                {code.lastRedeemedAt ? (
                                  <CheckCircle className="w-3 h-3 text-patina" />
                                ) : (
                                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => copyToClipboard(code.code)} data-testid={`button-copy-hub-${code.id}`}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {purchaseCodes.length === 0 && <span className="text-muted-foreground text-xs">Pending</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={purchase.status === 'completed' ? 'bg-patina text-white' : 'bg-bronze text-white'}>
                            {purchase.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {new Date(purchase.createdAt!).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Purchases */}
          <Card className="bg-card border-card-border p-7">
            <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">
              Recent Purchases (Including Pending)
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

            {/* Content Management Tab - Full CMS */}
            <TabsContent value="content" className="mt-6">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold">Content Manager</h2>
                    <p className="text-muted-foreground">Edit all text and images across your website</p>
                  </div>
                </div>

                {/* Page Selector */}
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Label className="font-semibold">Select Page:</Label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                      <SelectTrigger className="w-[200px]" data-testid="select-page">
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Page</SelectItem>
                        <SelectItem value="founding-100">Founding 100</SelectItem>
                        <SelectItem value="about">About</SelectItem>
                        <SelectItem value="gallery">Gallery</SelectItem>
                        <SelectItem value="sculptures">Sculptures</SelectItem>
                        <SelectItem value="workshops">Workshops</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content Sections for Selected Page */}
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">Text Content - {selectedPage}</h3>
                    
                    {/* Pre-defined content sections based on page */}
                    {selectedPage === "home" && (
                      <div className="grid gap-4">
                        {[
                          { key: "hero-badge", label: "Hero Badge Text", placeholder: "FOUNDING 100 INVESTOR LAUNCH" },
                          { key: "hero-title", label: "Hero Main Title", placeholder: "Timeless Organics" },
                          { key: "hero-tagline", label: "Hero Tagline", placeholder: "One-Of-A-Kind Castings From Organic Matter" },
                          { key: "value-prop-1", label: "Value Proposition 1", placeholder: "R25K+ Market Value" },
                          { key: "value-prop-2", label: "Value Proposition 2", placeholder: "50-80% First Workshop" },
                          { key: "value-prop-3", label: "Value Proposition 3", placeholder: "20-30% Lifetime Discounts" },
                          { key: "value-prop-4", label: "Value Proposition 4", placeholder: "FOREVER Giftable" },
                          { key: "about-section", label: "About Section Text", placeholder: "About the studio..." },
                        ].map((section) => {
                          const existingContent = websiteContent?.find(c => c.pageSlug === selectedPage && c.sectionKey === section.key);
                          return (
                            <div key={section.key} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                              <div className="flex-1">
                                <Label className="font-medium">{section.label}</Label>
                                <p className="text-xs text-muted-foreground mb-2">{section.key}</p>
                                {editingContent?.sectionKey === section.key && editingContent?.pageSlug === selectedPage ? (
                                  <div className="space-y-2">
                                    <Textarea 
                                      value={editingContent.content}
                                      onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                                      className="min-h-[80px]"
                                      data-testid={`textarea-${section.key}`}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => updateContent.mutate(editingContent)} disabled={updateContent.isPending} data-testid={`button-save-${section.key}`}>
                                        {updateContent.isPending ? "Saving..." : "Save"}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground/80 bg-muted/50 p-2 rounded">
                                    {existingContent?.content || <span className="italic text-muted-foreground">{section.placeholder}</span>}
                                  </p>
                                )}
                              </div>
                              {editingContent?.sectionKey !== section.key && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => setEditingContent({ pageSlug: selectedPage, sectionKey: section.key, content: existingContent?.content || "" })}
                                  data-testid={`button-edit-${section.key}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedPage === "founding-100" && (
                      <div className="grid gap-4">
                        {[
                          { key: "main-headline", label: "Main Headline", placeholder: "Your Investment Is Our Investment" },
                          { key: "sub-headline", label: "Sub Headline", placeholder: "Three investments happen simultaneously..." },
                          { key: "founder-title", label: "Founder Seat Title", placeholder: "Founder" },
                          { key: "founder-description", label: "Founder Description", placeholder: "Unmounted & unpatinated..." },
                          { key: "patron-title", label: "Patron Seat Title", placeholder: "Patron" },
                          { key: "patron-description", label: "Patron Description", placeholder: "Patina + Mounting included..." },
                          { key: "fire-sale-badge", label: "Fire Sale Badge", placeholder: "24-Hour Fire Sale" },
                        ].map((section) => {
                          const existingContent = websiteContent?.find(c => c.pageSlug === selectedPage && c.sectionKey === section.key);
                          return (
                            <div key={section.key} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                              <div className="flex-1">
                                <Label className="font-medium">{section.label}</Label>
                                <p className="text-xs text-muted-foreground mb-2">{section.key}</p>
                                {editingContent?.sectionKey === section.key && editingContent?.pageSlug === selectedPage ? (
                                  <div className="space-y-2">
                                    <Textarea 
                                      value={editingContent.content}
                                      onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                                      className="min-h-[80px]"
                                      data-testid={`textarea-${section.key}`}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => updateContent.mutate(editingContent)} disabled={updateContent.isPending}>
                                        {updateContent.isPending ? "Saving..." : "Save"}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground/80 bg-muted/50 p-2 rounded">
                                    {existingContent?.content || <span className="italic text-muted-foreground">{section.placeholder}</span>}
                                  </p>
                                )}
                              </div>
                              {editingContent?.sectionKey !== section.key && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => setEditingContent({ pageSlug: selectedPage, sectionKey: section.key, content: existingContent?.content || "" })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedPage === "sculptures" && (
                      <div className="grid gap-4">
                        {[
                          { key: "page-title", label: "Page Title", placeholder: "Sculpture Gallery" },
                          { key: "page-intro", label: "Page Introduction", placeholder: "Explore our Cape Fynbos specimens..." },
                          { key: "protea-title", label: "Protea Section Title", placeholder: "Protea / Pincushion Blooms / Heads" },
                          { key: "protea-description", label: "Protea Description", placeholder: "Single flower head types..." },
                          { key: "cones-title", label: "Cones Section Title", placeholder: "Cones / Bracts / Seedpods" },
                          { key: "cones-description", label: "Cones Description", placeholder: "Leucadendron cone with coloured bracts..." },
                          { key: "bulbs-title", label: "Bulb Spikes Title", placeholder: "Bulb Spikes" },
                          { key: "bulbs-description", label: "Bulb Spikes Description", placeholder: "Lachenalia and similar bulb spikes..." },
                        ].map((section) => {
                          const existingContent = websiteContent?.find(c => c.pageSlug === selectedPage && c.sectionKey === section.key);
                          return (
                            <div key={section.key} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                              <div className="flex-1">
                                <Label className="font-medium">{section.label}</Label>
                                <p className="text-xs text-muted-foreground mb-2">{section.key}</p>
                                {editingContent?.sectionKey === section.key && editingContent?.pageSlug === selectedPage ? (
                                  <div className="space-y-2">
                                    <Textarea 
                                      value={editingContent.content}
                                      onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                                      className="min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => updateContent.mutate(editingContent)} disabled={updateContent.isPending}>
                                        {updateContent.isPending ? "Saving..." : "Save"}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground/80 bg-muted/50 p-2 rounded">
                                    {existingContent?.content || <span className="italic text-muted-foreground">{section.placeholder}</span>}
                                  </p>
                                )}
                              </div>
                              {editingContent?.sectionKey !== section.key && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => setEditingContent({ pageSlug: selectedPage, sectionKey: section.key, content: existingContent?.content || "" })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {(selectedPage === "about" || selectedPage === "gallery" || selectedPage === "workshops" || selectedPage === "shop") && (
                      <div className="grid gap-4">
                        {[
                          { key: "page-title", label: "Page Title", placeholder: "Page title..." },
                          { key: "page-intro", label: "Page Introduction", placeholder: "Introduction text..." },
                          { key: "section-1-title", label: "Section 1 Title", placeholder: "First section title..." },
                          { key: "section-1-content", label: "Section 1 Content", placeholder: "First section content..." },
                          { key: "section-2-title", label: "Section 2 Title", placeholder: "Second section title..." },
                          { key: "section-2-content", label: "Section 2 Content", placeholder: "Second section content..." },
                        ].map((section) => {
                          const existingContent = websiteContent?.find(c => c.pageSlug === selectedPage && c.sectionKey === section.key);
                          return (
                            <div key={section.key} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                              <div className="flex-1">
                                <Label className="font-medium">{section.label}</Label>
                                <p className="text-xs text-muted-foreground mb-2">{section.key}</p>
                                {editingContent?.sectionKey === section.key && editingContent?.pageSlug === selectedPage ? (
                                  <div className="space-y-2">
                                    <Textarea 
                                      value={editingContent.content}
                                      onChange={(e) => setEditingContent({...editingContent, content: e.target.value})}
                                      className="min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => updateContent.mutate(editingContent)} disabled={updateContent.isPending}>
                                        {updateContent.isPending ? "Saving..." : "Save"}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingContent(null)}>Cancel</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-foreground/80 bg-muted/50 p-2 rounded">
                                    {existingContent?.content || <span className="italic text-muted-foreground">{section.placeholder}</span>}
                                  </p>
                                )}
                              </div>
                              {editingContent?.sectionKey !== section.key && (
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => setEditingContent({ pageSlug: selectedPage, sectionKey: section.key, content: existingContent?.content || "" })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Image Slots for Selected Page */}
                <Card className="p-6">
                  <h3 className="font-semibold text-lg border-b pb-2 mb-6">Page Images - {selectedPage}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Assign images from your Media Library to specific slots on this page. 
                    First upload images in the Media tab, then assign them here.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Image slot definitions per page */}
                    {selectedPage === "home" && ["hero-background", "hero-overlay", "about-image-1", "about-image-2", "featured-sculpture"].map((slotKey) => (
                      <div key={slotKey} className="border rounded-lg p-4 bg-card">
                        <Label className="font-medium capitalize">{slotKey.replace(/-/g, " ")}</Label>
                        <div className="aspect-video bg-muted rounded mt-2 flex items-center justify-center relative overflow-hidden">
                          <span className="text-xs text-muted-foreground">No image assigned</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full mt-2 gap-2" data-testid={`button-assign-${slotKey}`}>
                              <ImageIcon className="w-4 h-4" />
                              Assign Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Select Image for {slotKey.replace(/-/g, " ")}</DialogTitle>
                              <DialogDescription>Choose an image from your media library</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {mediaAssets?.map((asset) => (
                                <div 
                                  key={asset.id} 
                                  className="relative aspect-video bg-muted rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-bronze transition-colors"
                                  onClick={() => assignImageToSlot.mutate({ pageSlug: selectedPage, slotKey, assetId: asset.id })}
                                >
                                  <img src={asset.url} alt={asset.altText || ""} className="w-full h-full object-cover" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                    <p className="text-xs text-white truncate">{asset.altText || asset.filename}</p>
                                  </div>
                                </div>
                              ))}
                              {(!mediaAssets || mediaAssets.length === 0) && (
                                <div className="col-span-3 text-center py-8 text-muted-foreground">
                                  No images in library. Add images in the Media tab first.
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}

                    {selectedPage === "sculptures" && ["protea-1", "protea-2", "protea-3", "cones-1", "cones-2", "cones-3", "bulbs-1", "bulbs-2", "bulbs-3", "branches-1", "branches-2", "branches-3"].map((slotKey) => (
                      <div key={slotKey} className="border rounded-lg p-4 bg-card">
                        <Label className="font-medium capitalize">{slotKey.replace(/-/g, " ")}</Label>
                        <div className="aspect-video bg-muted rounded mt-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No image assigned</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full mt-2 gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Assign Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Select Image for {slotKey.replace(/-/g, " ")}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {mediaAssets?.map((asset) => (
                                <div 
                                  key={asset.id} 
                                  className="relative aspect-video bg-muted rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-bronze transition-colors"
                                  onClick={() => assignImageToSlot.mutate({ pageSlug: selectedPage, slotKey, assetId: asset.id })}
                                >
                                  <img src={asset.url} alt={asset.altText || ""} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}

                    {selectedPage === "gallery" && ["gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-6", "gallery-7", "gallery-8", "gallery-9"].map((slotKey) => (
                      <div key={slotKey} className="border rounded-lg p-4 bg-card">
                        <Label className="font-medium capitalize">{slotKey.replace(/-/g, " ")}</Label>
                        <div className="aspect-video bg-muted rounded mt-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No image assigned</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full mt-2 gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Assign Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Select Image for {slotKey.replace(/-/g, " ")}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {mediaAssets?.map((asset) => (
                                <div 
                                  key={asset.id} 
                                  className="relative aspect-video bg-muted rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-bronze transition-colors"
                                  onClick={() => assignImageToSlot.mutate({ pageSlug: selectedPage, slotKey, assetId: asset.id })}
                                >
                                  <img src={asset.url} alt={asset.altText || ""} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}

                    {(selectedPage === "founding-100" || selectedPage === "about" || selectedPage === "workshops" || selectedPage === "shop") && ["hero-image", "section-image-1", "section-image-2", "background"].map((slotKey) => (
                      <div key={slotKey} className="border rounded-lg p-4 bg-card">
                        <Label className="font-medium capitalize">{slotKey.replace(/-/g, " ")}</Label>
                        <div className="aspect-video bg-muted rounded mt-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No image assigned</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full mt-2 gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Assign Image
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Select Image for {slotKey.replace(/-/g, " ")}</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {mediaAssets?.map((asset) => (
                                <div 
                                  key={asset.id} 
                                  className="relative aspect-video bg-muted rounded overflow-hidden cursor-pointer border-2 border-transparent hover:border-bronze transition-colors"
                                  onClick={() => assignImageToSlot.mutate({ pageSlug: selectedPage, slotKey, assetId: asset.id })}
                                >
                                  <img src={asset.url} alt={asset.altText || ""} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
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
                      <DialogDescription>Upload a file or enter image URL</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="media-file">Upload Image or Video</Label>
                        <Input id="media-file" type="file" accept="image/*,video/*" onChange={(e) => setMediaForm({...mediaForm, file: e.target.files?.[0] || null})} data-testid="input-media-file" />
                        <p className="text-xs text-muted-foreground">Or enter URL below</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="media-url">Image/Video URL</Label>
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
                      <Button onClick={() => createMedia.mutate({ url: mediaForm.url || undefined, file: mediaForm.file || undefined, altText: mediaForm.altText, caption: mediaForm.caption, tags: mediaForm.tags ? mediaForm.tags.split(',').map(t => t.trim()) : undefined })} disabled={createMedia.isPending || (!mediaForm.file && !mediaForm.url)} data-testid="button-save-media">
                        {createMedia.isPending ? "Uploading..." : "Add Media"}
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

            {/* Specimens Tab */}
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
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full cursor-pointer flex items-center gap-2"
                            data-testid={`button-upload-${specimen.id}`}
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
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const dataUrl = event.target?.result as string;
                                    const updated = { ...customImages, [specimen.id]: dataUrl };
                                    setCustomImages(updated);
                                    sessionStorage.setItem("specimenCustomImages", JSON.stringify(updated));
                                  };
                                  reader.readAsDataURL(e.target.files[0]);
                                }
                              }}
                            />
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
                          ✓ Custom image loaded
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
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
