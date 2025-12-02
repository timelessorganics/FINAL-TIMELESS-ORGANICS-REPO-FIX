import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

// DEPRECATED: Email registrations table (replaced by Replit Auth)
// Kept in schema to avoid destructive migrations, but no longer used
export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  fullName: varchar("full_name"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscribers table - Pre-launch interest capture for marketing
export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  notes: text("notes"),
  reservationType: varchar("reservation_type"), // 'reserve', 'secure', 'buy' for pre-launch
  seatType: varchar("seat_type"), // 'founder' or 'patron'
  holdExpiresAt: timestamp("hold_expires_at"), // When early bird hold expires (Monday midnight SA time)
  holdStatus: varchar("hold_status").default('active'), // 'active', 'expired', 'purchased'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  name: true,
  email: true,
  phone: true,
  notes: true,
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// Seat types enum
export const seatTypeEnum = pgEnum('seat_type', ['founder', 'patron']);

// Seat inventory tracking
export const seats = pgTable("seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: seatTypeEnum("type").notNull(),
  price: integer("price").notNull(), // In cents (R3000 = 300000, R5000 = 500000)
  totalAvailable: integer("total_available").notNull(), // 50 for each type
  sold: integer("sold").default(0).notNull(),
  fireSalePrice: integer("fire_sale_price"), // Fire sale price in cents (active for 24hrs from launch)
  fireSaleEndsAt: timestamp("fire_sale_ends_at"), // When fire sale pricing expires
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Seat = typeof seats.$inferSelect;

// Purchase status enum
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'completed', 'failed']);

// Production status enum - batch fulfillment tracking
export const productionStatusEnum = pgEnum('production_status', ['queued', 'invested', 'ready_to_pour', 'poured_finishing', 'complete']);

// Specimen style enum - 9 new Cape Fynbos specimen categories
export const specimenStyleEnum = pgEnum('specimen_style', [
  'cones_bracts_seedpods',
  'protea_pincushion_blooms_heads',
  'bulb_spikes',
  'branches_leaves',
  'aloe_inflorescence_heads',
  'flower_heads',
  'erica_sprays',
  'restios_seedheads_grasses',
  'small_succulents'
]);

// Season window enum (for future workshop use)
export const seasonWindowEnum = pgEnum('season_window', ['winter', 'spring', 'summer', 'autumn', 'year_round']);

// Purchase choice enum - LEGACY for existing purchases (Founding 100 uses studio-selected only)
export const purchaseChoiceEnum = pgEnum('purchase_choice', ['cast_now', 'wait_till_season', 'provide_your_own']);

// Custom specimen approval status - LEGACY for existing purchases
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

// Purchase mode enum - Simplified casting timeline options
export const purchaseModeEnum = pgEnum('purchase_mode', ['cast_now', 'wait_for_season']);

// Mounting type enum - Bronze mounting service options
export const mountingTypeEnum = pgEnum('mounting_type', ['none', 'wall', 'base', 'custom']);

// Gift status enum - Tracking gift purchase claims
export const giftStatusEnum = pgEnum('gift_status', ['pending', 'claimed', 'cancelled']);

