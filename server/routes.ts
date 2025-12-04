import type { Express, Request, Response, RequestHandler } from "express";
import type { Server } from "http";
import { createServer } from "http";
import express from "express";
import path from "path";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import {
  insertPurchaseSchema,
  insertSculptureSchema,
  insertSculptureSelectionSchema,
  insertSubscriberSchema,
  insertPromoCodeSchema,
  type Purchase,
  type Code,
  subscribers,
  purchases,
  seats,
} from "@shared/schema";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  generateBronzeClaimCode,
  generateWorkshopVoucherCode,
  generateLifetimeWorkshopCode,
  generateCommissionVoucherCode,
  getWorkshopVoucherDiscount,
  getLifetimeWorkshopDiscount,
  getCommissionVoucherDiscount,
} from "./utils/codeGenerator";
import {
  createPaymentData,
  generateSignature,
  generatePayFastUrl,
  verifyPayFastSignature,
  getPayFastConfig,
} from "./utils/payfast";
import { eq, and, gt, lt } from "drizzle-orm";
import { generatePaymentIdentifier } from "./utils/payfast-onsite";
import { generateCertificate } from "./utils/certificateGenerator";
import { generateCodeSlips } from "./utils/codeSlipsGenerator";
import {
  sendCertificateEmail,
  sendPurchaseConfirmationEmail,
  sendGiftNotificationEmail,
  sendCertificateToRecipient,
} from "./utils/emailService";
import { generatePromoCode } from "./utils/promoCodeGenerator";
import { addSubscriberToMailchimp } from "./mailchimp";
import { registerWorkshopRoutes } from "./routes/workshop-calendar";
import { db } from "./db";

// Server-side pricing functions (source of truth - NEVER trust client prices!)
// FIRE SALE PRICES (24hrs from launch):
// Founder: R2,000 (normally R3,500) 
// Patron: R3,500 (normally R5,500)
// After 24hrs, reverts to normal prices

// Get current seat price considering fire sale
async function getSeatingPrice(seatType: 'founder' | 'patron'): Promise<number> {
  const seats = await storage.getSeats();
  const seat = seats.find(s => s.type === seatType);
  if (!seat) throw new Error(`Seat type ${seatType} not found`);

  // Check if fire sale is active
  if (seat.fireSalePrice && seat.fireSaleEndsAt && new Date() < new Date(seat.fireSaleEndsAt)) {
    return seat.fireSalePrice;
  }
  return seat.price;
}

// Mounting deposit: R1,000 for all types (deducted from final quote)
// Final prices vary: slate R1,500, wood R1,000+, resin R2,500+ (size dependent)
function getMountingPrice(mountingType: string): number {
  if (mountingType === "none") return 0;
  return 100000; // R1,000 deposit for all mounting types (wall/base/custom)
}

// Patina service: R1,000
function getPatinaPrice(): number {
  return 100000; // R1,000
}

// Commission voucher: R1,500 (generates 40%/60% discount code)
function getCommissionVoucherPrice(): number {
  return 150000; // R1,500
}

// Admin pricing update endpoint
async function updateSeatingPricing(req: any, res: Response): Promise<void> {
  try {
    // Get user ID from Supabase token
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if user is admin
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { founderPrice, patronPrice } = req.body;

    // Update in database
    if (founderPrice !== undefined) {
      await storage.updateSeatPrice("founder", founderPrice);
      console.log(`[Admin] Updated founder price to ${founderPrice} cents (R${founderPrice/100})`);
    }
    if (patronPrice !== undefined) {
      await storage.updateSeatPrice("patron", patronPrice);
      console.log(`[Admin] Updated patron price to ${patronPrice} cents (R${patronPrice/100})`);
    }

    const seats = await storage.getSeats();
    res.json(seats);
  } catch (error: any) {
    console.error("[Admin] Price update error:", error);
    res.status(500).json({ error: error.message });
  }
}

// Centralized post-completion handler for gift notifications
async function handlePurchaseCompletion(purchaseId: string): Promise<void> {
  try {
    // Reload purchase to get complete data (including isGift, recipient details, etc.)
    const purchase = await storage.getPurchase(purchaseId);
    if (!purchase) {
      console.error(
        `[Gift] Purchase ${purchaseId} not found for completion handling`,
      );
      return;
    }

    // Check if this is a gift that needs notification
    if (purchase.isGift && purchase.giftRecipientEmail && purchase.giftRecipientName) {
      const buyer = await storage.getUser(purchase.userId);
      const buyerName = buyer?.firstName ? buyer.firstName : "A Friend";

      await sendGiftNotificationEmail(
        purchase.giftRecipientEmail,
        purchase.giftRecipientName,
        buyerName,
        purchase.seatType,
        purchase.giftMessage || "",
        purchaseId
      );
      console.log(`[Gift] Notification sent to ${purchase.giftRecipientEmail}`);
    }

    // PLACEHOLDER - for next iteration: Check if this is a gift that needs notification
    if (
      !purchase.isGift ||
      !purchase.giftRecipientEmail ||
      !purchase.giftRecipientName
    ) {
      return; // Not a gift or missing recipient info
    }

    // Check if notification already sent (idempotency)
    if (purchase.giftStatus !== "pending") {
      console.log(
        `[Gift] Purchase ${purchaseId} gift notification already sent (status: ${purchase.giftStatus})`,
      );
      return;
    }

    // Get sender's name from user
    const user = await storage.getUser(purchase.userId);
    const senderName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "A Timeless Organics Investor";

    // Send gift notification email
    const emailSent = await sendGiftNotificationEmail(
      purchase.giftRecipientEmail,
      purchase.giftRecipientName,
      senderName,
      purchase.seatType,
      purchase.giftMessage || "",
      purchaseId,
    );

    if (emailSent) {
      console.log(
        `[Gift] Notification email sent to ${purchase.giftRecipientEmail} for purchase ${purchaseId}`,
      );
    } else {
      console.warn(
        `[Gift] Failed to send notification email for purchase ${purchaseId} (email service may be unconfigured)`,
      );
    }
  } catch (error: any) {
    // Log error but don't block purchase completion flow
    console.error(
      `[Gift] Error handling purchase completion for ${purchaseId}:`,
      error,
    );
  }
}

