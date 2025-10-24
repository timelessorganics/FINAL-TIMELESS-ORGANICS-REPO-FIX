import {
  users,
  seats,
  purchases,
  codes,
  sculptures,
  sculptureSelections,
  referrals,
  type User,
  type UpsertUser,
  type Seat,
  type Purchase,
  type InsertPurchase,
  type Code,
  type InsertCode,
  type Sculpture,
  type InsertSculpture,
  type SculptureSelection,
  type InsertSculptureSelection,
  type Referral,
  type InsertReferral,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Seat operations
  getSeats(): Promise<Seat[]>;
  getSeatByType(type: 'founder' | 'patron'): Promise<Seat | undefined>;
  updateSeatSold(type: 'founder' | 'patron', increment: number): Promise<void>;
  
  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
  getAllPurchases(): Promise<Purchase[]>;
  updatePurchaseStatus(id: string, status: 'pending' | 'completed' | 'failed', paymentReference?: string, certificateUrl?: string): Promise<boolean>;
  
  // Code operations
  createCode(code: InsertCode): Promise<Code>;
  getCodesByPurchaseId(purchaseId: string): Promise<Code[]>;
  getAllCodes(): Promise<Code[]>;
  getCodeByCode(code: string): Promise<Code | undefined>;
  getCodeById(codeId: string): Promise<Code | undefined>;
  redeemCode(codeId: string, redeemedBy: string): Promise<void>;
  
  // Sculpture operations
  createSculpture(sculpture: InsertSculpture): Promise<Sculpture>;
  getSculptures(): Promise<Sculpture[]>;
  getSculpture(id: string): Promise<Sculpture | undefined>;
  
  // Sculpture selection operations
  createSculptureSelection(selection: InsertSculptureSelection): Promise<SculptureSelection>;
  getSculptureSelectionByPurchaseId(purchaseId: string): Promise<SculptureSelection | undefined>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByCodeId(codeId: string): Promise<Referral[]>;
  getReferralsByUserId(userId: string): Promise<Referral[]>;
  getAllReferrals(): Promise<Referral[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Seat operations
  async getSeats(): Promise<Seat[]> {
    return await db.select().from(seats);
  }

  async getSeatByType(type: 'founder' | 'patron'): Promise<Seat | undefined> {
    const [seat] = await db.select().from(seats).where(eq(seats.type, type));
    return seat;
  }

  async updateSeatSold(type: 'founder' | 'patron', increment: number): Promise<void> {
    await db
      .update(seats)
      .set({
        sold: sql`${seats.sold} + ${increment}`,
        updatedAt: new Date(),
      })
      .where(eq(seats.type, type));
  }

  // Purchase operations
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [p] = await db.insert(purchases).values(purchase).returning();
    return p;
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.createdAt));
  }

  async updatePurchaseStatus(
    id: string,
    status: 'pending' | 'completed' | 'failed',
    paymentReference?: string,
    certificateUrl?: string
  ): Promise<boolean> {
    const purchase = await this.getPurchase(id);
    if (!purchase) return false;

    // If already completed and just updating certificate URL, allow update
    if (purchase.status === 'completed' && status === 'completed' && certificateUrl) {
      const result = await db
        .update(purchases)
        .set({ certificateUrl })
        .where(eq(purchases.id, id))
        .returning();
      return result.length > 0;
    }

    // For initial completion, only update if not already completed (atomic idempotency)
    const result = await db
      .update(purchases)
      .set({
        status,
        paymentReference,
        certificateUrl,
        completedAt: status === 'completed' ? new Date() : undefined,
      })
      .where(
        status === 'completed'
          ? sql`${purchases.id} = ${id} AND ${purchases.status} != 'completed'`
          : eq(purchases.id, id)
      )
      .returning();
    
    // Return true if a row was updated, false if already completed
    return result.length > 0;
  }

  // Code operations
  async createCode(code: InsertCode): Promise<Code> {
    const [c] = await db.insert(codes).values(code).returning();
    return c;
  }

  async getCodesByPurchaseId(purchaseId: string): Promise<Code[]> {
    return await db.select().from(codes).where(eq(codes.purchaseId, purchaseId));
  }

  async getAllCodes(): Promise<Code[]> {
    return await db.select().from(codes);
  }

  async getCodeByCode(codeString: string): Promise<Code | undefined> {
    const [code] = await db.select().from(codes).where(eq(codes.code, codeString));
    return code;
  }

  async getCodeById(codeId: string): Promise<Code | undefined> {
    const [code] = await db.select().from(codes).where(eq(codes.id, codeId));
    return code;
  }

  async redeemCode(codeId: string, redeemedBy: string): Promise<void> {
    const [code] = await db.select().from(codes).where(eq(codes.id, codeId));
    if (!code) {
      throw new Error("Code not found");
    }

    const currentRedeemedBy = (code.redeemedBy as string[]) || [];
    
    await db
      .update(codes)
      .set({
        redemptionCount: sql`${codes.redemptionCount} + 1`,
        redeemedBy: [...currentRedeemedBy, redeemedBy] as any,
        lastRedeemedAt: new Date(),
        usedAt: code.usedAt || new Date(), // Set usedAt on first redemption
      })
      .where(eq(codes.id, codeId));
  }

  // Sculpture operations
  async createSculpture(sculpture: InsertSculpture): Promise<Sculpture> {
    const [s] = await db.insert(sculptures).values(sculpture).returning();
    return s;
  }

  async getSculptures(): Promise<Sculpture[]> {
    return await db.select().from(sculptures).orderBy(sculptures.displayOrder);
  }

  async getSculpture(id: string): Promise<Sculpture | undefined> {
    const [sculpture] = await db.select().from(sculptures).where(eq(sculptures.id, id));
    return sculpture;
  }

  // Sculpture selection operations
  async createSculptureSelection(selection: InsertSculptureSelection): Promise<SculptureSelection> {
    const [s] = await db.insert(sculptureSelections).values(selection).returning();
    return s;
  }

  async getSculptureSelectionByPurchaseId(purchaseId: string): Promise<SculptureSelection | undefined> {
    const [selection] = await db.select().from(sculptureSelections).where(eq(sculptureSelections.purchaseId, purchaseId));
    return selection;
  }

  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [r] = await db.insert(referrals).values(referral).returning();
    return r;
  }

  async getReferralsByCodeId(codeId: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referralCodeId, codeId)).orderBy(desc(referrals.createdAt));
  }

  async getReferralsByUserId(userId: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referredUserId, userId)).orderBy(desc(referrals.createdAt));
  }

  async getAllReferrals(): Promise<Referral[]> {
    return await db.select().from(referrals).orderBy(desc(referrals.createdAt));
  }
}

export const storage = new DatabaseStorage();