// Purchases made by users
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => usersTable.id).notNull(),
  seatType: seatTypeEnum("seat_type").notNull(),
  amount: integer("amount").notNull(), // In cents
  status: purchaseStatusEnum("status").default('pending').notNull(),
  paymentReference: varchar("payment_reference"), // PayFast payment ID
  certificateUrl: varchar("certificate_url"), // URL to PDF certificate

  // Production status tracking (Queued → Invested → Ready to Pour → Poured & Finishing → Complete)
  productionStatus: productionStatusEnum("production_status").default('queued').notNull(),

  // LEGACY FIELDS - Preserved for existing purchases, not used in Founding 100 checkout
  purchaseChoice: purchaseChoiceEnum("purchase_choice").default('cast_now'),
  seasonalBatchWindow: varchar("seasonal_batch_window"),
  specimenStyle: specimenStyleEnum("specimen_style"),
  customSpecimenPhotoUrl: varchar("custom_specimen_photo_url"),
  customSpecimenApprovalStatus: approvalStatusEnum("custom_specimen_approval_status"),
  customSpecimenNotes: text("custom_specimen_notes"),
  specimenId: varchar("specimen_id").references(() => sculptures.id),

  // Add-ons and delivery (collected during checkout)
  hasPatina: boolean("has_patina").default(false).notNull(), // +R1,000 patina service
  hasMounting: boolean("has_mounting").default(false).notNull(), // LEGACY: Replaced by mountingType/mountingPriceCents
  mountingType: mountingTypeEnum("mounting_type").default('none').notNull(), // Mounting service type (wall/base/custom)
  mountingPriceCents: integer("mounting_price_cents").default(0).notNull(), // R1,000 deposit paid for mounting (in cents)
  commissionVoucher: boolean("commission_voucher").default(false).notNull(), // +R1,500 commission voucher (40%/60% off)
  internationalShipping: boolean("international_shipping").default(false).notNull(), // Flag for manual DHL quote
  deliveryName: varchar("delivery_name"),
  deliveryPhone: varchar("delivery_phone"),
  deliveryAddress: text("delivery_address"),

  // Purchase mode - Simplified casting timeline
  purchaseMode: purchaseModeEnum("purchase_mode").default('cast_now').notNull(),

  // Gift purchasing fields
  isGift: boolean("is_gift").default(false).notNull(),
  giftRecipientEmail: varchar("gift_recipient_email"),
  giftRecipientName: varchar("gift_recipient_name"),
  giftMessage: text("gift_message"),
  giftStatus: giftStatusEnum("gift_status").default('pending'),
  claimedByUserId: varchar("claimed_by_user_id").references(() => usersTable.id),
  giftClaimedAt: timestamp("gift_claimed_at"),

  // 3-day payment deadline system
  isDepositOnly: boolean("is_deposit_only").default(false).notNull(), // True if this purchase is SECURE (R1K deposit) vs full payment
  depositAmountCents: integer("deposit_amount_cents").default(0).notNull(), // Amount paid as deposit
  depositPaidAt: timestamp("deposit_paid_at"), // When deposit was paid
  balanceDueAt: timestamp("balance_due_at"), // When remaining balance is due (if applicable)

  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  seatType: true,
  amount: true,
  specimenStyle: true,
  hasPatina: true,
  mountingType: true,
  mountingPriceCents: true,
  commissionVoucher: true,
  internationalShipping: true,
  deliveryName: true,
  deliveryPhone: true,
  deliveryAddress: true,
  purchaseMode: true,
  isGift: true,
  giftRecipientEmail: true,
  giftRecipientName: true,
  giftMessage: true,
  isDepositOnly: true,
  depositAmountCents: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Mounting options lookup table - Configurable mounting service offerings
export const mountingOptions = pgTable("mounting_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(), // e.g., 'wall', 'base', 'custom'
  label: varchar("label").notNull(), // Display name e.g., "Wall Mount"
  description: text("description"), // Details about this mounting type
  priceCents: integer("price_cents").notNull(), // Current price in cents
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMountingOptionSchema = createInsertSchema(mountingOptions).pick({
  key: true,
  label: true,
  description: true,
  priceCents: true,
  isActive: true,
  displayOrder: true,
});

export type InsertMountingOption = z.infer<typeof insertMountingOptionSchema>;
export type MountingOption = typeof mountingOptions.$inferSelect;

// Code types enum - includes bronze_claim for sculpture redemption codes and commission_voucher
export const codeTypeEnum = pgEnum('code_type', ['bronze_claim', 'workshop_voucher', 'lifetime_workshop', 'commission_voucher']);

// Code applies to enum (bronze claim, workshop-only, commission-only, seat purchases, or any)
export const codeAppliesToEnum = pgEnum('code_applies_to', ['bronze_claim', 'workshop', 'commission', 'seat', 'any']);

// Unique codes generated for purchases
export const codes = pgTable("codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id").references(() => purchases.id).notNull(),
  type: codeTypeEnum("type").notNull(),
  code: varchar("code").notNull().unique(),
  discount: integer("discount"), // For workshop vouchers (e.g., 50 for 50% off)
  transferable: boolean("transferable").default(false),
  appliesTo: codeAppliesToEnum("applies_to").default('any').notNull(), // Scope: workshop, seat, or any
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  // Redemption tracking fields
  redemptionCount: integer("redemption_count").default(0).notNull(),
  maxRedemptions: integer("max_redemptions").default(1), // null = unlimited (for lifetime workshop codes)
  redeemedBy: jsonb("redeemed_by").$type<string[]>().default([]), // Array of user IDs or emails
  lastRedeemedAt: timestamp("last_redeemed_at"),
});

