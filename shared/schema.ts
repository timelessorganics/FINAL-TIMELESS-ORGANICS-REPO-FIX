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
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Seat = typeof seats.$inferSelect;

// Purchase status enum
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'completed', 'failed']);

// Production status enum - batch fulfillment tracking
export const productionStatusEnum = pgEnum('production_status', ['queued', 'invested', 'ready_to_pour', 'poured_finishing', 'complete']);

// Specimen style enum - categories of botanical forms (for future workshop use)
export const specimenStyleEnum = pgEnum('specimen_style', [
  'protea_head',
  'pincushion_bloom',
  'cone_bracts',
  'aloe_inflorescence',
  'erica_spray',
  'restio_seedheads',
  'bulb_spike',
  'pelargonium_leaf',
  'woody_branch',
  'cone_seedpod',
  'succulent_rosette',
  'miniature_mix'
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
  userId: varchar("user_id").references(() => users.id).notNull(),
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
  claimedByUserId: varchar("claimed_by_user_id").references(() => users.id),
  giftClaimedAt: timestamp("gift_claimed_at"),
  
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
  giftStatus: true,
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

// Seat reservations - 24-hour holds before purchase
export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  seatType: seatTypeEnum("seat_type").notNull(),
  status: reservationStatusEnum("status").default('active').notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 24 hours from creation
  convertedToPurchaseId: varchar("converted_to_purchase_id").references(() => purchases.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_reservations_expires").on(table.expiresAt),
  index("IDX_reservations_user_seat").on(table.userId, table.seatType),
]);

export const insertReservationSchema = createInsertSchema(reservations).pick({
  userId: true,
  seatType: true,
  expiresAt: true,
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
  redeemedBy: varchar("redeemed_by").references(() => users.id), // User who redeemed it
  purchaseId: varchar("purchase_id").references(() => purchases.id), // Resulting purchase
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id), // Admin who generated it
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  seatType: true,
  discount: true,
  createdBy: true,
});

export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Referral tracking - tracks when referral codes are used
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCodeId: varchar("referral_code_id").references(() => codes.id).notNull(),
  referredUserId: varchar("referred_user_id").references(() => users.id),
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

// Relations
export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
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

export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  convertedPurchase: one(purchases, {
    fields: [reservations.convertedToPurchaseId],
    references: [purchases.id],
  }),
}));
