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

// Email registrations (gate before main site)
export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  fullName: varchar("full_name"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).pick({
  email: true,
  fullName: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

// Seat types enum
export const seatTypeEnum = pgEnum('seat_type', ['founder', 'patron']);

// Seat inventory tracking
export const seats = pgTable("seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: seatTypeEnum("type").notNull(),
  price: integer("price").notNull(), // In cents (R3000 = 300000, R6000 = 600000)
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
export const codeTypeEnum = pgEnum('code_type', ['bronze_claim', 'workshop_voucher', 'lifetime_referral']);

// Unique codes generated for purchases
export const codes = pgTable("codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseId: varchar("purchase_id").references(() => purchases.id).notNull(),
  type: codeTypeEnum("type").notNull(),
  code: varchar("code").notNull().unique(),
  discount: integer("discount"), // For workshop vouchers (e.g., 40 for 40% off)
  transferable: boolean("transferable").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCodeSchema = createInsertSchema(codes).pick({
  purchaseId: true,
  type: true,
  code: true,
  discount: true,
  transferable: true,
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