export const insertCodeSchema = createInsertSchema(codes).pick({
  purchaseId: true,
  type: true,
  code: true,
  discount: true,
  transferable: true,
  appliesTo: true,
  maxRedemptions: true,
});

export type InsertCode = z.infer<typeof insertCodeSchema>;
export type Code = typeof codes.$inferSelect;

// Available sculpture/cutting options (botanical specimens)
export const sculptures = pgTable("sculptures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),

  // Specimen categorization
  specimenStyle: specimenStyleEnum("specimen_style"), // Category of botanical form
  seasonWindow: seasonWindowEnum("season_window").default('year_round').notNull(), // Primary season
  peakSeasons: jsonb("peak_seasons").$type<string[]>().default([]), // Array of peak season names

  // Legacy fields
  availableFor: seatTypeEnum("available_for"), // null = both, or specific to founder/patron
  isBronze: boolean("is_bronze").default(false), // Special treatment for bronze pieces
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSculptureSchema = createInsertSchema(sculptures).pick({
  name: true,
  description: true,
  imageUrl: true,
  specimenStyle: true,
  seasonWindow: true,
  peakSeasons: true,
  availableFor: true,
  isBronze: true,
  displayOrder: true,
});

export type InsertSculpture = z.infer<typeof insertSculptureSchema>;
export type Sculpture = typeof sculptures.$inferSelect;

// User's sculpture selections
export const sculptureSelections = pgTable("sculpture_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id").references(() => purchases.id).notNull(),
  sculptureId: varchar("sculpture_id").references(() => sculptures.id).notNull(),
  selectedAt: timestamp("selected_at").defaultNow(),
}, (table) => [
  unique("unique_purchase_sculpture").on(table.purchaseId),
]);

export const insertSculptureSelectionSchema = createInsertSchema(sculptureSelections).pick({
  purchaseId: true,
  sculptureId: true,
});

export type InsertSculptureSelection = z.infer<typeof insertSculptureSelectionSchema>;
export type SculptureSelection = typeof sculptureSelections.$inferSelect;

// Reservation status enum - for 24-hour seat holds
export const reservationStatusEnum = pgEnum('reservation_status', ['active', 'converted', 'expired', 'cancelled']);

// Reservation type enum - for pre-launch vs regular reservations
export const reservationTypeEnum = pgEnum('reservation_type', ['prelaunch_deposit', 'prelaunch_hold', 'regular']);

// Seat reservations - 24-hour holds before purchase
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => usersTable.id), // Nullable for pre-launch (no account yet)
  seatType: seatTypeEnum("seat_type").notNull(),
  status: reservationStatusEnum("status").default('active').notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours from creation or launch
  convertedToPurchaseId: varchar("converted_to_purchase_id").references(() => purchases.id),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Pre-launch reservation fields
  reservationType: reservationTypeEnum("reservation_type").default('regular').notNull(),
  email: varchar("email"), // For pre-launch without account
  name: varchar("name"), // Person's name
  phone: varchar("phone"), // Optional phone number
  depositAmountCents: integer("deposit_amount_cents").default(0), // R1000 = 100000 cents
  depositPaidAt: timestamp("deposit_paid_at"),
  depositPaymentRef: varchar("deposit_payment_ref"), // PayFast reference
  balanceDueAt: timestamp("balance_due_at"), // 48hrs after launch for deposits
}, (table) => [
  index("IDX_reservations_expires").on(table.expiresAt),
  index("IDX_reservations_user_seat").on(table.userId, table.seatType),
  index("IDX_reservations_email").on(table.email),
]);

export const insertReservationSchema = createInsertSchema(reservations).pick({
  userId: true,
  seatType: true,
  expiresAt: true,
  reservationType: true,
  email: true,
  name: true,
  phone: true,
  depositAmountCents: true,
});

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;

