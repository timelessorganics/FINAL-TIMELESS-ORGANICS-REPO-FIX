// Generate unique promo codes for free passes
export function generatePromoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
  let code = 'PATRON';
  
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'; // Add separator for readability
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return code;
}
