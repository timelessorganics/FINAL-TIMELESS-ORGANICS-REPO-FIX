
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Users, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface WorkshopDate {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  depositAmount: number;
  status: "available" | "filling_fast" | "sold_out";
  location: string;
}

export default function WorkshopCalendarPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<WorkshopDate | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    phone: "",
    emergencyContact: "",
    dietaryRestrictions: "",
  });

  // Fetch available workshop dates
  const { data: workshopDates = [], isLoading } = useQuery<WorkshopDate[]>({
    queryKey: ["/api/workshops/calendar"],
  });

  // Book workshop mutation
  const bookWorkshop = useMutation({
    mutationFn: async (data: { workshopDateId: string; phone: string; emergencyContact: string; dietaryRestrictions: string }) => {
      const response = await fetch("/api/workshops/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sb-access-token")}`,
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to book workshop");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops/calendar"] });
      setShowBookingDialog(false);
      
      // Redirect to payment
      window.location.href = `/workshop-payment/${data.bookingId}`;
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message,
      });
    },
  });

  // Join waitlist mutation
  const joinWaitlist = useMutation({
    mutationFn: async (workshopDateId: string) => {
      const response = await fetch("/api/workshops/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sb-access-token")}`,
        },
        body: JSON.stringify({ workshopDateId }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to join waitlist");
      }

      return response.json();
    },
    onSuccess: () => {
      setShowWaitlistDialog(false);
      toast({
        title: "Added to Waitlist",
        description: "We'll notify you if a spot opens up for this workshop.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Waitlist Error",
        description: error.message,
      });
    },
  });

  const handleBookClick = (workshopDate: WorkshopDate) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to book a workshop.",
      });
      return;
    }

    setSelectedDate(workshopDate);

    if (workshopDate.status === "sold_out") {
      setShowWaitlistDialog(true);
    } else {
      setShowBookingDialog(true);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) return;

    bookWorkshop.mutate({
      workshopDateId: selectedDate.id,
      phone: bookingForm.phone,
      emergencyContact: bookingForm.emergencyContact,
      dietaryRestrictions: bookingForm.dietaryRestrictions,
    });
  };

  const handleJoinWaitlist = () => {
    if (!selectedDate) return;
    joinWaitlist.mutate(selectedDate.id);
  };

  const getStatusBadge = (workshopDate: WorkshopDate) => {
    const spotsLeft = workshopDate.maxParticipants - workshopDate.currentParticipants;

    if (workshopDate.status === "sold_out") {
      return <Badge variant="destructive">Sold Out</Badge>;
    }

    if (spotsLeft <= 2) {
      return <Badge className="bg-accent-gold text-background">Only {spotsLeft} Spots Left</Badge>;
    }

    return <Badge variant="outline" className="text-patina border-patina">{spotsLeft} Spots Available</Badge>;
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="kicker mb-4">BOOK YOUR EXPERIENCE</div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Workshop <span className="moving-fill">Calendar</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a date to begin your bronze casting journey. Each workshop is limited to 6 participants 
              for personalized instruction.
            </p>
          </div>

          {/* Workshop Dates Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze mx-auto"></div>
            </div>
          ) : workshopDates.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">No Workshops Scheduled Yet</h3>
              <p className="text-muted-foreground">
                Workshop dates will be announced soon. Sign up for our newsletter to be notified.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshopDates.map((workshopDate) => (
                <Card key={workshopDate.id} className="p-6 hover:border-bronze transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-2xl font-bold text-accent-gold mb-1">
                        {format(new Date(workshopDate.date), "MMM d")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(workshopDate.date), "EEEE, yyyy")}
                      </div>
                    </div>
                    {getStatusBadge(workshopDate)}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-patina" />
                      <span>{workshopDate.startTime} - {workshopDate.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-patina" />
                      <span>{workshopDate.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-patina" />
                      <span>{workshopDate.currentParticipants}/{workshopDate.maxParticipants} participants</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-card/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Deposit Required</div>
                    <div className="text-2xl font-bold text-bronze">
                      R{(workshopDate.depositAmount / 100).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Full payment due 7 days before workshop
                    </div>
                  </div>

                  <Button
                    className={workshopDate.status === "sold_out" ? "w-full" : "w-full btn-bronze"}
                    variant={workshopDate.status === "sold_out" ? "outline" : "default"}
                    onClick={() => handleBookClick(workshopDate)}
                  >
                    {workshopDate.status === "sold_out" ? "Join Waitlist" : "Book Now"}
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* Info Section */}
          <Card className="mt-12 p-8 bg-gradient-to-br from-bronze/10 to-accent-gold/10 border-bronze/30">
            <h3 className="font-serif text-2xl font-bold mb-4">What to Expect</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-patina" />
                  Day 1: Preparation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Learn investment techniques, prepare your specimen, and create your mold. 
                  Overnight burnout at 700°C.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-patina" />
                  Day 2: Bronze Pour
                </h4>
                <p className="text-sm text-muted-foreground">
                  Witness the 1100°C pour, break out your casting, learn finishing and patina techniques.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Workshop</DialogTitle>
            <DialogDescription>
              {selectedDate && (
                <>
                  {format(new Date(selectedDate.date), "EEEE, MMMM d, yyyy")} • {selectedDate.startTime}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                placeholder="+27 XX XXX XXXX"
              />
            </div>

            <div>
              <Label htmlFor="emergency">Emergency Contact *</Label>
              <Input
                id="emergency"
                value={bookingForm.emergencyContact}
                onChange={(e) => setBookingForm({ ...bookingForm, emergencyContact: e.target.value })}
                placeholder="Name and phone number"
              />
            </div>

            <div>
              <Label htmlFor="dietary">Dietary Restrictions (Optional)</Label>
              <Input
                id="dietary"
                value={bookingForm.dietaryRestrictions}
                onChange={(e) => setBookingForm({ ...bookingForm, dietaryRestrictions: e.target.value })}
                placeholder="Any allergies or dietary needs"
              />
            </div>

            <div className="p-4 bg-card/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Deposit Amount</div>
              <div className="text-2xl font-bold text-bronze">
                R{selectedDate ? (selectedDate.depositAmount / 100).toLocaleString() : 0}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Secures your spot. Full payment due 7 days before workshop.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button
              className="btn-bronze"
              onClick={handleConfirmBooking}
              disabled={!bookingForm.phone || !bookingForm.emergencyContact || bookWorkshop.isPending}
            >
              {bookWorkshop.isPending ? "Processing..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waitlist Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Workshop Waitlist</DialogTitle>
            <DialogDescription>
              {selectedDate && (
                <>
                  This workshop on {format(new Date(selectedDate.date), "MMMM d, yyyy")} is currently sold out.
                  Join the waitlist to be notified if a spot opens up.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-card/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              If someone cancels, we'll email you immediately with a link to secure your spot. 
              Waitlist positions are first-come, first-served.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWaitlistDialog(false)}>
              Cancel
            </Button>
            <Button
              className="btn-bronze"
              onClick={handleJoinWaitlist}
              disabled={joinWaitlist.isPending}
            >
              {joinWaitlist.isPending ? "Adding..." : "Join Waitlist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