// Promo codes for free seats (e.g., for friends/family supporters)
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(), // The actual promo code (e.g., PATRON-GIFT-A1B2)
  seatType: seatTypeEnum("seat_type").notNull(), // Which seat type this code grants
  discount: integer("discount").notNull().default(100), // Percentage discount (100 = free)
  used: boolean("used").default(false).notNull(),
  redeemedBy: varchar("redeemed_by").references(() => usersTable.id), // User who redeemed it
  purchaseId: varchar("purchase_id").references(() => purchases.id), // Resulting purchase
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => usersTable.id), // Admin who generated it
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  createdAt: true,
  used: true,
  redeemedBy: true,
  redeemedAt: true,
  purchaseId: true,
});

export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Referral tracking - tracks when referral codes are used
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCodeId: varchar("referral_code_id").references(() => codes.id).notNull(),
  referredUserId: varchar("referred_user_id").references(() => usersTable.id),
  purchaseId: varchar("purchase_id").references(() => purchases.id),
  discountApplied: integer("discount_applied"), // Percentage or amount
  status: varchar("status").default("pending").notNull(), // pending, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referralCodeId: true,
  referredUserId: true,
  purchaseId: true,
  discountApplied: true,
  status: true,
}).partial({ discountApplied: true, purchaseId: true, referredUserId: true });

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Workshop Calendar Tables
export const workshopDatesTable = pgTable("workshop_dates", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  maxParticipants: integer("max_participants").notNull().default(6),
  currentParticipants: integer("current_participants").notNull().default(0),
  depositAmount: integer("deposit_amount").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workshopBookingsTable = pgTable("workshop_bookings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  workshopDateId: text("workshop_date_id").notNull().references(() => workshopDatesTable.id),
  phone: text("phone").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  dietaryRestrictions: text("dietary_restrictions"),
  depositAmount: integer("deposit_amount").notNull(),
  depositPaid: boolean("deposit_paid").notNull().default(false),
  fullPaymentAmount: integer("full_payment_amount"),
  fullPaymentPaid: boolean("full_payment_paid").notNull().default(false),
  status: text("status").notNull().default("pending_deposit"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workshopWaitlistTable = pgTable("workshop_waitlist", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => usersTable.id),
  workshopDateId: text("workshop_date_id").notNull().references(() => workshopDatesTable.id),
  notified: boolean("notified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkshopDateSchema = createInsertSchema(workshopDatesTable).omit({
  id: true,
  createdAt: true,
  currentParticipants: true,
});

export const insertWorkshopBookingSchema = createInsertSchema(workshopBookingsTable).omit({
  id: true,
  createdAt: true,
  depositPaid: true,
  fullPaymentAmount: true,
  fullPaymentPaid: true,
});

// ============================================
// ADMIN MANAGEMENT TABLES
// ============================================

// Media Assets - Centralized image/file management
export const mediaAssets = pgTable("media_assets", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(), // bytes
  url: varchar("url").notNull(), // Supabase storage URL or path
  altText: varchar("alt_text"),
  caption: text("caption"),
  tags: text("tags").array(), // For filtering (e.g., ['hero', 'gallery', 'product'])
  uploadedBy: varchar("uploaded_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;

// Page Assets - Map media to specific page locations (hero, gallery slots, etc.)
export const pageAssets = pgTable("page_assets", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pageSlug: varchar("page_slug").notNull(), // 'home', 'about', 'gallery', etc.
  slotKey: varchar("slot_key").notNull(), // 'hero', 'gallery-1', 'background', etc.
  assetId: text("asset_id").references(() => mediaAssets.id).notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_page_slot").on(table.pageSlug, table.slotKey),
]);

export const insertPageAssetSchema = createInsertSchema(pageAssets).omit({
  id: true,
  updatedAt: true,
});

export type InsertPageAsset = z.infer<typeof insertPageAssetSchema>;
export type PageAsset = typeof pageAssets.$inferSelect;

// Website Content - Editable text sections for each page
export const websiteContent = pgTable("website_content", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pageSlug: varchar("page_slug").notNull(), // 'home', 'about', 'gallery', 'founding-100', etc.
  sectionKey: varchar("section_key").notNull(), // 'hero-title', 'hero-subtitle', 'about-text', etc.
  contentType: varchar("content_type").default('text').notNull(), // 'text', 'richtext', 'html'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For additional styling info, links, etc.
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => usersTable.id),
}, (table) => [
  unique("unique_page_section").on(table.pageSlug, table.sectionKey),
]);

export const insertWebsiteContentSchema = createInsertSchema(websiteContent).omit({
  id: true,
  updatedAt: true,
});

export type InsertWebsiteContent = z.infer<typeof insertWebsiteContentSchema>;
export type WebsiteContent = typeof websiteContent.$inferSelect;

// Product status enum
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'sold_out', 'archived']);

