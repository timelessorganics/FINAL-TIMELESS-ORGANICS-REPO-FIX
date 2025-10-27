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

// Purchases made by users
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  seatType: seatTypeEnum("seat_type").notNull(),
  amount: integer("amount").notNull(), // In cents
  status: purchaseStatusEnum("status").default('pending').notNull(),
  paymentReference: varchar("payment_reference"), // PayFast payment ID
  certificateUrl: varchar("certificate_url"), // URL to PDF certificate
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  seatType: true,
  amount: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Code types enum
export const codeTypeEnum = pgEnum('code_type', ['bronze_claim', 'workshop_voucher', 'lifetime_workshop']);

// Code applies to enum (workshop-only, seat purchases, or any)
export const codeAppliesToEnum = pgEnum('code_applies_to', ['workshop', 'seat', 'any']);

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

// Available sculpture/cutting options
export const sculptures = pgTable("sculptures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  availableFor: seatTypeEnum("available_for"), // null = both, or specific to founder/patron
  isBronze: boolean("is_bronze").default(false), // Special treatment for bronze pieces
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSculptureSchema = createInsertSchema(sculptures).pick({
  name: true,
  description: true,
  imageUrl: true,
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
}));
