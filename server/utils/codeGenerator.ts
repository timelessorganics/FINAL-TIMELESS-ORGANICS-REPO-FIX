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
  // Format: FO-40-XXXX-XXXX (Founder) or PA-60-XXXX-XXXX (Patron)
  const prefix = seatType === 'founder' ? 'FO-40' : 'PA-60';
  const part1 = generateRandomCode(4);
  const part2 = generateRandomCode(4);
  return `${prefix}-${part1}-${part2}`;
}

export function generateLifetimeReferralCode(): string {
  // Format: REF-LIFETIME-20%
  // This is a standard code for all users
  return "REF-LIFETIME-20%";
}

export function getWorkshopDiscount(seatType: 'founder' | 'patron'): number {
  return seatType === 'founder' ? 40 : 60;
}
