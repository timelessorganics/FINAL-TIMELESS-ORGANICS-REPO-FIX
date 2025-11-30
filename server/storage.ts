import {
  usersTable,
  seats,
  purchases,
  codes,
  sculptures,
  sculptureSelections,
  referrals,
  subscribers,
  promoCodes,
  reservations,
  workshopDatesTable,
  workshopBookingsTable,
  workshopWaitlistTable,
  mediaAssets,
  pageAssets,
  websiteContent,
  products,
  productImages,
  auctions,
  auctionImages,
  auctionBids,
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
  type Subscriber,
  type InsertSubscriber,
  type PromoCode,
  type InsertPromoCode,
  type Reservation,
  type InsertReservation,
  type MediaAsset,
  type InsertMediaAsset,
  type PageAsset,
  type InsertPageAsset,
  type WebsiteContent,
  type InsertWebsiteContent,
  type Product,
  type InsertProduct,
  type ProductImage,
  type InsertProductImage,
  type Auction,
  type InsertAuction,
  type AuctionImage,
  type InsertAuctionImage,
  type AuctionBid,
  type InsertAuctionBid,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gt, lt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: { email: string; firstName?: string; lastName?: string; isAdmin?: boolean }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Seat operations
  getSeats(): Promise<Seat[]>;
  getSeatByType(type: 'founder' | 'patron'): Promise<Seat | undefined>;
  updateSeatSold(type: 'founder' | 'patron', increment: number): Promise<void>;
  updateSeatPrice(type: 'founder' | 'patron', priceCents: number): Promise<void>;
  activateFireSale(founderPriceCents: number, patronPriceCents: number, durationHours: number): Promise<void>;
  deactivateFireSale(): Promise<void>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  getPurchasesByUserId(userId: string): Promise<Purchase[]>;
  getAllPurchases(): Promise<Purchase[]>;
  updatePurchaseStatus(id: string, status: 'pending' | 'completed' | 'failed', paymentReference?: string, certificateUrl?: string): Promise<boolean>;
  updatePurchase(id: string, updates: Partial<Purchase>): Promise<void>;
  claimGiftPurchase(purchaseId: string, userId: string): Promise<void>;

  // Code operations
  createCode(code: InsertCode): Promise<Code>;
  getCodesByPurchaseId(purchaseId: string): Promise<Code[]>;
  getAllCodes(): Promise<Code[]>;
  getCodeByCode(codeString: string): Promise<Code | undefined>;
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

  // Subscriber operations (pre-launch interest capture)
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;

  // Promo code operations (for free passes)
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  getPromoCodeByCode(code: string): Promise<PromoCode | undefined>;
  getAllPromoCodes(): Promise<PromoCode[]>;
  markPromoCodeAsUsed(id: string, userId: string, purchaseId: string): Promise<void>;

  // Reservation operations (24-hour seat holds)
  createReservation(userId: string, seatType: 'founder' | 'patron'): Promise<Reservation>;
  getActiveReservation(userId: string, seatType: 'founder' | 'patron'): Promise<Reservation | undefined>;
  getActiveReservationsByType(seatType: 'founder' | 'patron'): Promise<Reservation[]>;
  getActiveReservationsCount(seatType: 'founder' | 'patron'): Promise<number>;
  expireOldReservations(): Promise<number>; // Returns count of expired
  cancelReservation(reservationId: string): Promise<void>;
  convertReservationToPurchase(reservationId: string, purchaseId: string): Promise<void>;
  getUserActiveReservations(userId: string): Promise<Reservation[]>;

  // Workshop Calendar Methods
  getWorkshopDates(): Promise<Array<any>>;
  getWorkshopDate(id: string): Promise<any | undefined>;
  createWorkshopDate(data: any): Promise<any>;
  getWorkshopBooking(userId: string, workshopDateId: string): Promise<any | undefined>;
  createWorkshopBooking(data: any): Promise<any>;
  getWaitlistEntry(userId: string, workshopDateId: string): Promise<any | undefined>;
  addToWaitlist(data: { userId: string; workshopDateId: string }): Promise<any>;
  getWaitlistForWorkshop(workshopDateId: string): Promise<Array<any>>;

  // Admin Media Asset operations
  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAssets(): Promise<MediaAsset[]>;
  getMediaAsset(id: string): Promise<MediaAsset | undefined>;
  updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset | undefined>;
  deleteMediaAsset(id: string): Promise<boolean>;

  // Admin Page Asset operations
  getPageAssets(pageSlug?: string): Promise<PageAsset[]>;
  setPageAsset(data: InsertPageAsset): Promise<PageAsset>;
  deletePageAsset(pageSlug: string, slotKey: string): Promise<boolean>;

  // Admin Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  addProductImage(data: InsertProductImage): Promise<ProductImage>;
  getProductImages(productId: string): Promise<ProductImage[]>;
  deleteProductImage(id: string): Promise<boolean>;

  // Admin Auction operations
  createAuction(auction: InsertAuction): Promise<Auction>;
  getAuctions(): Promise<Auction[]>;
  getAuction(id: string): Promise<Auction | undefined>;
  getAuctionBySlug(slug: string): Promise<Auction | undefined>;
  updateAuction(id: string, updates: Partial<Auction>): Promise<Auction | undefined>;
  deleteAuction(id: string): Promise<boolean>;
  addAuctionImage(data: InsertAuctionImage): Promise<AuctionImage>;
  getAuctionImages(auctionId: string): Promise<AuctionImage[]>;
  deleteAuctionImage(id: string): Promise<boolean>;

  // Auction Bid operations
  placeBid(bid: InsertAuctionBid): Promise<AuctionBid>;
  getAuctionBids(auctionId: string): Promise<AuctionBid[]>;
  getHighestBid(auctionId: string): Promise<AuctionBid | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
  }

  async createUser(userData: { email: string; firstName?: string; lastName?: string; isAdmin?: boolean }): Promise<User> {
    const [user] = await db
      .insert(usersTable)
      .values({
        email: userData.email,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        isAdmin: userData.isAdmin || false,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Exclude id from update to avoid breaking foreign key constraints
    const { id, ...updateData } = userData;
    const [user] = await db
      .insert(usersTable)
      .values(userData)
      .onConflictDoUpdate({
        target: usersTable.email,
        set: {
          ...updateData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Seat operations
  async getSeats(): Promise<Seat[]> {
    // Auto-expire fire sales on read
    const allSeats = await db.select().from(seats);
    const now = new Date();
    
    for (const seat of allSeats) {
      if (seat.fireSaleEndsAt && seat.fireSaleEndsAt < now && seat.fireSalePrice) {
        // Fire sale expired, clear it automatically
        await db.update(seats).set({
          fireSalePrice: null,
          fireSaleEndsAt: null,
          updatedAt: now,
        }).where(eq(seats.id, seat.id));
        
        console.log(`[Fire Sale] Auto-expired fire sale for ${seat.type} seat`);
        seat.fireSalePrice = null;
        seat.fireSaleEndsAt = null;
      }
    }
    
    return allSeats;
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

  async updateSeatPrice(type: 'founder' | 'patron', priceCents: number): Promise<void> {
    await db
      .update(seats)
      .set({
        price: priceCents,
        updatedAt: new Date(),
      })
      .where(eq(seats.type, type));
  }

  async activateFireSale(founderPriceCents: number, patronPriceCents: number, durationHours: number): Promise<void> {
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + durationHours);
    
    await db.update(seats).set({
      fireSalePrice: founderPriceCents,
      fireSaleEndsAt: endsAt,
      updatedAt: new Date(),
    }).where(eq(seats.type, 'founder'));
    
    await db.update(seats).set({
      fireSalePrice: patronPriceCents,
      fireSaleEndsAt: endsAt,
      updatedAt: new Date(),
    }).where(eq(seats.type, 'patron'));
    
    console.log(`[Fire Sale] Activated! Founder R${founderPriceCents/100}, Patron R${patronPriceCents/100}, ends ${endsAt.toISOString()}`);
  }

  async deactivateFireSale(): Promise<void> {
    await db.update(seats).set({
      fireSalePrice: null,
      fireSaleEndsAt: null,
      updatedAt: new Date(),
    });
    console.log(`[Fire Sale] Deactivated`);
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

  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<void> {
    await db
      .update(purchases)
      .set(updates)
      .where(eq(purchases.id, id));
  }

  async claimGiftPurchase(purchaseId: string, userId: string): Promise<void> {
    await db
      .update(purchases)
      .set({
        giftStatus: 'claimed' as any,
        claimedByUserId: userId,
        giftClaimedAt: new Date(),
      })
      .where(eq(purchases.id, purchaseId));
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
    const [s] = await db
  .insert(sculptures)
  .values({
    ...sculpture,
    // Force peakSeasons into a plain string[] (what Drizzle expects)
    peakSeasons: sculpture.peakSeasons
      ? Array.from(sculpture.peakSeasons as string[])
      : null,
  })
  .returning();

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

  // Subscriber operations
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const [s] = await db.insert(subscribers).values(subscriber).returning();
    return s;
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  // Promo code operations
  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const [pc] = await db.insert(promoCodes).values(promoCode).returning();
    return pc;
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [promoCode] = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
    return promoCode;
  }

  async getAllPromoCodes(): Promise<PromoCode[]> {
    return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async markPromoCodeAsUsed(id: string, userId: string, purchaseId: string): Promise<void> {
    await db
      .update(promoCodes)
      .set({
        used: true,
        redeemedBy: userId,
        purchaseId,
        redeemedAt: new Date(),
      })
      .where(eq(promoCodes.id, id));
  }

  // Reservation operations
  async createReservation(userId: string, seatType: 'founder' | 'patron'): Promise<Reservation> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const [reservation] = await db
      .insert(reservations)
      .values({
        userId,
        seatType,
        expiresAt,
        status: 'active',
      })
      .returning();
    return reservation;
  }

  async getActiveReservation(userId: string, seatType: 'founder' | 'patron'): Promise<Reservation | undefined> {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.seatType, seatType),
          eq(reservations.status, 'active'),
          gt(reservations.expiresAt, new Date())
        )
      );
    return reservation;
  }

  async getActiveReservationsByType(seatType: 'founder' | 'patron'): Promise<Reservation[]> {
    return await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.seatType, seatType),
          eq(reservations.status, 'active'),
          gt(reservations.expiresAt, new Date())
        )
      );
  }

  async getActiveReservationsCount(seatType: 'founder' | 'patron'): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.seatType, seatType),
          eq(reservations.status, 'active'),
          gt(reservations.expiresAt, new Date())
        )
      );
    return result[0]?.count || 0;
  }

  async expireOldReservations(): Promise<number> {
    const result = await db
      .update(reservations)
      .set({ status: 'expired' })
      .where(
        and(
          eq(reservations.status, 'active'),
          lt(reservations.expiresAt, new Date())
        )
      )
      .returning();
    return result.length;
  }

  async cancelReservation(reservationId: string): Promise<void> {
    await db
      .update(reservations)
      .set({ status: 'cancelled' })
      .where(eq(reservations.id, reservationId));
  }

  async convertReservationToPurchase(reservationId: string, purchaseId: string): Promise<void> {
    await db
      .update(reservations)
      .set({ 
        status: 'converted',
        convertedToPurchaseId: purchaseId,
      })
      .where(eq(reservations.id, reservationId));
  }

  async getUserActiveReservations(userId: string): Promise<Reservation[]> {
    return await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.status, 'active'),
          gt(reservations.expiresAt, new Date())
        )
      );
  }

  // Workshop Calendar Methods
  async getWorkshopDates() {
    const dates = await db.select().from(workshopDatesTable).orderBy(workshopDatesTable.date);

    return dates.map(date => {
      const spotsLeft = date.maxParticipants - date.currentParticipants;
      let status: "available" | "filling_fast" | "sold_out" = "available";

      if (spotsLeft === 0) {
        status = "sold_out";
      } else if (spotsLeft <= 2) {
        status = "filling_fast";
      }

      return { ...date, status };
    });
  }

  async getWorkshopDate(id: string) {
    const [workshopDate] = await db.select().from(workshopDatesTable).where(eq(workshopDatesTable.id, id));
    return workshopDate;
  }

  async createWorkshopDate(data: any) {
    const [workshopDate] = await db.insert(workshopDatesTable).values(data).returning();
    return workshopDate;
  }

  async getWorkshopBooking(userId: string, workshopDateId: string) {
    const [booking] = await db.select().from(workshopBookingsTable)
      .where(and(
        eq(workshopBookingsTable.userId, userId),
        eq(workshopBookingsTable.workshopDateId, workshopDateId)
      ));
    return booking;
  }

  async createWorkshopBooking(data: any) {
    const [booking] = await db.insert(workshopBookingsTable).values(data).returning();

    // Increment current participants
    await db.update(workshopDatesTable)
      .set({ currentParticipants: sql`${workshopDatesTable.currentParticipants} + 1` })
      .where(eq(workshopDatesTable.id, data.workshopDateId));

    return booking;
  }

  async getWaitlistEntry(userId: string, workshopDateId: string) {
    const [entry] = await db.select().from(workshopWaitlistTable)
      .where(and(
        eq(workshopWaitlistTable.userId, userId),
        eq(workshopWaitlistTable.workshopDateId, workshopDateId)
      ));
    return entry;
  }

  async addToWaitlist(data: { userId: string; workshopDateId: string }) {
    const [entry] = await db.insert(workshopWaitlistTable).values(data).returning();
    return entry;
  }

  async getWaitlistForWorkshop(workshopDateId: string) {
    return await db.select().from(workshopWaitlistTable)
      .where(eq(workshopWaitlistTable.workshopDateId, workshopDateId))
      .orderBy(workshopWaitlistTable.createdAt);
  }

  // Admin Media Asset operations
  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const [result] = await db.insert(mediaAssets).values(asset).returning();
    return result;
  }

  async getMediaAssets(): Promise<MediaAsset[]> {
    return await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
  }

  async getMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const [result] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return result;
  }

  async updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<MediaAsset | undefined> {
    const [result] = await db.update(mediaAssets).set(updates).where(eq(mediaAssets.id, id)).returning();
    return result;
  }

  async deleteMediaAsset(id: string): Promise<boolean> {
    const result = await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return true;
  }

  // Admin Page Asset operations
  async getPageAssets(pageSlug?: string): Promise<PageAsset[]> {
    if (pageSlug) {
      return await db.select().from(pageAssets).where(eq(pageAssets.pageSlug, pageSlug));
    }
    return await db.select().from(pageAssets);
  }

  async setPageAsset(data: InsertPageAsset): Promise<PageAsset> {
    const [result] = await db
      .insert(pageAssets)
      .values(data)
      .onConflictDoUpdate({
        target: [pageAssets.pageSlug, pageAssets.slotKey],
        set: { assetId: data.assetId, displayOrder: data.displayOrder, isActive: data.isActive, updatedAt: new Date() },
      })
      .returning();
    return result;
  }

  async deletePageAsset(pageSlug: string, slotKey: string): Promise<boolean> {
    await db.delete(pageAssets).where(and(eq(pageAssets.pageSlug, pageSlug), eq(pageAssets.slotKey, slotKey)));
    return true;
  }

  // Website Content operations (CMS)
  async getWebsiteContent(pageSlug?: string): Promise<WebsiteContent[]> {
    if (pageSlug) {
      return await db.select().from(websiteContent).where(eq(websiteContent.pageSlug, pageSlug));
    }
    return await db.select().from(websiteContent);
  }

  async getContentItem(pageSlug: string, sectionKey: string): Promise<WebsiteContent | undefined> {
    const [result] = await db.select().from(websiteContent)
      .where(and(eq(websiteContent.pageSlug, pageSlug), eq(websiteContent.sectionKey, sectionKey)));
    return result;
  }

  async setWebsiteContent(data: InsertWebsiteContent): Promise<WebsiteContent> {
    const [result] = await db
      .insert(websiteContent)
      .values(data)
      .onConflictDoUpdate({
        target: [websiteContent.pageSlug, websiteContent.sectionKey],
        set: { 
          content: data.content, 
          contentType: data.contentType, 
          metadata: data.metadata, 
          isActive: data.isActive, 
          updatedAt: new Date(),
          updatedBy: data.updatedBy,
        },
      })
      .returning();
    return result;
  }

  async deleteWebsiteContent(pageSlug: string, sectionKey: string): Promise<boolean> {
    await db.delete(websiteContent).where(and(eq(websiteContent.pageSlug, pageSlug), eq(websiteContent.sectionKey, sectionKey)));
    return true;
  }

  // Admin Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();
    return result;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.displayOrder);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [result] = await db.select().from(products).where(eq(products.id, id));
    return result;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [result] = await db.select().from(products).where(eq(products.slug, slug));
    return result;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const [result] = await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await db.delete(productImages).where(eq(productImages.productId, id));
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  async addProductImage(data: InsertProductImage): Promise<ProductImage> {
    const [result] = await db.insert(productImages).values(data).returning();
    return result;
  }

  async getProductImages(productId: string): Promise<ProductImage[]> {
    return await db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.displayOrder);
  }

  async deleteProductImage(id: string): Promise<boolean> {
    await db.delete(productImages).where(eq(productImages.id, id));
    return true;
  }

  // Admin Auction operations
  async createAuction(auction: InsertAuction): Promise<Auction> {
    const [result] = await db.insert(auctions).values(auction).returning();
    return result;
  }

  async getAuctions(): Promise<Auction[]> {
    return await db.select().from(auctions).orderBy(desc(auctions.startAt));
  }

  async getAuction(id: string): Promise<Auction | undefined> {
    const [result] = await db.select().from(auctions).where(eq(auctions.id, id));
    return result;
  }

  async getAuctionBySlug(slug: string): Promise<Auction | undefined> {
    const [result] = await db.select().from(auctions).where(eq(auctions.slug, slug));
    return result;
  }

  async updateAuction(id: string, updates: Partial<Auction>): Promise<Auction | undefined> {
    const [result] = await db.update(auctions).set({ ...updates, updatedAt: new Date() }).where(eq(auctions.id, id)).returning();
    return result;
  }

  async deleteAuction(id: string): Promise<boolean> {
    await db.delete(auctionBids).where(eq(auctionBids.auctionId, id));
    await db.delete(auctionImages).where(eq(auctionImages.auctionId, id));
    await db.delete(auctions).where(eq(auctions.id, id));
    return true;
  }

  async addAuctionImage(data: InsertAuctionImage): Promise<AuctionImage> {
    const [result] = await db.insert(auctionImages).values(data).returning();
    return result;
  }

  async getAuctionImages(auctionId: string): Promise<AuctionImage[]> {
    return await db.select().from(auctionImages).where(eq(auctionImages.auctionId, auctionId)).orderBy(auctionImages.displayOrder);
  }

  async deleteAuctionImage(id: string): Promise<boolean> {
    await db.delete(auctionImages).where(eq(auctionImages.id, id));
    return true;
  }

  // Auction Bid operations
  async placeBid(bid: InsertAuctionBid): Promise<AuctionBid> {
    // Mark all previous bids as not winning
    await db.update(auctionBids).set({ isWinning: false }).where(eq(auctionBids.auctionId, bid.auctionId));
    
    // Insert new bid as winning
    const [result] = await db.insert(auctionBids).values({ ...bid, isWinning: true }).returning();
    
    // Update auction's current bid
    await db.update(auctions).set({ currentBidCents: bid.amountCents, updatedAt: new Date() }).where(eq(auctions.id, bid.auctionId));
    
    return result;
  }

  async getAuctionBids(auctionId: string): Promise<AuctionBid[]> {
    return await db.select().from(auctionBids).where(eq(auctionBids.auctionId, auctionId)).orderBy(desc(auctionBids.amountCents));
  }

  async getHighestBid(auctionId: string): Promise<AuctionBid | undefined> {
    const [result] = await db
      .select()
      .from(auctionBids)
      .where(eq(auctionBids.auctionId, auctionId))
      .orderBy(desc(auctionBids.amountCents))
      .limit(1);
    return result;
  }
}

export const storage = new DatabaseStorage();