import crypto from "crypto";

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: 'sandbox' | 'production';
}

interface PaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description: string;
  passphrase?: string;
  [key: string]: string | undefined;
}

export function getPayFastConfig(): PayFastConfig {
  const config = {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
    passphrase: process.env.PAYFAST_PASSPHRASE || 'jt7NOE43FZPn',
    mode: (process.env.PAYFAST_MODE as 'sandbox' | 'production') || 'sandbox',
  };
  
  console.log(`[PayFast Config] Mode: ${config.mode}, Merchant ID starts with: ${config.merchantId.substring(0, 4)}****`);
  
  return config;
}

export function generatePayFastUrl(): string {
  const config = getPayFastConfig();
  return config.mode === 'sandbox'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Create parameter string in the order fields appear (NOT alphabetically!)
  // PayFast requires: order as they appear in attributes, NOT alphabetical
  let paramString = '';
  
  // Process keys in insertion order (the order they were added to the object)
  Object.keys(data).forEach((key) => {
    if (key !== 'signature' && data[key] !== '') {
      // URL encode and replace %20 with + as per PayFast requirements
      const encodedValue = encodeURIComponent(data[key].trim()).replace(/%20/g, '+');
      paramString += `${key}=${encodedValue}&`;
    }
  });
  
  // Remove last ampersand
  paramString = paramString.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  // Generate MD5 signature
  return crypto.createHash('md5').update(paramString).digest('hex');
}

export function createPaymentData(
  purchaseId: string,
  amount: number,
  seatType: 'founder' | 'patron',
  email: string,
  firstName: string
): PaymentData {
  const config = getPayFastConfig();
  const baseUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

  const data: PaymentData = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${baseUrl}/payment/success`,
    cancel_url: `${baseUrl}/payment/cancel`,
    notify_url: `${baseUrl}/api/payment/notify`,
    name_first: firstName,
    email_address: email,
    m_payment_id: purchaseId,
    amount: (amount / 100).toFixed(2), // Convert cents to rands
    item_name: seatType === 'founder' ? 'Founders Pass' : 'Patron Gift Card',
    item_description: `Timeless Organics ${seatType === 'founder' ? 'Founder' : 'Patron'} Seat`,
  };

  return data;
}

export function verifyPayFastSignature(data: Record<string, string>, signature: string): boolean {
  const config = getPayFastConfig();
  const calculatedSignature = generateSignature(data, config.passphrase);
  return calculatedSignature === signature;
}
