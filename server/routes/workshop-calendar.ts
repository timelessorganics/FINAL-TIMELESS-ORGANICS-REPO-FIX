
import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../supabaseAuth";

export function registerWorkshopRoutes(app: Express) {
  // Public: Get all workshop dates
  app.get("/api/workshops/calendar", async (req, res) => {
    try {
      const workshops = await storage.getWorkshopDates();
      res.json(workshops);
    } catch (error: any) {
      console.error("Get workshop calendar error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch workshops" });
    }
  });

  // Protected: Book a workshop
  app.post("/api/workshops/book", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { workshopDateId, phone, emergencyContact, dietaryRestrictions } = req.body;

      // Validate inputs
      if (!workshopDateId || !phone || !emergencyContact) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get workshop date
      const workshopDate = await storage.getWorkshopDate(workshopDateId);
      if (!workshopDate) {
        return res.status(404).json({ message: "Workshop date not found" });
      }

      // Check if workshop is full
      if (workshopDate.currentParticipants >= workshopDate.maxParticipants) {
        return res.status(409).json({ message: "Workshop is sold out" });
      }

      // Check if user already booked this workshop
      const existingBooking = await storage.getWorkshopBooking(userId, workshopDateId);
      if (existingBooking) {
        return res.status(409).json({ message: "You have already booked this workshop" });
      }

      // Create booking
      const booking = await storage.createWorkshopBooking({
        userId,
        workshopDateId,
        phone,
        emergencyContact,
        dietaryRestrictions: dietaryRestrictions || null,
        depositAmount: workshopDate.depositAmount,
        status: "pending_deposit",
      });

      res.status(201).json({ bookingId: booking.id });
    } catch (error: any) {
      console.error("Book workshop error:", error);
      res.status(500).json({ message: error.message || "Failed to book workshop" });
    }
  });

  // Protected: Join waitlist
  app.post("/api/workshops/waitlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { workshopDateId } = req.body;

      if (!workshopDateId) {
        return res.status(400).json({ message: "Workshop date ID required" });
      }

      // Check if already on waitlist
      const existing = await storage.getWaitlistEntry(userId, workshopDateId);
      if (existing) {
        return res.status(409).json({ message: "Already on waitlist for this workshop" });
      }

      // Add to waitlist
      await storage.addToWaitlist({
        userId,
        workshopDateId,
      });

      res.json({ message: "Added to waitlist successfully" });
    } catch (error: any) {
      console.error("Join waitlist error:", error);
      res.status(500).json({ message: error.message || "Failed to join waitlist" });
    }
  });

  // Admin: Create workshop date
  app.post("/api/admin/workshops/dates", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user?.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { date, startTime, endTime, maxParticipants, depositAmount, location } = req.body;

      const workshopDate = await storage.createWorkshopDate({
        date: new Date(date),
        startTime,
        endTime,
        maxParticipants: maxParticipants || 6,
        depositAmount: depositAmount || 100000, // R1,000 default
        location: location || "Kommetjie Foundry, Cape Town",
      });

      res.status(201).json(workshopDate);
    } catch (error: any) {
      console.error("Create workshop date error:", error);
      res.status(500).json({ message: error.message || "Failed to create workshop date" });
    }
  });
}
