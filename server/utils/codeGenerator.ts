import { randomBytes } from "crypto";

// Generate random alphanumeric string
function generateRandomCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking characters
  let result = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function generateBronzeClaimCode(): string {
  // Format: BR-XXXX-XXXX
  const part1 = generateRandomCode(4);
  const part2 = generateRandomCode(4);
  return `BR-${part1}-${part2}`;
}

export function generateWorkshopVoucherCode(seatType: 'founder' | 'patron'): string {
  // Format: FO-50-XXXX-XXXX (Founder 50%) or PA-80-XXXX-XXXX (Patron 80%)
  const prefix = seatType === 'founder' ? 'FO-50' : 'PA-80';
  const part1 = generateRandomCode(4);
  const part2 = generateRandomCode(4);
  return `${prefix}-${part1}-${part2}`;
}

export function generateLifetimeWorkshopCode(seatType: 'founder' | 'patron'): string {
  // Format: LF-20-XXXX-XXXX (Founder 20% lifetime) or LP-30-XXXX-XXXX (Patron 30% lifetime)
  // Unique per purchase to prevent cross-user sharing
  const prefix = seatType === 'founder' ? 'LF-20' : 'LP-30';
  const part1 = generateRandomCode(4);
  const part2 = generateRandomCode(4);
  return `${prefix}-${part1}-${part2}`;
}

export function getWorkshopVoucherDiscount(seatType: 'founder' | 'patron'): number {
  // One-time workshop voucher discounts
  return seatType === 'founder' ? 50 : 80;
}

export function getLifetimeWorkshopDiscount(seatType: 'founder' | 'patron'): number {
  // Lifetime workshop discounts
  return seatType === 'founder' ? 20 : 30;
}