// Products - Shop items
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description"),
  priceCents: integer("price_cents").notNull(), // Price in cents
  comparePriceCents: integer("compare_price_cents"), // Original price for showing discount
  status: productStatusEnum("status").default('draft').notNull(),
  category: varchar("category"), // 'bronze', 'print', 'merchandise', etc.
  sku: varchar("sku"),
  stockQuantity: integer("stock_quantity").default(0),
  featuredImageId: varchar("featured_image_id").references(() => mediaAssets.id),
  displayOrder: integer("display_order").default(0),
  metadata: jsonb("metadata"), // Flexible JSON for specs, dimensions, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product Images - Multiple images per product
export const productImages = pgTable("product_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  assetId: varchar("asset_id").references(() => mediaAssets.id).notNull(),
  role: varchar("role").default('gallery'), // 'featured', 'gallery', 'detail'
  displayOrder: integer("display_order").default(0),
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
});

export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type ProductImage = typeof productImages.$inferSelect;

// Auction status enum
export const auctionStatusEnum = pgEnum('auction_status', ['draft', 'scheduled', 'active', 'ended', 'sold', 'cancelled']);

// Auctions - Bronze piece auctions
export const auctions = pgTable("auctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  reservePriceCents: integer("reserve_price_cents"), // Minimum acceptable price
  startingBidCents: integer("starting_bid_cents").notNull(),
  currentBidCents: integer("current_bid_cents"),
  bidIncrementCents: integer("bid_increment_cents").default(10000), // Min bid increment (R100 default)
  status: auctionStatusEnum("status").default('draft').notNull(),
  featuredImageId: varchar("featured_image_id").references(() => mediaAssets.id),
  winnerId: varchar("winner_id").references(() => usersTable.id),
  metadata: jsonb("metadata"), // Dimensions, weight, provenance, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAuctionSchema = createInsertSchema(auctions).omit({
  id: true,
  currentBidCents: true,
  winnerId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAuction = z.infer<typeof insertAuctionSchema>;
export type Auction = typeof auctions.$inferSelect;

// Auction Images - Multiple images per auction
export const auctionImages = pgTable("auction_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionId: varchar("auction_id").references(() => auctions.id).notNull(),
  assetId: varchar("asset_id").references(() => mediaAssets.id).notNull(),
  role: varchar("role").default('gallery'), // 'featured', 'gallery', 'detail'
  displayOrder: integer("display_order").default(0),
});

export const insertAuctionImageSchema = createInsertSchema(auctionImages).omit({
  id: true,
});

export type InsertAuctionImage = z.infer<typeof insertAuctionImageSchema>;
export type AuctionImage = typeof auctionImages.$inferSelect;

// Auction Bids - Bid history
export const auctionBids = pgTable("auction_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionId: varchar("auction_id").references(() => auctions.id).notNull(),
  userId: varchar("user_id").references(() => usersTable.id).notNull(),
  amountCents: integer("amount_cents").notNull(),
  isWinning: boolean("is_winning").default(false),
  placedAt: timestamp("placed_at").defaultNow(),
}, (table) => [
  index("IDX_auction_bids_auction").on(table.auctionId),
  index("IDX_auction_bids_user").on(table.userId),
]);

export const insertAuctionBidSchema = createInsertSchema(auctionBids).omit({
  id: true,
  isWinning: true,
  placedAt: true,
});

