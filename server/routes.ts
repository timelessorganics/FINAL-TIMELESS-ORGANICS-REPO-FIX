import type { Express, Request, Response, RequestHandler } from "express";
import type { Server } from "http";
import { createServer } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import {
  insertPurchaseSchema,
  insertSculptureSchema,
  insertSculptureSelectionSchema,
  insertSubscriberSchema,
  insertPromoCodeSchema,
} from "@shared/schema";
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
import { generatePaymentIdentifier } from "./utils/payfast-onsite";
import { generateCertificate } from "./utils/certificateGenerator";
import { generateCodeSlips } from "./utils/codeSlipsGenerator";
import {
  sendCertificateEmail,
  sendPurchaseConfirmationEmail,
  sendGiftNotificationEmail,
} from "./utils/emailService";
import { generatePromoCode } from "./utils/promoCodeGenerator";
import { addSubscriberToMailchimp } from "./mailchimp";
import { registerWorkshopRoutes } from "./routes/workshop-calendar";

// Server-side pricing functions (source of truth - NEVER trust client prices!)

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
      const seats = await storage.getSeats();
      res.json(seats);
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

        // Validate specimen style selection
        if (!specimenStyle) {
          return res.status(400).json({
            message: "Please select a specimen style",
          });
        }

        // Calculate add-on prices server-side (NEVER trust client prices!)
        const mountingPriceCents = getMountingPrice(mountingType || "none");
        const patinaPriceCents = hasPatina ? getPatinaPrice() : 0;
        const commissionVoucherPriceCents = commissionVoucher
          ? getCommissionVoucherPrice()
          : 0;

        // Calculate total: base seat price + patina (R1K) + mounting deposit (R1K) + commission voucher (R1.5K)
        const amount =
          seat.price +
          patinaPriceCents +
          mountingPriceCents +
          commissionVoucherPriceCents;

        // Validate delivery information
        if (!deliveryName || !deliveryPhone || !deliveryAddress) {
          return res.status(400).json({
            message: "Delivery information is required (name, phone, address)",
          });
        }

        // Create purchase record with user's chosen specimen style and add-ons
        const purchase = await storage.createPurchase({
          userId,
          seatType,
          amount,
          specimenStyle,
          hasPatina: hasPatina || false,
          mountingType: mountingType || "none",
          mountingPriceCents: mountingPriceCents || 0,
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

        // Generate PayFast Onsite Payment Identifier (UUID)
        try {
          const uuid = await generatePaymentIdentifier(
            purchase.id,
            purchase.amount,
            purchase.seatType,
            userEmail,
            userFirstName,
            normalizedIp,
            userAgent,
          );

          console.log(
            "[Purchase] Generated PayFast UUID for purchase:",
            purchase.id,
          );

          // Return UUID for onsite payment modal
          res.json({
            uuid,
            purchaseId: purchase.id,
          });
        } catch (uuidError: any) {
          console.error(
            "[Purchase] Failed to generate PayFast UUID:",
            uuidError,
          );
          // Mark purchase as failed since payment can't proceed
          await storage.updatePurchaseStatus(purchase.id, "failed");
          return res.status(500).json({
            message: "Failed to initiate payment: " + uuidError.message,
          });
        }
      } catch (error: any) {
        console.error("Purchase initiation error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to initiate purchase" });
      }
    },
  );

  // Protected: Server-side PayFast redirect - builds HTML form and auto-submits
  app.get(
    "/api/purchase/:id/redirect",
    isAuthenticated,
    async (req: any, res: Response) => {
      try {
        const purchaseId = req.params.id;
        const userId = await getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // Get purchase and verify ownership
        const purchase = await storage.getPurchase(purchaseId);
        if (!purchase) {
          return res.status(404).send("Purchase not found");
        }

        if (purchase.userId !== userId) {
          return res.status(403).send("Unauthorized");
        }

        // Create PayFast payment data
        const paymentData = createPaymentData(
          purchase.id,
          purchase.amount,
          purchase.seatType,
          (req as any).user?.email || "studio@timeless.organic",
          (req as any).user?.firstName || "Investor",
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
        const userEmail = user?.email || pfData.email_address;
        if (userEmail && certificateUrl) {
          sendPurchaseConfirmationEmail(userEmail, userName, purchase).catch(
            console.error,
          );
          sendCertificateEmail(
            userEmail,
            userName,
            purchase,
            allCodes,
            certificateUrl,
            codeSlipsUrl,
          ).catch(console.error);
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

        // Validate specimen style selection
        if (!specimenStyle) {
          return res.status(400).json({
            message: "Please select a specimen style",
          });
        }

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

        console.log(`[Gift] Purchase ${purchaseId} claimed by user ${userId}`);

        res.json({ message: "Gift claimed successfully" });
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

        const { count = 1 } = req.body;
        const generatedCodes = [];

        for (let i = 0; i < Math.min(count, 20); i++) {
          // Max 20 at once
          const code = generatePromoCode();
          const promoCode = await storage.createPromoCode({
            code,
            seatType: "patron",
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

  // Serve certificates statically
  app.use(
    "/certificates",
    express.static(path.join(process.cwd(), "certificates")),
  );

  const httpServer = createServer(app);
  return httpServer;
}
