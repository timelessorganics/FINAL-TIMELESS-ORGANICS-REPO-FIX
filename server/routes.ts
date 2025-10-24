import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPurchaseSchema, insertSculptureSchema, insertSculptureSelectionSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { 
  generateBronzeClaimCode, 
  generateWorkshopVoucherCode, 
  generateLifetimeReferralCode,
  getWorkshopDiscount 
} from "./utils/codeGenerator";
import { 
  createPaymentData, 
  generateSignature, 
  generatePayFastUrl,
  verifyPayFastSignature,
  getPayFastConfig
} from "./utils/payfast";
import { generateCertificate } from "./utils/certificateGenerator";
import { sendCertificateEmail, sendPurchaseConfirmationEmail } from "./utils/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth route
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Public: Get seat availability
  app.get("/api/seats/availability", async (_req: Request, res: Response) => {
    try {
      const seats = await storage.getSeats();
      res.json(seats);
    } catch (error: any) {
      console.error("Get seats error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch seats" });
    }
  });

  // Protected: Initiate purchase with PayFast
  app.post("/api/purchase/initiate", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      const result = insertPurchaseSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }

      // Check seat availability
      const seat = await storage.getSeatByType(result.data.seatType);
      if (!seat) {
        return res.status(404).json({ message: "Seat type not found" });
      }

      const available = seat.totalAvailable - seat.sold;
      if (available <= 0) {
        return res.status(409).json({ message: `All ${result.data.seatType} seats are sold out` });
      }

      // Create purchase record
      const purchase = await storage.createPurchase({
        userId: result.data.userId,
        seatType: result.data.seatType,
        amount: result.data.amount,
      });

      // Create PayFast payment data
      const paymentData = createPaymentData(
        purchase.id,
        purchase.amount,
        purchase.seatType,
        req.user.email || 'noreply@timelessorganics.com',
        req.user.firstName || 'Investor'
      );

      // Add passphrase and generate signature
      const config = getPayFastConfig();
      const signature = generateSignature(paymentData, config.passphrase);

      // Build PayFast form data
      const payFastUrl = generatePayFastUrl();
      const formData = {
        ...paymentData,
        signature,
      };

      // Return form data for frontend to submit
      res.json({
        paymentUrl: payFastUrl,
        formData,
        purchaseId: purchase.id,
      });
    } catch (error: any) {
      console.error("Purchase initiation error:", error);
      res.status(500).json({ message: error.message || "Failed to initiate purchase" });
    }
  });

  // Public: PayFast webhook (ITN - Instant Transaction Notification)
  app.post("/api/payment/notify", async (req: Request, res: Response) => {
    try {
      const pfData = req.body;
      console.log("PayFast notification received:", pfData);

      // Verify signature
      const signature = pfData.signature;
      delete pfData.signature;
      
      const isValid = verifyPayFastSignature(pfData, signature);
      if (!isValid) {
        console.error("Invalid PayFast signature");
        return res.status(400).send("Invalid signature");
      }

      // Check payment status
      const purchaseId = pfData.m_payment_id;
      const paymentStatus = pfData.payment_status;

      if (paymentStatus === "COMPLETE") {
        const purchase = await storage.getPurchase(purchaseId);
        if (!purchase) {
          console.error("Purchase not found:", purchaseId);
          return res.status(404).send("Purchase not found");
        }

        // Only process if not already completed
        if (purchase.status !== "completed") {
          // Update seat count
          await storage.updateSeatSold(purchase.seatType, 1);

          // Generate unique codes
          const bronzeCode = await storage.createCode({
            purchaseId: purchase.id,
            type: "bronze_claim",
            code: generateBronzeClaimCode(),
            maxRedemptions: 1, // Single use
          });

          const workshopCode = await storage.createCode({
            purchaseId: purchase.id,
            type: "workshop_voucher",
            code: generateWorkshopVoucherCode(purchase.seatType),
            discount: getWorkshopDiscount(purchase.seatType),
            transferable: true,
            maxRedemptions: 1, // Single use but transferable
          });

          const referralCode = await storage.createCode({
            purchaseId: purchase.id,
            type: "lifetime_referral",
            code: generateLifetimeReferralCode(),
            transferable: true,
            maxRedemptions: null as any, // Unlimited use
          });

          // Get user info for certificate
          const user = await storage.getUser(purchase.userId);
          const userName = user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user?.firstName || "Valued Investor";

          // Generate certificate
          const certificateUrl = await generateCertificate(
            purchase,
            [bronzeCode, workshopCode, referralCode],
            userName
          );

          // Update purchase status
          await storage.updatePurchaseStatus(
            purchase.id,
            "completed",
            pfData.pf_payment_id,
            certificateUrl
          );

          console.log("Purchase completed successfully:", purchaseId);

          // Send email notifications
          const userEmail = user?.email || pfData.email_address;
          if (userEmail) {
            // Send purchase confirmation
            await sendPurchaseConfirmationEmail(userEmail, userName, purchase);
            
            // Send certificate with codes
            await sendCertificateEmail(
              userEmail,
              userName,
              purchase,
              [bronzeCode, workshopCode, referralCode],
              certificateUrl
            );
          }
        }
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
        await storage.updatePurchaseStatus(purchaseId, "failed", pfData.pf_payment_id);
      }

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Payment notification error:", error);
      res.status(500).send("Error processing notification");
    }
  });

  // Public: Get all sculptures
  app.get("/api/sculptures", async (_req: Request, res: Response) => {
    try {
      const sculptures = await storage.getSculptures();
      res.json(sculptures);
    } catch (error: any) {
      console.error("Get sculptures error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch sculptures" });
    }
  });

  // Protected: Create sculpture selection
  app.post("/api/sculpture-selection", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      const result = insertSculptureSelectionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }

      // Verify purchase belongs to user
      const purchase = await storage.getPurchase(result.data.purchaseId);
      if (!purchase || purchase.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check if already selected
      const existing = await storage.getSculptureSelectionByPurchaseId(result.data.purchaseId);
      if (existing) {
        return res.status(409).json({ message: "Sculpture already selected for this purchase" });
      }

      const selection = await storage.createSculptureSelection(result.data);
      res.status(201).json(selection);
    } catch (error: any) {
      console.error("Sculpture selection error:", error);
      res.status(500).json({ message: error.message || "Failed to save selection" });
    }
  });

  // Protected: Get user's dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      const purchases = await storage.getPurchasesByUserId(userId);
      
      // Fetch codes for each purchase
      const purchasesWithCodes = await Promise.all(
        purchases.map(async (purchase) => {
          const codes = await storage.getCodesByPurchaseId(purchase.id);
          return { ...purchase, codes };
        })
      );

      res.json(purchasesWithCodes);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch dashboard" });
    }
  });

  // Protected: Get specific purchase
  app.get("/api/purchase/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;

      const purchase = await storage.getPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (purchase.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(purchase);
    } catch (error: any) {
      console.error("Get purchase error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch purchase" });
    }
  });

  // Admin: Get all seats (admin only)
  app.get("/api/admin/seats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const seats = await storage.getSeats();
      res.json(seats);
    } catch (error: any) {
      console.error("Admin seats error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch seats" });
    }
  });

  // Admin: Get all purchases (admin only)
  app.get("/api/admin/purchases", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const purchases = await storage.getAllPurchases();
      res.json(purchases);
    } catch (error: any) {
      console.error("Admin purchases error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch purchases" });
    }
  });

  // Admin: Get all codes (admin only)
  app.get("/api/admin/codes", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const codes = await storage.getAllCodes();
      res.json(codes);
    } catch (error: any) {
      console.error("Admin codes error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch codes" });
    }
  });

  // Protected: Redeem code
  app.post("/api/codes/redeem", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { code: codeString } = req.body;

      if (!codeString) {
        return res.status(400).json({ message: "Code is required" });
      }

      // Find code
      const code = await storage.getCodeByCode(codeString);
      if (!code) {
        return res.status(404).json({ message: "Code not found" });
      }

      // Check if code has redemption limit
      if (code.maxRedemptions !== null) {
        if (code.redemptionCount >= code.maxRedemptions) {
          return res.status(409).json({ message: "Code has reached maximum redemptions" });
        }
      }

      // Check if already redeemed by this user (for single-use codes)
      const redeemedBy = (code.redeemedBy as string[]) || [];
      if (code.maxRedemptions === 1 && redeemedBy.includes(userId)) {
        return res.status(409).json({ message: "Code already redeemed by you" });
      }

      // Redeem code
      await storage.redeemCode(code.id, user?.email || userId);

      // Create referral tracking record if this is a referral code
      if (code.type === "lifetime_referral") {
        await storage.createReferral({
          referralCodeId: code.id,
          referredUserId: userId,
          status: "pending",
        });
      }

      res.json({
        message: "Code redeemed successfully",
        code: {
          ...code,
          redemptionCount: code.redemptionCount + 1,
        },
      });
    } catch (error: any) {
      console.error("Code redemption error:", error);
      res.status(500).json({ message: error.message || "Failed to redeem code" });
    }
  });

  // Protected: Get referral analytics for a code by ID
  app.get("/api/referrals/code/:codeId", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { codeId } = req.params;

      // Fetch code by ID
      const code = await storage.getCodeById(codeId);
      if (!code) {
        return res.status(404).json({ message: "Code not found" });
      }

      // Get purchase for this code to verify ownership
      const purchase = await storage.getPurchase(code.purchaseId);
      if (purchase?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get all referrals for this code
      const referralRecords = await storage.getReferralsByCodeId(code.id);

      res.json({
        code,
        referrals: referralRecords,
        stats: {
          totalRedemptions: code.redemptionCount,
          totalReferrals: referralRecords.length,
          pendingReferrals: referralRecords.filter(r => r.status === "pending").length,
          completedReferrals: referralRecords.filter(r => r.status === "completed").length,
        },
      });
    } catch (error: any) {
      console.error("Referral analytics error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch referral analytics" });
    }
  });

  // Admin: Create sculpture (admin only)
  app.post("/api/admin/sculptures", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = insertSculptureSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromError(result.error).toString() 
        });
      }

      const sculpture = await storage.createSculpture(result.data);
      res.status(201).json(sculpture);
    } catch (error: any) {
      console.error("Create sculpture error:", error);
      res.status(500).json({ message: error.message || "Failed to create sculpture" });
    }
  });

  // Serve certificates statically
  app.use("/certificates", express.static(path.join(process.cwd(), "certificates")));

  const httpServer = createServer(app);
  return httpServer;
}