export type InsertAuctionBid = z.infer<typeof insertAuctionBidSchema>;
export type AuctionBid = typeof auctionBids.$inferSelect;

// Relations
export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [purchases.userId],
    references: [usersTable.id],
  }),
  codes: many(codes),
  sculptureSelection: one(sculptureSelections, {
    fields: [purchases.id],
    references: [sculptureSelections.purchaseId],
  }),
}));

export const codesRelations = relations(codes, ({ one }) => ({
  purchase: one(purchases, {
    fields: [codes.purchaseId],
    references: [purchases.id],
  }),
}));

export const sculptureSelectionsRelations = relations(sculptureSelections, ({ one }) => ({
  purchase: one(purchases, {
    fields: [sculptureSelections.purchaseId],
    references: [purchases.id],
  }),
  sculpture: one(sculptures, {
    fields: [sculptureSelections.sculptureId],
    references: [sculptures.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  purchases: many(purchases),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(usersTable, {
    fields: [reservations.userId],
    references: [usersTable.id],
  }),
  convertedPurchase: one(purchases, {
    fields: [reservations.convertedToPurchaseId],
    references: [purchases.id],
  }),
}));

// Workshop relations
export const workshopDateRelations = relations(workshopDatesTable, ({ many }) => ({
  bookings: many(workshopBookingsTable),
  waitlist: many(workshopWaitlistTable),
}));

export const workshopBookingRelations = relations(workshopBookingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [workshopBookingsTable.userId],
    references: [usersTable.id],
  }),
  workshopDate: one(workshopDatesTable, {
    fields: [workshopBookingsTable.workshopDateId],
    references: [workshopDatesTable.id],
  }),
}));

export const workshopWaitlistRelations = relations(workshopWaitlistTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [workshopWaitlistTable.userId],
    references: [usersTable.id],
  }),
  workshopDate: one(workshopDatesTable, {
    fields: [workshopWaitlistTable.workshopDateId],
    references: [workshopDatesTable.id],
  }),
}));

// Admin management relations
export const productRelations = relations(products, ({ one, many }) => ({
  featuredImage: one(mediaAssets, {
    fields: [products.featuredImageId],
    references: [mediaAssets.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  asset: one(mediaAssets, {
    fields: [productImages.assetId],
    references: [mediaAssets.id],
  }),
}));

export const auctionRelations = relations(auctions, ({ one, many }) => ({
  featuredImage: one(mediaAssets, {
    fields: [auctions.featuredImageId],
    references: [mediaAssets.id],
  }),
  images: many(auctionImages),
  bids: many(auctionBids),
  winner: one(usersTable, {
    fields: [auctions.winnerId],
    references: [usersTable.id],
  }),
}));

export const auctionImagesRelations = relations(auctionImages, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionImages.auctionId],
    references: [auctions.id],
  }),
  asset: one(mediaAssets, {
    fields: [auctionImages.assetId],
    references: [mediaAssets.id],
  }),
}));

export const auctionBidsRelations = relations(auctionBids, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionBids.auctionId],
    references: [auctions.id],
  }),
  user: one(usersTable, {
    fields: [auctionBids.userId],
    references: [usersTable.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  uploadedByUser: one(usersTable, {
    fields: [mediaAssets.uploadedBy],
    references: [usersTable.id],
  }),
}));

export const pageAssetsRelations = relations(pageAssets, ({ one }) => ({
  asset: one(mediaAssets, {
    fields: [pageAssets.assetId],
    references: [mediaAssets.id],
  }),
}));

// Specimen Customizations - Store custom images/styles for founding-100 page
export const specimenCustomizations = pgTable("specimen_customizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  specimenKey: varchar("specimen_key").notNull(), // e.g., 'cones_bracts_seedpods'
  imageUrl: varchar("image_url"), // Custom image URL
  name: varchar("name"), // Custom display name
  season: varchar("season"), // Custom season info
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSpecimenCustomizationSchema = createInsertSchema(specimenCustomizations).omit({
  id: true,
  updatedAt: true,
});

export type InsertSpecimenCustomization = z.infer<typeof insertSpecimenCustomizationSchema>;
export type SpecimenCustomization = typeof specimenCustomizations.$inferSelect;