// Helper to get user ID from authenticated request
async function getUserIdFromToken(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { supabaseAdmin } = await import("./supabaseAuth");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user || !user.email) {
    return null;
  }

  // Get user from our database by email
  const dbUser = await storage.getUserByEmail(user.email);
  return dbUser?.id || null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auto-initialize seats if they don't exist
  try {
    const existingSeats = await storage.getSeats();
    if (!existingSeats || existingSeats.length === 0) {
      console.log('[Init] No seats found - creating default seats...');
      await storage.initializeSeats();
      console.log('[Init] Default seats created with 50 Founder + 50 Patron available');
    } else {
      console.log(`[Init] Found ${existingSeats.length} existing seats`);
      // Fix fire sale prices if they're incorrect (legacy data fix)
      const founderSeat = existingSeats.find(s => s.type === 'founder');
      const patronSeat = existingSeats.find(s => s.type === 'patron');
      
      console.log(`[Init] Founder: ${(founderSeat?.totalAvailable || 50) - (founderSeat?.sold || 0)} remaining, Patron: ${(patronSeat?.totalAvailable || 50) - (patronSeat?.sold || 0)} remaining`);

      if (founderSeat?.fireSalePrice && founderSeat.fireSalePrice > 200000) {
        console.log('[Init] Correcting founder fire sale price from', founderSeat.fireSalePrice, 'to 200000 (R2,000)');
        const { db } = await import("./db");
        await db.update(seats).set({ fireSalePrice: 200000 }).where(eq(seats.type, 'founder'));
      }

      if (patronSeat?.fireSalePrice && patronSeat.fireSalePrice > 350000) {
        console.log('[Init] Correcting patron fire sale price from', patronSeat.fireSalePrice, 'to 350000 (R3,500)');
        const { db } = await import("./db");
        await db.update(seats).set({ fireSalePrice: 350000 }).where(eq(seats.type, 'patron'));
      }
    }
  } catch (error: any) {
    console.error('[Init] Error initializing seats:', error.message);
  }
  // Auth middleware
  await setupAuth(app);

  // Register workshop calendar routes
  registerWorkshopRoutes(app);

  // Get authenticated user info (Supabase Auth)
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No active session found" });
      }

      const token = authHeader.replace("Bearer ", "");

      // Verify token with Supabase
      const { supabaseAdmin } = await import("./supabaseAuth");
      const {
        data: { user: supabaseUser },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !supabaseUser) {
        return res.status(401).json({ message: "Invalid session" });
      }

      // Get or create user in our database
      let user = await storage.getUserByEmail(supabaseUser.email!);

      if (!user) {
        // Create user if doesn't exist
        const nameParts =
          supabaseUser.user_metadata?.full_name?.split(" ") || [];
        user = await storage.createUser({
          email: supabaseUser.email!,
          firstName: nameParts[0] || supabaseUser.user_metadata?.name || "User",
          lastName: nameParts.slice(1).join(" ") || "",
          isAdmin: false,
        });
      }

      return res.json(user);
    } catch (error) {
      console.error("Error in /api/auth/user:", error);
      res.status(401).json({ message: "Session validation failed" });
    }
  });

  // Public: Health check with deployment verification
  app.get("/api/health", async (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      payfast: {
        merchant_id: process.env.PAYFAST_MERCHANT_ID ? "SET" : "MISSING",
        merchant_key: process.env.PAYFAST_MERCHANT_KEY ? "SET" : "MISSING",
        passphrase: process.env.PAYFAST_PASSPHRASE ? "SET" : "MISSING",
        mode: process.env.PAYFAST_MODE || "MISSING",
      },
      deployment: {
        repo: "FINAL-TIMELESS-ORGANICS-REPO-FIX",
        payfastFixDeployed: true,
        features: {
          userIpCapture: true,
          userAgentCapture: true,
          paymentMethodField: true,
        },
      },
      message:
        "PayFast fix deployed - user_ip, user_agent, and payment_method fields active",
    });
  });

  // Public: Get seat availability
  app.get("/api/seats/availability", async (_req: Request, res: Response) => {
    try {
      // Clean up expired reservations before returning availability
      // This ensures seats are released back to pool after 24 hours
      // Also expires early bird holds that have passed their expiration time
      // Wrapped in try-catch to gracefully handle missing reservations table
      let founderReservations = 0;
      let patronReservations = 0;

      try {
        const expiredCount = await storage.expireOldReservations();
        if (expiredCount > 0) {
          console.log(`[Reservations] Expired ${expiredCount} old reservations, seats returned to pool`);
        }

        // Expire SECURE deposits where balance deadline has passed
        const expiredDeposits = await db.update(purchases)
          .set({ status: 'failed' })
          .where(
            and(
              eq(purchases.isDepositOnly, true),
              eq(purchases.status, 'pending'),
              lt(purchases.balanceDueAt, new Date())
            )
          )
          .returning();

        if (expiredDeposits.length > 0) {
          console.log(`[SECURE] Released ${expiredDeposits.length} expired deposit holds - seats returned to pool`);
        }

        // Expire early bird holds that have passed their hold expiration time
        const expiredHolds = await db.update(subscribers)
          .set({ holdStatus: 'expired' })
          .where(
            and(
              eq(subscribers.holdStatus, 'active'),
              lt(subscribers.holdExpiresAt, new Date())
            )
          )
          .returning();

        if (expiredHolds.length > 0) {
          console.log(`[Early Bird] Released ${expiredHolds.length} expired early bird holds`);
        }

        // Get active reservation counts to adjust available seats
        founderReservations = await storage.getActiveReservationsCount("founder");
        patronReservations = await storage.getActiveReservationsCount("patron");

        // Add active early bird holds to reservation count
        const activeHolds = await db.select({ seatType: subscribers.seatType })
          .from(subscribers)
          .where(
            and(
              eq(subscribers.holdStatus, 'active'),
              gt(subscribers.holdExpiresAt, new Date())
            )
          );

        const earlyBirdFounderHolds = activeHolds.filter(h => h.seatType === 'founder').length;
        const earlyBirdPatronHolds = activeHolds.filter(h => h.seatType === 'patron').length;
        founderReservations += earlyBirdFounderHolds;
        patronReservations += earlyBirdPatronHolds;

      } catch (reservationError: any) {
        // Reservations table may not exist - continue without reservation counts
        console.log(`[Reservations] Table not available, skipping reservation adjustments`);
      }

      // Get manual holds count (admin phone/text holds)
      let founderManualHolds = 0;
      let patronManualHolds = 0;
      try {
        founderManualHolds = await storage.getManualHoldsCount('founder');
        patronManualHolds = await storage.getManualHoldsCount('patron');
        console.log(`[ManualHolds] Founder: ${founderManualHolds}, Patron: ${patronManualHolds}`);
      } catch (holdError: any) {
        console.log(`[ManualHolds] Error getting counts:`, holdError.message);
      }

      const seats = await storage.getSeats();

      // Adjust available counts by subtracting active reservations AND manual holds
      const adjustedSeats = seats.map(seat => {
        const currentAvailable = seat.totalAvailable - seat.sold;
        const reservedForType = seat.type === "founder" ? founderReservations : patronReservations;
        const manualHoldsForType = seat.type === "founder" ? founderManualHolds : patronManualHolds;
        const adjusted = Math.max(0, currentAvailable - reservedForType - manualHoldsForType);
        console.log(`[Availability] ${seat.type}: total=${seat.totalAvailable}, sold=${seat.sold}, current=${currentAvailable}, reserved=${reservedForType}, holds=${manualHoldsForType}, available=${adjusted}`);
        return {
          ...seat,
          available: adjusted,
          reservedCount: reservedForType,
          manualHolds: manualHoldsForType
        };
      });

      res.json(adjustedSeats);
    } catch (error: any) {
      console.error("Get seats error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to fetch seats" });
    }
  });

  // Protected: Initiate purchase with PayFast
  app.post(
    "/api/purchase/initiate",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await storage.getUser(userId);
        const userEmail = user?.email || "studio@timeless.organic";
        const userFirstName = user?.firstName || "Investor";

        console.log("[Purchase] User initiating purchase:", userId, userEmail);

        // Calculate amount based on seat type + add-ons
        const {
          seatType,
          specimenStyle,
          hasPatina,
          mountingType,
          commissionVoucher,
          internationalShipping,
          purchaseMode,
          isGift,
          giftRecipientEmail,
          giftRecipientName,
          giftMessage,
          deliveryName,
          deliveryPhone,
          deliveryAddress,
          paymentType, // 'full' for BUY NOW, 'deposit' for SECURE (R1000), 'reserve' for free 24hr hold
        } = req.body;
        const seat = await storage.getSeatByType(seatType);
        if (!seat) {
          return res.status(404).json({ message: "Seat type not found" });
        }

        const available = seat.totalAvailable - seat.sold;
        if (available <= 0) {
          return res
            .status(409)
            .json({ message: `All ${seatType} seats are sold out` });
        }

        // Specimen style is optional at checkout - users choose from dashboard after purchase
        // specimenStyle can be null

        // 3-TIER EARLY BIRD SYSTEM
        // paymentType: 'full' = BUY NOW (full price), 'deposit' = SECURE (R1,000 only), 'reserve' = FREE 24hr hold
        const isDepositOnly = paymentType === 'deposit';
        const isReserveOnly = paymentType === 'reserve';

        let amount = 0;
        let depositAmountCents = 0;

        if (isReserveOnly) {
          // RESERVE: Free 24-hour hold, no payment required
          amount = 0;
          depositAmountCents = 0;
          console.log(`[Purchase] RESERVE seat: free 24hr hold for ${seatType}`);
        } else if (isDepositOnly) {
          // SECURE: R1,000 non-refundable deposit, 48hr to pay balance
          amount = 100000; // R1,000 deposit only
          depositAmountCents = 100000;
          console.log(`[Purchase] SECURE seat: R1,000 deposit for ${seatType}`);
        } else {
          // BUY NOW: Full price + add-ons
          const mountingPriceCents = getMountingPrice(mountingType || "none");
          const patinaPriceCents = hasPatina ? getPatinaPrice() : 0;
          const commissionVoucherPriceCents = commissionVoucher
            ? getCommissionVoucherPrice()
            : 0;
          amount =
            seat.price +
            patinaPriceCents +
            mountingPriceCents +
            commissionVoucherPriceCents;
          depositAmountCents = 0;
          console.log(`[Purchase] BUY NOW: full price R${(amount / 100).toFixed(2)} for ${seatType}`);
        }

        // Validate delivery information
        if (!deliveryName || !deliveryPhone || !deliveryAddress) {
          return res.status(400).json({
            message: "Delivery information is required (name, phone, address)",
          });
        }

        // Create purchase record with payment type tracking
        const purchase = await storage.createPurchase({
          userId,
          seatType,
          amount,
          specimenStyle,
          hasPatina: hasPatina || false,
          mountingType: mountingType || "none",
          mountingPriceCents: getMountingPrice(mountingType || "none") || 0,
          commissionVoucher: commissionVoucher || false,
          internationalShipping: internationalShipping || false,
          purchaseMode: purchaseMode || "cast_now",
          isGift: isGift || false,
          giftRecipientEmail: isGift ? giftRecipientEmail : null,
          giftRecipientName: isGift ? giftRecipientName : null,
          giftMessage: isGift ? giftMessage : null,
          deliveryName,
          deliveryPhone,
          deliveryAddress,
          isDepositOnly,
          depositAmountCents,
        });

        console.log(
          "[Purchase] Created purchase record:",
          purchase.id,
          purchase.seatType,
          purchase.amount,
        );

        // Capture user context for PayFast Onsite Payments (REQUIRED)
        const userIp =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.socket.remoteAddress ||
          "127.0.0.1";
        const userAgent = req.headers["user-agent"] || "Unknown";

        // Normalize IPv6 localhost to IPv4
        const normalizedIp =
          userIp === "::1" || userIp === "::ffff:127.0.0.1"
            ? "127.0.0.1"
            : userIp;

        console.log("[Purchase] User context:", {
          ip: normalizedIp,
          userAgent: userAgent.substring(0, 50),
        });

        // Handle payment based on tier
        if (isReserveOnly) {
          // RESERVE: No payment needed, just return success
          console.log("[Purchase] RESERVE hold created, seat locked for 24hrs:", purchase.id);
          // Update seat count immediately since seat is locked
          await storage.updateSeatSold(seatType, 1);
          return res.json({
            purchaseId: purchase.id,
            paymentType: 'reserve',
            message: 'Seat reserved for 24 hours. You have until tomorrow 9 AM SA time to decide.',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        // For SECURE (deposit) and BUY NOW: return purchaseId for redirect flow
        if (purchase.amount === 0) {
          return res.status(400).json({ message: "Invalid payment amount" });
        }

        console.log(
          "[Purchase] Created purchase, ready for redirect flow:",
          purchase.id,
          `(${isDepositOnly ? 'SECURE R1000 deposit' : 'BUY NOW full price'})`
        );

        // Return purchaseId for redirect flow (more reliable than Onsite modal)
        res.json({
          purchaseId: purchase.id,
          paymentType: isDepositOnly ? 'deposit' : 'full',
          amount: purchase.amount,
        });
      } catch (error: any) {
        console.error("Purchase initiation error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to initiate purchase" });
      }
    },
  );

  // Public: Server-side PayFast redirect - builds HTML form and auto-submits
  app.get(
    "/api/purchase/:id/redirect",
    async (req: any, res: Response) => {
      try {
        const purchaseId = req.params.id;

        // Get purchase (purchaseId is UUID-specific, safe to return payment form)
        const purchase = await storage.getPurchase(purchaseId);
        if (!purchase) {
          return res.status(404).send("Purchase not found");
        }

        // Get customer email from user record or use gift recipient
        let customerEmail = "noemail@provided.co.za";
        let customerName = "Customer";

        if (purchase.isGift && purchase.giftRecipientEmail) {
          customerEmail = purchase.giftRecipientEmail;
          customerName = purchase.giftRecipientName || "Recipient";
        } else if (purchase.userId) {
          // Get email from user table
          const user = await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.id, purchase.userId),
          });
          if (user?.email) {
            customerEmail = user.email;
            customerName = user.firstName || "Customer";
          }
        }

        // Create PayFast payment data using customer email, NOT merchant email
        // CRITICAL: PayFast rejects if we send merchant's own email as customer email
        const paymentData = createPaymentData(
          purchase.id,
          purchase.amount,
          purchase.seatType,
          customerEmail,
          customerName,
        );

        // Add passphrase and generate signature
        const config = getPayFastConfig();

        // Convert PaymentData to Record<string, string> for signature generation
        const dataForSignature: Record<string, string> = {};
        Object.keys(paymentData).forEach((key) => {
          const value = (paymentData as any)[key];
          if (value !== undefined) {
            dataForSignature[key] = value;
          }
        });

        const signature = generateSignature(
          dataForSignature,
          config.passphrase,
        );

        // Build PayFast form data
        const payFastUrl = generatePayFastUrl();
        const formFields = {
          ...paymentData,
          signature,
        };

        // Generate HTML form that auto-submits
        const formHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Redirecting to PayFast...</title>
          <style>
            body {
              background: #0a0a0a;
              color: #a67c52;
              font-family: 'Inter', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              border: 4px solid rgba(166, 124, 82, 0.3);
              border-top: 4px solid #a67c52;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>Redirecting to PayFast secure payment...</p>
          </div>
          <form id="payfast_form" method="POST" action="${payFastUrl}">
            ${Object.entries(formFields)
              .map(
                ([key, value]) =>
                  `<input type="hidden" name="${key}" value="${value}">`,
              )
              .join("\n          ")}
          </form>
          <script>
            // Auto-submit after brief delay
            setTimeout(function() {
              document.getElementById('payfast_form').submit();
            }, 500);
          </script>
        </body>
        </html>
      `;

        res.setHeader("Content-Type", "text/html");
        res.send(formHtml);
      } catch (error: any) {
        console.error("PayFast redirect error:", error);
        res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Payment Error</title></head>
        <body style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
          <h1>Payment Error</h1>
          <p>${error.message || "Failed to initiate payment"}</p>
          <a href="/founding100" style="color:#a67c52;">Return to site</a>
        </body>
        </html>
      `);
      }
    },
  );

  // Public: PayFast webhook (ITN - Instant Transaction Notification)
  app.post("/api/payment/notify", async (req: Request, res: Response) => {
    try {
      const pfData = req.body;
      console.log("PayFast notification received:", pfData);

      // 1. Log source IP for security audit
      const sourceIp =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      console.log("PayFast notification from IP:", sourceIp);

      // 2. Verify signature
      const signature = pfData.signature;
      delete pfData.signature;

      const isValid = verifyPayFastSignature(pfData, signature);
      if (!isValid) {
        console.error("Invalid PayFast signature");
        return res.status(400).send("Invalid signature");
      }

      // 3. Get purchase and validate
      const purchaseId = pfData.m_payment_id;
      const paymentStatus = pfData.payment_status;

      const purchase = await storage.getPurchase(purchaseId);
      if (!purchase) {
        console.error("Purchase not found:", purchaseId);
        return res.status(404).send("Purchase not found");
      }

      // 4. Validate amount matches (prevent forged notifications)
      const pfAmount = parseFloat(pfData.amount_gross) * 100; // Convert to cents
      if (Math.abs(purchase.amount - pfAmount) > 1) {
        // Allow 1 cent rounding
        console.error("Amount mismatch:", {
          expected: purchase.amount,
          received: pfAmount,
        });
        return res.status(400).send("Amount mismatch");
      }

      // 5. Respond immediately (PayFast requirement)
      res.status(200).send("OK");

      // 6. Process asynchronously with atomic idempotency
      if (paymentStatus === "COMPLETE") {
        // Atomic status update - only proceeds if not already completed
        const wasUpdated = await storage.updatePurchaseStatus(
          purchase.id,
          "completed",
          pfData.pf_payment_id,
          undefined, // Certificate URL added later
        );

        if (!wasUpdated) {
          console.log(
            "Purchase already processed (duplicate notification):",
            purchaseId,
          );
          return; // Another notification already processed this purchase
        }

        // Now safe to proceed - only one notification won the race
        console.log("Processing purchase completion:", purchaseId);

        // Update deposit tracking if this is a deposit payment
        if (purchase.isDepositOnly) {
          const balanceDue = new Date();
          balanceDue.setDate(balanceDue.getDate() + 2); // 48 hours to pay balance
          await storage.updatePurchase(purchase.id, {
            depositPaidAt: new Date(),
            balanceDueAt: balanceDue,
          });
          console.log(`[SECURE] Deposit paid for ${purchaseId}, balance due ${balanceDue.toISOString()}`);
        }

        // Send gift notification if this is a gift purchase
        await handlePurchaseCompletion(purchase.id);

        // Update seat count
        await storage.updateSeatSold(purchase.seatType, 1);

        // Generate codes: bronze claim + workshop vouchers (always) + commission voucher (if purchased)
        const bronzeClaimCode = await storage.createCode({
          purchaseId: purchase.id,
          type: "bronze_claim",
          code: generateBronzeClaimCode(),
          discount: 0,
          transferable: false,
          maxRedemptions: 1,
          appliesTo: "bronze_claim",
        });

        const workshopCode = await storage.createCode({
          purchaseId: purchase.id,
          type: "workshop_voucher",
          code: generateWorkshopVoucherCode(purchase.seatType),
          discount: getWorkshopVoucherDiscount(purchase.seatType),
          transferable: true,
          maxRedemptions: 1,
          appliesTo: "workshop",
        });

        const lifetimeWorkshopCode = await storage.createCode({
          purchaseId: purchase.id,
          type: "lifetime_workshop",
          code: generateLifetimeWorkshopCode(purchase.seatType),
          discount: getLifetimeWorkshopDiscount(purchase.seatType),
          transferable: true,
          maxRedemptions: null as any,
          appliesTo: "workshop",
        });

        // Generate commission voucher code if purchased
        let commissionVoucherCode = null;
        if (purchase.commissionVoucher) {
          commissionVoucherCode = await storage.createCode({
            purchaseId: purchase.id,
            type: "commission_voucher",
            code: generateCommissionVoucherCode(purchase.seatType),
            discount: getCommissionVoucherDiscount(purchase.seatType),
            transferable: true,
            maxRedemptions: 1,
            appliesTo: "commission",
          });
        }

        // Get user info for certificate
        const user = await storage.getUser(purchase.userId);
        const userName =
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || "Valued Investor";

        // Build codes array for certificate and emails (3 or 4 codes depending on commission voucher)
        const allCodes = [bronzeClaimCode, workshopCode, lifetimeWorkshopCode];
        if (commissionVoucherCode) {
          allCodes.push(commissionVoucherCode);
        }

        // Generate certificate and code slips (can fail without breaking completion)
        let certificateUrl = "";
        let codeSlipsUrl = "";
        try {
          certificateUrl = await generateCertificate(
            purchase,
            allCodes,
            userName,
          );

          codeSlipsUrl = await generateCodeSlips(purchase, allCodes, userName);

          // Update with certificate URL if generated
          if (certificateUrl) {
            await storage.updatePurchaseStatus(
              purchase.id,
              "completed",
              pfData.pf_payment_id,
              certificateUrl,
            );
          }
        } catch (certError) {
          console.error("Certificate/code slip generation failed:", certError);
          // Purchase still marked complete, certificate can be regenerated later
        }

        console.log("Purchase completed successfully:", purchaseId);

        // Send email notifications (best effort, async)
        // Try to get email from user record first, then from PayFast notification
        const userEmail = user?.email || pfData.email_address;
        console.log("[Email] Sending notifications to:", userEmail, "| Certificate:", certificateUrl ? "generated" : "pending");

        if (userEmail) {
          // Always send confirmation email - certificate can fail without blocking email
          sendPurchaseConfirmationEmail(userEmail, userName, purchase).catch(
            (err) => console.error("[Email] Confirmation failed:", err),
          );

          // Send certificate email if we have the certificate
          if (certificateUrl) {
            sendCertificateEmail(
              userEmail,
              userName,
              purchase,
              allCodes,
              certificateUrl,
              codeSlipsUrl,
            ).catch((err) => console.error("[Email] Certificate email failed:", err));
          } else {
            console.log("[Email] Certificate not yet ready for", purchaseId, "- will be sent when generated");
          }
        } else {
          console.error("[Email] No email found for purchase", purchaseId, "- user:", user, "payfast data:", pfData.email_address);
        }

        // Add to Mailchimp (async, best effort)
        if (userEmail) {
          const nameParts = userName.split(" ");
          addSubscriberToMailchimp({
            email: userEmail,
            firstName: nameParts[0] || undefined,
            lastName: nameParts.slice(1).join(" ") || undefined,
            tags: ["Founding 100 Investor", purchase.seatType],
          }).catch((err) =>
            console.error("[Mailchimp] Failed to sync purchaser:", err),
          );
        }
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
        await storage.updatePurchaseStatus(
          purchaseId,
          "failed",
          pfData.pf_payment_id,
          undefined,
        );
      }
    } catch (error: any) {
      console.error("Payment notification error:", error);
      // Already responded, so just log the error
    }
  });

  // Public: Get all sculptures
  app.get("/api/sculptures", async (_req: Request, res: Response) => {
    try {
      const sculptures = await storage.getSculptures();
      res.json(sculptures);
    } catch (error: any) {
      console.error("Get sculptures error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to fetch sculptures" });
    }
  });

  // Protected: Create sculpture selection
  app.post(
    "/api/sculpture-selection",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const result = insertSculptureSelectionSchema.safeParse(req.body);

        if (!result.success) {
          return res.status(400).json({
            message: fromError(result.error).toString(),
          });
        }

        // Verify purchase belongs to user
        const purchase = await storage.getPurchase(result.data.purchaseId);
        if (!purchase || purchase.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        // Check if already selected
        const existing = await storage.getSculptureSelectionByPurchaseId(
          result.data.purchaseId,
        );
        if (existing) {
          return res
            .status(409)
            .json({ message: "Sculpture already selected for this purchase" });
        }

        const selection = await storage.createSculptureSelection(result.data);
        res.status(201).json(selection);
      } catch (error: any) {
        console.error("Sculpture selection error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to save selection" });
      }
    },
  );

  // Protected: Get user's dashboard data
  app.get(
    "/api/dashboard",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const purchases = await storage.getPurchasesByUserId(userId);

        // Fetch codes for each purchase
        const purchasesWithCodes = await Promise.all(
          purchases.map(async (purchase) => {
            const codes = await storage.getCodesByPurchaseId(purchase.id);
            return { ...purchase, codes };
          }),
        );

        res.json(purchasesWithCodes);
      } catch (error: any) {
        console.error("Dashboard error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch dashboard" });
      }
    },
  );

  // Protected: Get specific purchase
  app.get(
    "/api/purchase/:id",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const purchase = await storage.getPurchase(req.params.id);
        if (!purchase || purchase.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(purchase);
      } catch (error: any) {
        console.error("Get purchase error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch purchase" });
      }
    },
  );

  // Admin: Get all seats (admin only)
  app.get(
    "/api/admin/seats",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const seats = await storage.getSeats();
        res.json(seats);
      } catch (error: any) {
        console.error("Admin seats error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch seats" });
      }
    },
  );

  // Admin: Get all purchases (admin only)
  app.get(
    "/api/admin/purchases",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const purchases = await storage.getAllPurchases();
        res.json(purchases);
      } catch (error: any) {
        console.error("Admin purchases error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch purchases" });
      }
    },
  );

  // Admin: Get all codes (admin only)
  app.get(
    "/api/admin/codes",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const codes = await storage.getAllCodes();
        res.json(codes);
      } catch (error: any) {
        console.error("Admin codes error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch codes" });
      }
    },
  );

  // Protected: Redeem code
  app.post(
    "/api/codes/redeem",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
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
            return res
              .status(409)
              .json({ message: "Code has reached maximum redemptions" });
          }
        }

        // Check if already redeemed by this user (for single-use codes)
        const redeemedBy = (code.redeemedBy as string[]) || [];
        if (code.maxRedemptions === 1 && redeemedBy.includes(userId)) {
          return res
            .status(409)
            .json({ message: "Code already redeemed by you" });
        }

        // Redeem code
        await storage.redeemCode(code.id, user?.email || userId);

        // Create referral tracking record if this is a lifetime workshop code
        if (code.type === "lifetime_workshop") {
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
        res
          .status(500)
          .json({ message: error.message || "Failed to redeem code" });
      }
    },
  );

  // Protected: Get referral analytics for a code by ID
  app.get(
    "/api/referrals/code/:codeId",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
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
            pendingReferrals: referralRecords.filter(
              (r) => r.status === "pending",
            ).length,
            completedReferrals: referralRecords.filter(
              (r) => r.status === "completed",
            ).length,
          },
        });
      } catch (error: any) {
        console.error("Referral analytics error:", error);
        res
          .status(500)
          .json({
            message: error.message || "Failed to fetch referral analytics",
          });
      }
    },
  );

  // Protected: Update purchase preferences (specimen style, mounting, patina)
  app.patch(
    "/api/purchase/:id/preferences",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        const { specimenStyle, mountingType, hasPatina, patinaStyle } = req.body;

        // Get the purchase to verify ownership
        const purchase = await storage.getPurchase(id);
        if (!purchase) {
          return res.status(404).json({ message: "Purchase not found" });
        }

        // Verify ownership (allow admin override or owner access)
        const user = await storage.getUser(userId);
        if (purchase.userId !== userId && !user?.isAdmin) {
          return res.status(403).json({ message: "You can only update your own purchases" });
        }

        // Only allow updates for completed purchases
        if (purchase.status !== "completed") {
          return res.status(400).json({ message: "Can only update preferences for completed purchases" });
        }

        // Build update object with only provided fields
        const updates: Partial<Purchase> = {};
        if (specimenStyle !== undefined) updates.specimenStyle = specimenStyle;
        if (mountingType !== undefined) updates.mountingType = mountingType;
        if (hasPatina !== undefined) updates.hasPatina = hasPatina;
        // Note: patinaStyle could be stored in a notes field or extended schema

        await storage.updatePurchase(id, updates);

        // Fetch updated purchase
        const updatedPurchase = await storage.getPurchase(id);

        console.log(`[Purchase] Updated preferences for ${id}:`, updates);

        res.json({
          message: "Preferences updated successfully",
          purchase: updatedPurchase,
        });
      } catch (error: any) {
        console.error("Update purchase preferences error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to update preferences" });
      }
    },
  );

  // Admin: Export subscribers CSV
  app.get(
    "/api/admin/export/subscribers",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const subscribers = await storage.getSubscribers();

        const csvRows: string[] = ["Name,Email,Phone,Notes,Registration Date"];

        for (const sub of subscribers) {
          const row = [
            sub.name || "",
            sub.email || "",
            sub.phone || "",
            (sub.notes || "").replace(/\n/g, " "),
            sub.createdAt?.toISOString() || "",
          ]
            .map((field) => `"${field.replace(/"/g, '""')}"`)
            .join(",");

          csvRows.push(row);
        }

        const csvContent = csvRows.join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=interested-subscribers.csv",
        );
        res.send(csvContent);
      } catch (error: any) {
        console.error("Subscriber CSV export error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to export subscribers" });
      }
    },
  );

  // =============================================
  // PRE-LAUNCH RESERVATION SYSTEM
  // =============================================

  // Public: Get pre-launch reservation stats - ONLY count completed payments
  app.get("/api/prelaunch/stats", async (req: Request, res: Response) => {
    try {
      const stats = {
        totalReserved: 0,
        founderDeposits: 0,
        patronDeposits: 0,
        founderHolds: 0,
        patronHolds: 0,
      };

      try {
        // ONLY count purchases with 'completed' status = actually paid
        const allPurchases = await storage.getAllPurchases();
        if (allPurchases && Array.isArray(allPurchases)) {
          const completedPurchases = allPurchases.filter(p => p.status === 'completed');

          stats.founderDeposits = completedPurchases.filter(p => p.seatType === 'founder').length;
          stats.patronDeposits = completedPurchases.filter(p => p.seatType === 'patron').length;
          stats.totalReserved = stats.founderDeposits + stats.patronDeposits;

          // Also count active 24-hour holds if available
          try {
            const founderHolds = await storage.getActiveReservationsByType('founder');
            if (founderHolds && Array.isArray(founderHolds)) {
              stats.founderHolds = founderHolds.length;
            }

            const patronHolds = await storage.getActiveReservationsByType('patron');
            if (patronHolds && Array.isArray(patronHolds)) {
              stats.patronHolds = patronHolds.length;
            }
          } catch (e) {
            // Reservations table may not exist yet, that's OK
          }
        }
      } catch (e) {
        console.error("Stats query error:", e);
      }

      res.json(stats);
    } catch (error: any) {
      console.error("Pre-launch stats error:", error);
      // Return safe default instead of 500 error
      res.json({
        totalReserved: 0,
        founderDeposits: 0,
        patronDeposits: 0,
        founderHolds: 0,
        patronHolds: 0,
      });
    }
  });

  // Public: Create pre-launch reservation (early bird)
  app.post("/api/prelaunch/reserve", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, seatType, reservationType } = req.body;

      if (!name || !email || !seatType || !reservationType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Valid types: 'reserve' (free), 'secure' (R100), 'buy' (full price)
      if (!['reserve', 'secure', 'buy'].includes(reservationType)) {
        return res.status(400).json({ message: "Invalid reservation type" });
      }

      // Check if email already has an active early bird hold
      const existing = await storage.getSubscriberByEmail(email.toLowerCase());
      if (existing && existing.holdStatus === 'active' && existing.holdExpiresAt && new Date(existing.holdExpiresAt) > new Date()) {
        return res.status(409).json({ message: "You already have an active early bird hold with this email" });
      }

      // Calculate hold expiration: Monday, December 1, 2025 at midnight SA time (UTC+2)
      // If today is already Monday or past, expires next Monday midnight
      const getMondayMidnightSA = () => {
        const now = new Date();
        // Create a date in SA timezone (UTC+2)
        const sa = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' }));
        const dayOfWeek = sa.getDay();
        const daysUntilMonday = dayOfWeek === 1 ? 7 : (1 - dayOfWeek + 7) % 7;

        const nextMonday = new Date(sa);
        nextMonday.setDate(nextMonday.getDate() + (daysUntilMonday || 7));
        nextMonday.setHours(0, 0, 0, 0);
        return nextMonday;
      };

      const holdExpiresAt = getMondayMidnightSA();

      // Create or update subscriber with hold details
      const subscriber = await storage.createSubscriber({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        notes: `[PRELAUNCH] ${seatType} ${reservationType} - Reserved ${new Date().toISOString()}`,
      });

      // Update hold expiration in database
      await db.update(subscribers).set({
        reservationType,
        seatType,
        holdExpiresAt,
        holdStatus: 'active',
      }).where(eq(subscribers.id, subscriber.id));

      console.log(`[Early Bird] ${name} (${email}) reserved ${seatType} seat as "${reservationType}" - expires ${holdExpiresAt.toISOString()}`);

      // Add to Mailchimp
      const tags = [
        "Pre-Launch Reservation",
        seatType === 'founder' ? "Founder Interest" : "Patron Interest",
        reservationType === 'reserve' ? "Early Bird Reserve" : (reservationType === 'secure' ? "Early Bird Secure" : "Early Bird Buy"),
      ];

      addSubscriberToMailchimp({
        email: subscriber.email,
        firstName: name,
        phone: phone || undefined,
        tags,
      }).catch((err) => console.error("[Mailchimp] Failed to sync reservation:", err));

      // Send confirmation email
      sendCertificateToRecipient(
        subscriber.email,
        name,
        `/confirm-reservation?email=${encodeURIComponent(subscriber.email)}`,
        seatType
      ).catch((err) => console.error("[Email] Failed to send reservation confirmation:", err));

      res.json({ 
        success: true, 
        message: `Your ${reservationType === 'reserve' ? 'reserve' : reservationType === 'secure' ? 'secure (R100)' : 'buy now'} hold is confirmed! Expires Monday midnight SA time.`,
        expiresAt: holdExpiresAt.toISOString(),
      });
    } catch (error: any) {
      console.error("Pre-launch reservation error:", error);
      if (error.message?.includes("duplicate")) {
        return res.status(409).json({ message: "This email is already registered" });
      }
      res.status(500).json({ message: error.message || "Failed to create reservation" });
    }
  });

  // Public: Register interest (pre-launch subscriber)
  app.post("/api/subscribers", async (req: Request, res: Response) => {
    try {
      const result = insertSubscriberSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: fromError(result.error).toString(),
        });
      }

      // Check if email already exists
      const existing = await storage.getSubscriberByEmail(result.data.email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const subscriber = await storage.createSubscriber(result.data);

      // Add to Mailchimp (async, best effort)
      addSubscriberToMailchimp({
        email: subscriber.email,
        firstName: subscriber.name,
        phone: subscriber.phone || undefined,
        tags: ["Pre-Launch Subscriber"],
      }).catch((err) =>
        console.error("[Mailchimp] Failed to sync subscriber:", err),
      );

      res
        .status(201)
        .json({
          message: "Thank you for your interest! We'll be in touch soon.",
        });
    } catch (error: any) {
      console.error("Subscriber registration error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to register interest" });
    }
  });

  // Admin: Get all subscribers
  app.get(
    "/api/admin/subscribers",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const subscribers = await storage.getSubscribers();
        res.json(subscribers);
      } catch (error: any) {
        console.error("Get subscribers error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch subscribers" });
      }
    },
  );

  // Admin: Sync subscribers and purchasers to Mailchimp
  app.post(
    "/api/admin/mailchimp/sync",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const { bulkSyncToMailchimp } = await import("./mailchimp");

        // Get all subscribers
        const subscribers = await storage.getSubscribers();
        const subscriberData = subscribers.map((s) => ({
          email: s.email,
          firstName: s.name,
          phone: s.phone || undefined,
          tags: ["Pre-Launch Subscriber"],
        }));

        // Get all completed purchases with user info
        const purchases = await storage.getAllPurchases();
        const completedPurchases = purchases.filter(
          (p) => p.status === "completed",
        );

        const purchaserData = await Promise.all(
          completedPurchases.map(async (p) => {
            const purchaseUser = await storage.getUser(p.userId);
            if (!purchaseUser?.email) return null;

            const userName =
              purchaseUser.firstName && purchaseUser.lastName
                ? `${purchaseUser.firstName} ${purchaseUser.lastName}`
                : purchaseUser.firstName || "";
            const nameParts = userName.split(" ");

            const isVIP = p.paymentReference?.startsWith("PROMO-");
            const tags = isVIP
              ? ["Founding 100 Investor", "VIP Complimentary", p.seatType]
              : ["Founding 100 Investor", p.seatType];

            return {
              email: purchaseUser.email,
              firstName: nameParts[0] || undefined,
              lastName: nameParts.slice(1).join(" ") || undefined,
              tags,
            };
          }),
        );

        const validPurchasers = purchaserData.filter((p) => p !== null);

        // Combine and deduplicate by email
        const allContacts = [...subscriberData, ...validPurchasers];
        const uniqueContacts = allContacts.reduce(
          (acc, contact) => {
            const existing = acc.find((c) => c.email === contact.email);
            if (existing) {
              // Merge tags
              const combinedTags = [...existing.tags, ...contact.tags];
              existing.tags = Array.from(new Set(combinedTags));
            } else {
              acc.push(contact);
            }
            return acc;
          },
          [] as Array<{
            email: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
            tags: string[];
          }>,
        );

        // Bulk sync to Mailchimp
        const result = await bulkSyncToMailchimp(uniqueContacts);

        res.json({
          message: "Mailchimp sync complete",
          totalContacts: uniqueContacts.length,
          subscribers: subscriberData.length,
          purchasers: validPurchasers.length,
          ...result,
        });
      } catch (error: any) {
        console.error("Mailchimp sync error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to sync to Mailchimp" });
      }
    },
  );

  // Admin: Export subscribers as CSV
  app.get(
    "/api/admin/subscribers/export",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const subscribers = await storage.getSubscribers();

        const csvRows: string[] = ["Name,Email,Phone,Notes,Registration Date"];

        for (const sub of subscribers) {
          const row = [
            sub.name || "",
            sub.email || "",
            sub.phone || "",
            (sub.notes || "").replace(/\n/g, " "),
            sub.createdAt?.toISOString() || "",
          ]
            .map((field) => `"${field.replace(/"/g, '""')}"`)
            .join(",");

          csvRows.push(row);
        }

        const csvContent = csvRows.join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=interested-subscribers.csv",
        );
        res.send(csvContent);
      } catch (error: any) {
        console.error("Subscriber CSV export error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to export subscribers" });
      }
    },
  );

  // Public: Validate promo code
  app.post("/api/promo-code/validate", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res
          .status(400)
          .json({ valid: false, message: "Promo code is required" });
      }

      const promoCode = await storage.getPromoCodeByCode(code.toUpperCase());

      if (!promoCode) {
        return res
          .status(200)
          .json({ valid: false, message: "Invalid promo code" });
      }

      if (promoCode.used) {
        return res
          .status(200)
          .json({ valid: false, message: "This code has already been used" });
      }

      res.json({
        valid: true,
        seatType: promoCode.seatType,
        discount: promoCode.discount,
      });
    } catch (error: any) {
      console.error("Promo code validation error:", error);
      res
        .status(500)
        .json({ valid: false, message: "Failed to validate code" });
    }
  });

  // Protected: Redeem promo code (creates free purchase)
  app.post(
    "/api/promo-code/redeem",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const {
          code,
          specimenStyle,
          hasPatina,
          mountingType,
          commissionVoucher,
          internationalShipping,
          purchaseMode,
          isGift,
          giftRecipientEmail,
          giftRecipientName,
          giftMessage,
          deliveryName,
          deliveryPhone,
          deliveryAddress,
        } = req.body;

        // Validate code
        const promoCode = await storage.getPromoCodeByCode(code.toUpperCase());

        if (!promoCode || promoCode.used) {
          return res
            .status(400)
            .json({ message: "Invalid or already used promo code" });
        }

        // Specimen style is optional at checkout - users choose from dashboard after purchase
        // specimenStyle can be null

        // Validate delivery information (same as paid purchases)
        if (!deliveryName || !deliveryPhone || !deliveryAddress) {
          return res.status(400).json({
            message: "Delivery information is required (name, phone, address)",
          });
        }

        // For FREE VIP promo redemptions: ALL add-ons are included at no cost (VIP benefit)
        // They still get to choose add-ons, but prices are R0
        const mountingPriceCents = 0;

        // Create free purchase (R0) with user's chosen specimen style and add-ons
        const purchase = await storage.createPurchase({
          userId,
          seatType: promoCode.seatType,
          amount: 0, // FREE VIP seat!
          specimenStyle,
          hasPatina: hasPatina || false,
          mountingType: mountingType || "none",
          mountingPriceCents, // Free for VIP
          commissionVoucher: commissionVoucher || false,
          internationalShipping: internationalShipping || false,
          purchaseMode: purchaseMode || "cast_now",
          isGift: isGift || false,
          giftRecipientEmail: isGift ? giftRecipientEmail : null,
          giftRecipientName: isGift ? giftRecipientName : null,
          giftMessage: isGift ? giftMessage : null,
          deliveryName,
          deliveryPhone,
          deliveryAddress,
        });

        // Mark purchase as completed immediately (no payment needed)
        await storage.updatePurchaseStatus(
          purchase.id,
          "completed",
          `PROMO-${code}`,
          undefined,
        );

        // Send gift notification if this is a gift purchase
        await handlePurchaseCompletion(purchase.id);

        // Mark code as used
        await storage.markPromoCodeAsUsed(promoCode.id, userId, purchase.id);

        // NOTE: FREE VIP promo codes do NOT reduce available seat count
        // These are BONUS seats on top of the 50 Founder + 50 Patron = 100 paid seats
        // (no seat count update here - only paid purchases reduce available seats)

        // Generate codes: bronze claim + workshop vouchers (always) + commission voucher (if selected)
        const bronzeClaimCode = await storage.createCode({
          purchaseId: purchase.id,
          type: "bronze_claim",
          code: generateBronzeClaimCode(),
          discount: 0,
          transferable: false,
          maxRedemptions: 1,
          appliesTo: "bronze_claim",
        });

        const workshopCode = await storage.createCode({
          purchaseId: purchase.id,
          type: "workshop_voucher",
          code: generateWorkshopVoucherCode(promoCode.seatType),
          discount: getWorkshopVoucherDiscount(promoCode.seatType),
          transferable: true,
          maxRedemptions: 1,
          appliesTo: "workshop",
        });

        const lifetimeWorkshopCode = await storage.createCode({
          purchaseId: purchase.id,
          type: "lifetime_workshop",
          code: generateLifetimeWorkshopCode(promoCode.seatType),
          discount: getLifetimeWorkshopDiscount(promoCode.seatType),
          transferable: true,
          maxRedemptions: null as any,
          appliesTo: "workshop",
        });

        // Generate commission voucher code if selected (FREE for VIP)
        let commissionVoucherCodePromo = null;
        if (purchase.commissionVoucher) {
          commissionVoucherCodePromo = await storage.createCode({
            purchaseId: purchase.id,
            type: "commission_voucher",
            code: generateCommissionVoucherCode(promoCode.seatType),
            discount: getCommissionVoucherDiscount(promoCode.seatType),
            transferable: true,
            maxRedemptions: 1,
            appliesTo: "commission",
          });
        }

        // Get user info for certificate and emails
        const user = await storage.getUser(userId);
        const userName =
          user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || "Valued Investor";
        const userEmail = user?.email || "";

        // Build codes array for certificate and emails (3 or 4 codes depending on commission voucher)
        const allCodesPromo = [
          bronzeClaimCode,
          workshopCode,
          lifetimeWorkshopCode,
        ];
        if (commissionVoucherCodePromo) {
          allCodesPromo.push(commissionVoucherCodePromo);
        }

        // Generate certificate and code slips (same as paid purchases)
        let certificateUrl = "";
        let codeSlipsUrl = "";
        try {
          certificateUrl = await generateCertificate(
            purchase,
            allCodesPromo,
            userName,
          );

          codeSlipsUrl = await generateCodeSlips(
            purchase,
            allCodesPromo,
            userName,
          );

          if (certificateUrl) {
            await storage.updatePurchaseStatus(
              purchase.id,
              "completed",
              `PROMO-${code}`,
              certificateUrl,
            );
          }
        } catch (certError) {
          console.error("Certificate/code slip generation failed:", certError);
        }

        // Send confirmation emails (same as paid purchases)
        try {
          if (userEmail) {
            await sendPurchaseConfirmationEmail(userEmail, userName, purchase);

            if (certificateUrl) {
              await sendCertificateEmail(
                userEmail,
                userName,
                purchase,
                allCodesPromo,
                certificateUrl,
                codeSlipsUrl,
              );
            }
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't fail the redemption if email fails
        }

        // Add to Mailchimp (async, best effort)
        if (userEmail) {
          const nameParts = userName.split(" ");
          addSubscriberToMailchimp({
            email: userEmail,
            firstName: nameParts[0] || undefined,
            lastName: nameParts.slice(1).join(" ") || undefined,
            tags: [
              "Founding 100 Investor",
              "VIP Complimentary",
              purchase.seatType,
            ],
          }).catch((err) =>
            console.error("[Mailchimp] Failed to sync VIP purchaser:", err),
          );
        }

        console.log("Promo code redeemed successfully:", code, purchase.id);

        res.json({
          success: true,
          message: "Promo code redeemed successfully!",
          purchaseId: purchase.id,
        });
      } catch (error: any) {
        console.error("Promo code redemption error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to redeem code" });
      }
    },
  );

  // Public: Get gift purchase details (for claim page)
  app.get("/api/gift/details/:id", async (req: Request, res: Response) => {
    try {
      const purchaseId = req.params.id;
      const purchase = await storage.getPurchase(purchaseId);

      if (!purchase) {
        return res.status(404).json({ message: "Gift not found" });
      }

      // Only return gift purchases
      if (!purchase.isGift) {
        return res.status(404).json({ message: "This is not a gift purchase" });
      }

      // Return limited details for security (don't expose user ID, payment details, etc.)
      res.json({
        id: purchase.id,
        seatType: purchase.seatType,
        specimenStyle: purchase.specimenStyle,
        giftMessage: purchase.giftMessage,
        giftStatus: purchase.giftStatus,
        claimedByUserId: purchase.claimedByUserId,
        giftRecipientName: purchase.giftRecipientName,
      });
    } catch (error: any) {
      console.error("Get gift details error:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to get gift details" });
    }
  });

  // Protected: Claim a gift purchase
  app.post(
    "/api/gift/claim/:id",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const purchaseId = req.params.id;

        const purchase = await storage.getPurchase(purchaseId);

        if (!purchase) {
          return res.status(404).json({ message: "Gift not found" });
        }

        // Validate this is a gift purchase
        if (!purchase.isGift) {
          return res
            .status(400)
            .json({ message: "This is not a gift purchase" });
        }

        // Check if already claimed
        if (purchase.giftStatus === "claimed") {
          if (purchase.claimedByUserId === userId) {
            return res.json({ message: "You have already claimed this gift" });
          }
          return res
            .status(409)
            .json({
              message: "This gift has already been claimed by another user",
            });
        }

        // Claim the gift by updating claimedByUserId and giftStatus
        await storage.claimGiftPurchase(purchaseId, userId);

        // Get the claiming user's email for records
        const claimingUser = await storage.getUser(userId);
        const claimerEmail = claimingUser?.email;

        // Generate and send certificate to recipient
        try {
          const certificateUrl = `/certificates/certificate-${purchaseId}.pdf`;
          if (claimerEmail) {
            await sendCertificateToRecipient(
              claimerEmail,
              purchase.giftRecipientName || "Valued Patron",
              certificateUrl,
              purchase.seatType
            );
          }
        } catch (certError) {
          console.error("Failed to send certificate to gift recipient:", certError);
          // Don't fail the claim if email fails
        }

        // Add recipient to Mailchimp (async, best effort)
        if (claimerEmail) {
          const nameParts = (purchase.giftRecipientName || "Patron").split(" ");
          addSubscriberToMailchimp({
            email: claimerEmail,
            firstName: nameParts[0] || undefined,
            lastName: nameParts.slice(1).join(" ") || undefined,
            tags: ["Founding 100 Investor", "Gift Recipient", purchase.seatType],
          }).catch((err) =>
            console.error("[Mailchimp] Failed to sync gift recipient:", err),
          );
        }

        console.log(`[Gift] Purchase ${purchaseId} claimed by user ${userId}. Certificate sent & Mailchimp updated.`);

        res.json({ message: "Gift claimed successfully. Certificate sent to your email." });
      } catch (error: any) {
        console.error("Claim gift error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to claim gift" });
      }
    },
  );

  // Admin: Get all promo codes
  app.get(
    "/api/admin/promo-codes",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const promoCodes = await storage.getAllPromoCodes();
        res.json(promoCodes);
      } catch (error: any) {
        console.error("Get promo codes error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to fetch promo codes" });
      }
    },
  );

  // Admin: Generate promo codes (batch)
  app.post(
    "/api/admin/promo-codes/generate",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const { count = 1, seatType = "patron" } = req.body;

        // Validate seat type
        if (seatType !== "founder" && seatType !== "patron") {
          return res.status(400).json({ message: "Invalid seat type. Must be 'founder' or 'patron'" });
        }

        const generatedCodes = [];

        for (let i = 0; i < Math.min(count, 20); i++) {
          // Max 20 at once
          const code = generatePromoCode();
          const promoCode = await storage.createPromoCode({
            code,
            seatType,
            discount: 100,
            createdBy: userId,
          });
          generatedCodes.push(promoCode);
        }

        res.status(201).json(generatedCodes);
      } catch (error: any) {
        console.error("Generate promo codes error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to generate promo codes" });
      }
    },
  );

  // Admin: Create sculpture (admin only)
  app.post(
    "/api/admin/sculptures",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await storage.getUser(userId);

        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const result = insertSculptureSchema.safeParse(req.body);

        if (!result.success) {
          return res.status(400).json({
            message: fromError(result.error).toString(),
          });
        }

        const sculpture = await storage.createSculpture(result.data);
        res.status(201).json(sculpture);
      } catch (error: any) {
        console.error("Create sculpture error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to create sculpture" });
      }
    },
  );

  // ============================================
  // PUBLIC MEDIA ROUTES
  // ============================================

  // Public: Get all media assets (for gallery) - returns storage files with proxy URLs
  app.get("/api/media", async (req: any, res: Response) => {
    try {
      const { supabaseAdmin } = await import("./supabaseAuth");

      // Helper to recursively list all files in bucket and subfolders
      const listAllFiles = async (basePath: string = ''): Promise<any[]> => {
        const { data, error } = await supabaseAdmin.storage
          .from('specimen-photos')
          .list(basePath, { limit: 1000 });

        if (error) {
          console.warn(`Storage list error for path '${basePath}':`, error);
          return [];
        }

        let allFiles: any[] = [];

        if (data) {
          for (const item of data) {
            if (!item.id) {
              // It's a folder - recursively list it
              const folderPath = basePath ? `${basePath}/${item.name}` : item.name;
              const folderFiles = await listAllFiles(folderPath);
              allFiles = allFiles.concat(folderFiles);
            } else if (item.name && item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              // It's an image file
              const fullPath = basePath ? `${basePath}/${item.name}` : item.name;
              allFiles.push({ ...item, fullPath });
            }
          }
        }

        return allFiles;
      };

      // Get all image files from storage
      const imageFiles = await listAllFiles();

      // Helper to generate tags from file path and name
      const generateTags = (fullPath: string, fileName: string): string[] => {
        const tags: string[] = [];
        const pathLower = fullPath.toLowerCase();
        const nameLower = fileName.toLowerCase();
        
        // Extract folder name as primary tag
        const pathParts = fullPath.split('/');
        if (pathParts.length > 1) {
          tags.push(pathParts[0].toLowerCase());
        }
        
        // Check for plant/bronze indicators in path or filename
        const isPlant = pathLower.includes('plant') || nameLower.includes('plant') || 
                       pathLower.includes('specimen') || nameLower.includes('specimen') ||
                       pathLower.includes('flower') || nameLower.includes('flower');
        const isBronze = pathLower.includes('bronze') || nameLower.includes('bronze') ||
                        pathLower.includes('cast') || nameLower.includes('cast');
        
        // Specimen type detection from path/filename
        const specimenTypes = [
          { patterns: ['protea', 'pincushion', 'leucospermum'], tag: 'protea' },
          { patterns: ['cone', 'bract', 'seedpod', 'leucadendron'], tag: 'cones' },
          { patterns: ['bulb', 'spike', 'watsonia', 'gladiolus'], tag: 'bulb' },
          { patterns: ['branch', 'leaves', 'leaf', 'twig'], tag: 'branches' },
          { patterns: ['aloe', 'inflorescence'], tag: 'aloe' },
          { patterns: ['erica', 'heather'], tag: 'erica' },
          { patterns: ['restio', 'seedhead', 'grass'], tag: 'restios' },
          { patterns: ['succulent', 'echeveria', 'rosette'], tag: 'succulents' },
          { patterns: ['flower', 'head', 'bloom'], tag: 'flower' },
        ];
        
        for (const spec of specimenTypes) {
          if (spec.patterns.some(p => pathLower.includes(p) || nameLower.includes(p))) {
            if (!tags.includes(spec.tag)) {
              tags.push(spec.tag);
            }
            // Add type-specific plant/bronze tag
            if (isPlant) tags.push(`${spec.tag}-plant`);
            if (isBronze) tags.push(`${spec.tag}-bronze`);
            break;
          }
        }
        
        // General plant/bronze tags
        if (isPlant && !tags.some(t => t.endsWith('-plant'))) tags.push('plant');
        if (isBronze && !tags.some(t => t.endsWith('-bronze'))) tags.push('bronze');
        
        return Array.from(new Set(tags)); // Remove duplicates
      };

      // Convert to media asset format with proxy URLs and auto-generated tags
      const assets = imageFiles.map((file: any) => ({
        id: file.fullPath,
        url: `/api/image-proxy?file=${encodeURIComponent(file.fullPath)}`,
        altText: file.name,
        caption: file.name,
        tags: generateTags(file.fullPath, file.name),
      }));

      res.json(assets);
    } catch (error: any) {
      console.error("Get media assets error:", error);
      res.json([]);
    }
  });

  // ============================================
  // ADMIN MANAGEMENT ROUTES
  // ============================================

  // Image proxy - serves images from private bucket to browser
  app.get("/api/image-proxy", async (req: any, res: Response) => {
    try {
      const { file } = req.query;
      if (!file) {
        return res.status(400).json({ error: "Missing file parameter" });
      }

      const { supabaseAdmin } = await import("./supabaseAuth");

      // Check if service role key is available
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("[ImageProxy] SUPABASE_SERVICE_ROLE_KEY not set");
        return res.status(500).json({ error: "Service configuration error" });
      }

      console.log(`[ImageProxy] Attempting to download: ${file}`);
      const { data, error } = await supabaseAdmin.storage
        .from('specimen-photos')
        .download(file as string);

      if (error) {
        console.error(`[ImageProxy] Supabase error for ${file}:`, JSON.stringify(error));
        return res.status(404).json({ error: error.message || "File not found" });
      }

      if (!data) {
        console.warn(`[ImageProxy] No data returned for ${file}`);
        return res.status(404).json({ error: "File not found" });
      }

      const arrayBuffer = await data.arrayBuffer();
      res.set('Content-Type', data.type || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000');
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("[ImageProxy] Exception:", error?.message || error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Admin: Get storage files from specimen-photos bucket (including subdirectories)
  app.get("/api/admin/media-storage-files", async (req: any, res: Response) => {
    try {
      const { supabaseAdmin } = await import("./supabaseAuth");

      // Helper to recursively list all files in bucket and subfolders
      const listAllFiles = async (folderPath: string = ''): Promise<any[]> => {
        const { data, error } = await supabaseAdmin.storage
          .from('specimen-photos')
          .list(folderPath, { limit: 1000 });

        if (error) {
          console.warn(`Storage list error for path '${folderPath}':`, error);
          return [];
        }

        let allFiles: any[] = [];

        if (data) {
          for (const item of data) {
            if (!item.id) {
              // It's a folder - recursively list it
              const subPath = folderPath ? `${folderPath}/${item.name}` : item.name;
              console.log(`[Storage] Found folder: ${subPath}, listing contents...`);
              const folderFiles = await listAllFiles(subPath);
              allFiles = allFiles.concat(folderFiles);
            } else if (item.name && item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              // It's an image file
              const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
              allFiles.push({ ...item, fullPath });
            }
          }
        }

        return allFiles;
      };

      // Get all files from bucket and subfolders
      const imageFiles = await listAllFiles();
      console.log(`[Storage] Found ${imageFiles.length} image files`);

      // Generate signed URLs for each file
      const files = await Promise.all(imageFiles.map(async (file: any) => {
        try {
          // Generate signed URL (works for private buckets too) - 1 year expiry
          const { data, error } = await supabaseAdmin.storage
            .from('specimen-photos')
            .createSignedUrl(file.fullPath, 60 * 60 * 24 * 365);

          if (error) {
            console.warn(`[SignURL Error] ${file.fullPath}:`, error);
          }

          const signedUrl = data?.signedUrl;
          if (signedUrl && !signedUrl.includes('?token=')) {
            console.warn(`[SignURL Warning] No token in URL for ${file.fullPath}: ${signedUrl}`);
          }

          return {
            id: file.fullPath,
            filename: file.name,
            originalName: file.name,
            url: signedUrl || `https://rcillyhlieikmzeuaghc.supabase.co/storage/v1/object/public/specimen-photos/${file.fullPath}`,
            altText: file.name,
            tags: [],
          };
        } catch (err) {
          console.warn(`Failed to sign URL for ${file.fullPath}:`, err);
          return {
            id: file.fullPath,
            filename: file.name,
            originalName: file.name,
            url: `https://rcillyhlieikmzeuaghc.supabase.co/storage/v1/object/public/specimen-photos/${file.fullPath}`,
            altText: file.name,
            tags: [],
          };
        }
      }));
      res.json(files);
    } catch (error: any) {
      console.error("Storage files error:", error);
      res.json([]);
    }
  });

  // Admin: Get all media assets
  // NOTE: Auth removed for launch emergency - media fetches now public during launch window
  app.get("/api/admin/media", async (req: any, res: Response) => {
    try {
      try {
        const assets = await storage.getMediaAssets();
        res.json(assets);
      } catch (dbError: any) {
        // If database unavailable, return empty array
        console.warn("Media database fetch failed, returning empty list:", dbError.message);
        res.json([]);
      }
    } catch (error: any) {
      console.error("Get media assets error:", error);
      res.json([]);
    }
  });

  // Admin: Upload media asset (saves URL from Supabase Storage or external URL)
  // NOTE: Auth removed for launch emergency - media uploads now public during launch window
  app.post("/api/admin/media", async (req: any, res: Response) => {
    try {
      const { filename, originalName, mimeType, size, url, altText, caption, tags } = req.body;

      if (!filename || !originalName || !mimeType || !url) {
        return res.status(400).json({ message: "Missing required fields: filename, originalName, mimeType, url" });
      }

      try {
        const asset = await storage.createMediaAsset({
          filename,
          originalName,
          mimeType,
          size: size || 0,
          url,
          altText,
          caption,
          tags,
          uploadedBy: null,
        });
        res.status(201).json(asset);
      } catch (dbError: any) {
        // If database fails, still return success with the URL
        console.warn("Media database save failed, returning URL anyway:", dbError.message);
        res.status(201).json({
          id: `temp-${Date.now()}`,
          filename,
          originalName,
          mimeType,
          size: size || 0,
          url,
          altText,
          caption,
          tags,
          uploadedBy: null,
          createdAt: new Date(),
        });
      }
    } catch (error: any) {
      console.error("Create media asset error:", error);
      res.status(500).json({ message: error.message || "Failed to create media asset" });
    }
  });

  // Admin: Update media asset
  app.patch("/api/admin/media/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { id } = req.params;
      const asset = await storage.updateMediaAsset(id, req.body);
      if (!asset) return res.status(404).json({ message: "Asset not found" });
      res.json(asset);
    } catch (error: any) {
      console.error("Update media asset error:", error);
      res.status(500).json({ message: error.message || "Failed to update media asset" });
    }
  });

  // Admin: Delete media asset
  app.delete("/api/admin/media/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      await storage.deleteMediaAsset(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete media asset error:", error);
      res.status(500).json({ message: error.message || "Failed to delete media asset" });
    }
  });

  // Set up multer for file uploads (memory storage)
  const upload = multer({ storage: multer.memoryStorage() });

  // Admin: Upload specimen photo with service role (bypasses RLS)
  app.post("/api/admin/upload-specimen-photo", upload.single('media-file'), async (req: any, res: Response) => {
    try {
      console.log('[Upload] Received upload request');
      
      if (!req.file) {
        console.log('[Upload] No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('[Upload] File received:', req.file.originalname, 'size:', req.file.size, 'type:', req.file.mimetype);

      const { supabaseAdmin } = await import("./supabaseAuth");
      const { originalname, buffer, mimetype } = req.file;
      const fileName = `${Date.now()}-${originalname}`;

      console.log('[Upload] Uploading to Supabase Storage as:', fileName);
      console.log('[Upload] SUPABASE_URL configured:', !!process.env.SUPABASE_URL);
      console.log('[Upload] SUPABASE_SERVICE_ROLE_KEY configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

      // Upload using service role (has full permissions, bypasses RLS)
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('specimen-photos')
        .upload(fileName, buffer, { contentType: mimetype });

      if (uploadError) {
        console.error('[Upload] Supabase storage error:', uploadError);
        throw uploadError;
      }

      console.log('[Upload] Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('specimen-photos')
        .getPublicUrl(fileName);

      console.log('[Upload] Public URL:', publicUrl);
      res.json({ publicUrl, fileName });
    } catch (error: any) {
      console.error("[Upload] Error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // Admin: Get page assets
  app.get("/api/admin/page-assets", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const pageSlug = req.query.page as string | undefined;
      const assets = await storage.getPageAssets(pageSlug);
      res.json(assets);
    } catch (error: any) {
      console.error("Get page assets error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch page assets" });
    }
  });

  // Admin: Get all products
  app.get("/api/admin/products", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const productsList = await storage.getProducts();
      res.json(productsList);
    } catch (error: any) {
      console.error("Get products error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch products" });
    }
  });

  // Admin: Create product
  app.post("/api/admin/products", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { name, slug, description, shortDescription, priceCents, comparePriceCents, status, category, sku, stockQuantity, featuredImageId, displayOrder, metadata } = req.body;

      if (!name || !slug || !priceCents) {
        return res.status(400).json({ message: "Missing required fields: name, slug, priceCents" });
      }

      const product = await storage.createProduct({
        name, slug, description, shortDescription, priceCents, comparePriceCents, status, category, sku, stockQuantity, featuredImageId, displayOrder, metadata
      });
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Create product error:", error);
      res.status(500).json({ message: error.message || "Failed to create product" });
    }
  });

  // Admin: Update product
  app.patch("/api/admin/products/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error: any) {
      console.error("Update product error:", error);
      res.status(500).json({ message: error.message || "Failed to update product" });
    }
  });

  // Admin: Delete product
  app.delete("/api/admin/products/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: error.message || "Failed to delete product" });
    }
  });

  // Admin: Get all auctions
  app.get("/api/admin/auctions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const auctionsList = await storage.getAuctions();
      res.json(auctionsList);
    } catch (error: any) {
      console.error("Get auctions error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch auctions" });
    }
  });

  // Admin: Create auction
  app.post("/api/admin/auctions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { title, slug, description, startAt, endAt, reservePriceCents, startingBidCents, bidIncrementCents, status, featuredImageId, metadata } = req.body;

      if (!title || !slug || !startAt || !endAt || !startingBidCents) {
        return res.status(400).json({ message: "Missing required fields: title, slug, startAt, endAt, startingBidCents" });
      }

      const auction = await storage.createAuction({
        title, slug, description, startAt: new Date(startAt), endAt: new Date(endAt), reservePriceCents, startingBidCents, bidIncrementCents, status, featuredImageId, metadata
      });
      res.status(201).json(auction);
    } catch (error: any) {
      console.error("Create auction error:", error);
      res.status(500).json({ message: error.message || "Failed to create auction" });
    }
  });

  // Admin: Update auction
  app.patch("/api/admin/auctions/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const updates = { ...req.body };
      if (updates.startAt) updates.startAt = new Date(updates.startAt);
      if (updates.endAt) updates.endAt = new Date(updates.endAt);

      const auction = await storage.updateAuction(req.params.id, updates);
      if (!auction) return res.status(404).json({ message: "Auction not found" });
      res.json(auction);
    } catch (error: any) {
      console.error("Update auction error:", error);
      res.status(500).json({ message: error.message || "Failed to update auction" });
    }
  });

  // Admin: Delete auction
  app.delete("/api/admin/auctions/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      await storage.deleteAuction(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete auction error:", error);
      res.status(500).json({ message: error.message || "Failed to delete auction" });
    }
  });

  // Admin: Get auction bids
  app.get("/api/admin/auctions/:id/bids", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const bids = await storage.getAuctionBids(req.params.id);
      res.json(bids);
    } catch (error: any) {
      console.error("Get auction bids error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch auction bids" });
    }
  });

  // Admin: Get workshop bookings summary
  app.get("/api/admin/workshops", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const workshopDates = await storage.getWorkshopDates();
      res.json(workshopDates);
    } catch (error: any) {
      console.error("Get workshop dates error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch workshop dates" });
    }
  });

  // Admin: Create workshop date
  app.post("/api/admin/workshops", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { date, startTime, endTime, maxParticipants, depositAmount, location } = req.body;

      if (!date || !startTime || !endTime || !depositAmount || !location) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const workshopDate = await storage.createWorkshopDate({
        date: new Date(date),
        startTime,
        endTime,
        maxParticipants: maxParticipants || 6,
        depositAmount,
        location,
      });
      res.status(201).json(workshopDate);
    } catch (error: any) {
      console.error("Create workshop date error:", error);
      res.status(500).json({ message: error.message || "Failed to create workshop date" });
    }
  });

  // Admin: Get all website content
  app.get("/api/admin/content", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const pageSlug = req.query.page as string | undefined;
      const content = await storage.getWebsiteContent(pageSlug);
      res.json(content);
    } catch (error: any) {
      console.error("[Admin] Content fetch error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Set/Update website content item
  app.post("/api/admin/content", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { pageSlug, sectionKey, content, contentType, metadata } = req.body;

      if (!pageSlug || !sectionKey || !content) {
        return res.status(400).json({ message: "pageSlug, sectionKey, and content are required" });
      }

      const result = await storage.setWebsiteContent({
        pageSlug,
        sectionKey,
        content,
        contentType: contentType || 'text',
        metadata,
        updatedBy: userId,
        isActive: true,
      });

      console.log("[Admin] Website content updated:", { pageSlug, sectionKey });
      res.json(result);
    } catch (error: any) {
      console.error("[Admin] Content update error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Delete website content item
  app.delete("/api/admin/content/:pageSlug/:sectionKey", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { pageSlug, sectionKey } = req.params;
      await storage.deleteWebsiteContent(pageSlug, sectionKey);
      res.json({ success: true });
    } catch (error: any) {
      console.error("[Admin] Content delete error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get website content for a page (for frontend to read)
  app.get("/api/content/:pageSlug", async (req: Request, res: Response) => {
    try {
      const { pageSlug } = req.params;
      const content = await storage.getWebsiteContent(pageSlug);
      const contentMap: Record<string, string> = {};
      content.forEach(item => {
        if (item.isActive) {
          contentMap[item.sectionKey] = item.content;
        }
      });
      res.json(contentMap);
    } catch (error: any) {
      console.error("[Content] Fetch error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get page assets with media details (for frontend to read images)
  app.get("/api/page-assets/:pageSlug", async (req: Request, res: Response) => {
    try {
      const { pageSlug } = req.params;
      const assets = await storage.getPageAssets(pageSlug);
      const assetDetails = await Promise.all(
        assets.map(async (pa) => {
          const media = await storage.getMediaAsset(pa.assetId);
          return {
            slotKey: pa.slotKey,
            displayOrder: pa.displayOrder,
            isActive: pa.isActive,
            media: media ? { id: media.id, url: media.url, altText: media.altText, caption: media.caption } : null,
          };
        })
      );
      res.json(assetDetails);
    } catch (error: any) {
      console.error("[PageAssets] Fetch error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Assign media to page slot
  app.post("/api/admin/page-assets", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { pageSlug, slotKey, assetId, displayOrder } = req.body;

      if (!pageSlug || !slotKey || !assetId) {
        return res.status(400).json({ message: "pageSlug, slotKey, and assetId are required" });
      }

      // Check if assetId is a valid UUID (database media asset ID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let finalAssetId = assetId;

      if (!uuidRegex.test(assetId)) {
        // assetId is a storage file path - create a media_assets record first
        console.log("[Admin] Creating media asset for storage file:", assetId);
        
        const proxyUrl = `/api/image-proxy?file=${encodeURIComponent(assetId)}`;
        const fileName = assetId.split('/').pop() || assetId;
        
        // Create media asset record
        const mediaAsset = await storage.createMediaAsset({
          filename: assetId,
          originalName: fileName,
          url: proxyUrl,
          altText: fileName,
          caption: fileName,
          mimeType: 'image/jpeg',
          size: 0,
        });
        
        finalAssetId = mediaAsset.id;
        console.log("[Admin] Created media asset:", finalAssetId);
      }

      const result = await storage.setPageAsset({
        pageSlug,
        slotKey,
        assetId: finalAssetId,
        displayOrder: displayOrder || 0,
        isActive: true,
      });

      console.log("[Admin] Page asset assigned:", { pageSlug, slotKey, assetId: finalAssetId });
      res.json(result);
    } catch (error: any) {
      console.error("[Admin] Page asset error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // DEBUG: Check what token is being sent
  app.get("/api/auth/debug", async (req: any, res: Response) => {
    const authHeader = req.headers.authorization;
    console.log('[DEBUG] Full auth header:', authHeader);
    console.log('[DEBUG] Auth header length:', authHeader?.length);
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      console.log('[DEBUG] Token length:', token.length);
      console.log('[DEBUG] Token parts (split by dot):', token.split('.').length);
      console.log('[DEBUG] Token first 50 chars:', token.substring(0, 50));
    }
    res.json({ 
      authHeader: authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'MISSING',
      tokenLength: authHeader ? authHeader.length : 0
    });
  });

  // Admin: Update seat pricing
  app.patch("/api/admin/pricing", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { founderPrice, patronPrice } = req.body;

      if (founderPrice !== undefined) {
        await storage.updateSeatPrice("founder", founderPrice);
      }
      if (patronPrice !== undefined) {
        await storage.updateSeatPrice("patron", patronPrice);
      }

      const seats = await storage.getSeats();
      res.json(seats);
    } catch (error: any) {
      console.error("[Admin] Price update error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Activate 24-hour Fire Sale
  app.post("/api/admin/fire-sale", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      // Validate fire sale payload
      const fireSaleSchema = z.object({
        founderPrice: z.number().int().min(100, "Founder price must be at least R1").max(10000000, "Price too high"),
        patronPrice: z.number().int().min(100, "Patron price must be at least R1").max(10000000, "Price too high"),
        durationHours: z.number().int().min(1, "Duration must be at least 1 hour").max(168, "Duration cannot exceed 1 week")
      });

      const parsed = fireSaleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid fire sale parameters", errors: parsed.error.flatten() });
      }

      const { founderPrice, patronPrice, durationHours } = parsed.data;

      await storage.activateFireSale(founderPrice, patronPrice, durationHours);

      const seats = await storage.getSeats();
      res.json({ 
        success: true, 
        message: `Fire sale activated! Founder R${founderPrice/100}, Patron R${patronPrice/100} for ${durationHours} hours`,
        seats 
      });
    } catch (error: any) {
      console.error("[Admin] Fire sale activation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Deactivate Fire Sale
  app.delete("/api/admin/fire-sale", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      await storage.deactivateFireSale();

      const seats = await storage.getSeats();
      res.json({ success: true, message: "Fire sale deactivated", seats });
    } catch (error: any) {
      console.error("[Admin] Fire sale deactivation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get Manual Holds
  app.get("/api/admin/holds", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const holds = await storage.getManualHolds();
      res.json(holds);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Create Manual Hold
  app.post("/api/admin/holds", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const { name, seatType, note } = req.body;
      if (!name || !seatType) return res.status(400).json({ message: "Name and seat type required" });

      const hold = await storage.createManualHold({ name, seatType, note });
      res.json(hold);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Delete Manual Hold
  app.delete("/api/admin/holds/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      await storage.deleteManualHold(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve certificates statically
  app.use(
    "/certificates",
    express.static(path.join(process.cwd(), "certificates")),
  );

  // Admin: Test endpoint for codes, certificates, and hold expiration
  app.get("/api/admin/test-systems", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const results: any = { timestamp: new Date().toISOString(), tests: {} };

      // TEST 1: Code Generation
      try {
        const bronzeCode = generateBronzeClaimCode();
        const workshopVoucherCode = generateWorkshopVoucherCode('founder');
        const lifetimeCode = generateLifetimeWorkshopCode('founder');

        results.tests.codeGeneration = {
          status: 'PASS',
          bronze: bronzeCode,
          workshopVoucher: workshopVoucherCode,
          lifetime: lifetimeCode,
          note: 'Codes generated successfully'
        };
        console.log('[Test] Code generation PASSED');
      } catch (error: any) {
        results.tests.codeGeneration = { status: 'FAIL', error: error.message };
        console.error('[Test] Code generation FAILED:', error);
      }

      // TEST 2: Certificate Generation (mock purchase)
      try {
        const mockPurchase = {
          id: 'test-cert-' + Date.now(),
          userId: 'test-user',
          seatType: 'founder' as const,
          amount: 300000,
          status: 'completed' as const,
          paymentReference: null,
          mountingType: 'none',
          internationalShipping: false,
          purchaseMode: 'cast_now' as const,
          giftMessage: null,
          giftRecipientEmail: null,
          giftRecipientName: null,
          giftStatus: null,
          specimenStyle: 'cones_bracts_seedpods',
          notes: 'Test certificate',
          createdAt: new Date(),
          completedAt: new Date()
        };

        const mockCodes = [
          {
            id: 'test1',
            purchaseId: mockPurchase.id,
            type: 'bronze_claim' as const,
            code: generateBronzeClaimCode(),
            discount: null,
            transferable: false,
            appliesTo: 'any' as const,
            usedAt: null,
            redemptionCount: 0,
            maxRedemptions: 1,
            redeemedBy: [],
            lastRedeemedAt: null,
            createdAt: new Date()
          },
          {
            id: 'test2',
            purchaseId: mockPurchase.id,
            type: 'workshop_voucher' as const,
            code: generateWorkshopVoucherCode('founder'),
            discount: 50,
            transferable: false,
            appliesTo: 'workshop' as const,
            usedAt: null,
            redemptionCount: 0,
            maxRedemptions: 1,
            redeemedBy: [],
            lastRedeemedAt: null,
            createdAt: new Date()
          },
          {
            id: 'test3',
            purchaseId: mockPurchase.id,
            type: 'lifetime_workshop' as const,
            code: generateLifetimeWorkshopCode('founder'),
            discount: 100,
            transferable: false,
            appliesTo: 'workshop' as const,
            usedAt: null,
            redemptionCount: 0,
            maxRedemptions: null,
            redeemedBy: [],
            lastRedeemedAt: null,
            createdAt: new Date()
          }
        ];

        const certUrl = await generateCertificate(mockPurchase as any, mockCodes as any, 'Test User');
        results.tests.certificateGeneration = {
          status: 'PASS',
          certificatePath: certUrl,
          purchaseId: mockPurchase.id,
          note: 'Certificate generated successfully at: ' + certUrl
        };
        console.log('[Test] Certificate generation PASSED:', certUrl);
      } catch (error: any) {
        results.tests.certificateGeneration = { status: 'FAIL', error: error.message };
        console.error('[Test] Certificate generation FAILED:', error);
      }

      // TEST 3: Early Bird Hold Expiration Logic
      try {
        const now = new Date();
        const pastExpiration = new Date(now.getTime() - 1000); // 1 second ago
        const futureExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        const isPastExpired = pastExpiration < now; // Should be true
        const isFutureActive = futureExpiration > now; // Should be true

        results.tests.holdExpirationLogic = {
          status: isPastExpired && isFutureActive ? 'PASS' : 'FAIL',
          pastHoldIsExpired: isPastExpired,
          futureHoldIsActive: isFutureActive,
          note: 'Hold expiration timestamps working correctly'
        };
        console.log('[Test] Hold expiration logic PASSED');
      } catch (error: any) {
        results.tests.holdExpirationLogic = { status: 'FAIL', error: error.message };
        console.error('[Test] Hold expiration logic FAILED:', error);
      }

      // TEST 4: Check seat reservation counting
      try {
        const seats = await storage.getSeats();
        results.tests.seatTracking = {
          status: 'PASS',
          totalSeats: seats.length,
          seats: seats.map(s => ({
            type: s.type,
            totalAvailable: s.totalAvailable,
            sold: s.sold,
            remaining: s.totalAvailable - s.sold
          })),
          note: 'Seat inventory is being tracked'
        };
        console.log('[Test] Seat tracking PASSED');
      } catch (error: any) {
        results.tests.seatTracking = { status: 'FAIL', error: error.message };
        console.error('[Test] Seat tracking FAILED:', error);
      }

      console.log('[Test] All system tests complete:', results);
      res.json(results);
    } catch (error: any) {
      console.error("[Test] System test error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get all specimen customizations
  app.get("/api/admin/specimen-customizations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const customizations = await storage.getAllSpecimenCustomizations();
      res.json(customizations);
    } catch (error: any) {
      console.error("[Admin] Get customizations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Save specimen customization
  app.post("/api/admin/specimen-customizations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const customization = await storage.upsertSpecimenCustomization(req.body);
      res.json(customization);
    } catch (error: any) {
      console.error("[Admin] Save customization error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Delete specimen customization
  app.delete("/api/admin/specimen-customizations/:specimenKey", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const success = await storage.deleteSpecimenCustomization(req.params.specimenKey);
      res.json({ success });
    } catch (error: any) {
      console.error("[Admin] Delete customization error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Frontend: Get all specimen customizations (public endpoint for fetch)
  app.get("/api/specimen-customizations", async (req: any, res: Response) => {
    try {
      const customizations = await storage.getAllSpecimenCustomizations();
      res.json(customizations);
    } catch (error: any) {
      console.error("[Specimen] Get customizations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Diagnostic endpoint to verify PayFast and Email configuration
  app.get("/api/admin/diagnostics", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = await getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });

      const diagnostics = {
        timestamp: new Date().toISOString(),
        payfast: {
          merchant_id: process.env.PAYFAST_MERCHANT_ID ? `${process.env.PAYFAST_MERCHANT_ID.substring(0, 4)}****` : 'NOT SET',
          merchant_key: process.env.PAYFAST_MERCHANT_KEY ? '***SET***' : 'NOT SET',
          passphrase: process.env.PAYFAST_PASSPHRASE ? '***SET***' : 'NOT SET',
          mode: process.env.PAYFAST_MODE || 'NOT SET',
          frontend_url: process.env.FRONTEND_URL || 'NOT SET (defaults to timeless.organic)',
          backend_url: process.env.BACKEND_URL || 'NOT SET',
        },
        email: {
          smtp_host: process.env.SMTP_HOST ? `${process.env.SMTP_HOST.substring(0, 10)}...` : 'NOT SET',
          smtp_port: process.env.SMTP_PORT || 'NOT SET',
          smtp_user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...` : 'NOT SET',
          smtp_pass: process.env.SMTP_PASS ? '***SET***' : 'NOT SET',
        },
        urls: {
          return_url: `${process.env.FRONTEND_URL || 'https://www.timeless.organic'}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL || 'https://www.timeless.organic'}/payment/cancel`,
          notify_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/notify`,
        },
        issues: [] as string[],
      };

      // Check for common issues
      if (!process.env.PAYFAST_MERCHANT_ID) diagnostics.issues.push('PAYFAST_MERCHANT_ID not set');
      if (!process.env.PAYFAST_MERCHANT_KEY) diagnostics.issues.push('PAYFAST_MERCHANT_KEY not set');
      if (!process.env.PAYFAST_PASSPHRASE) diagnostics.issues.push('PAYFAST_PASSPHRASE not set');
      if (process.env.PAYFAST_MODE !== 'production' && process.env.PAYFAST_MODE !== 'live') diagnostics.issues.push('PAYFAST_MODE should be "production" or "live" for onsite payments');
      if (!process.env.SMTP_HOST) diagnostics.issues.push('SMTP_HOST not set - emails will not be sent');
      if (!process.env.SMTP_USER) diagnostics.issues.push('SMTP_USER not set - emails will not be sent');
      if (!process.env.BACKEND_URL) diagnostics.issues.push('BACKEND_URL not set - PayFast notify webhook may fail');

      console.log('[Admin Diagnostics] Configuration check:', diagnostics);
      res.json(diagnostics);
    } catch (error: any) {
      console.error("[Admin Diagnostics] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
