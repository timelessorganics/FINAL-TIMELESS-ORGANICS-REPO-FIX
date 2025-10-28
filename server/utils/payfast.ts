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
  const mode = (process.env.PAYFAST_MODE as 'sandbox' | 'production') || 'sandbox';
  
  // Use the credentials from environment secrets
  const config: PayFastConfig = {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '10043126',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || 'tqjx0xk2w4hqe',
    passphrase: process.env.PAYFAST_PASSPHRASE || 'DavidjunorTimeorg123',
    mode,
  };
  
  console.log(`[PayFast Config] Mode: ${config.mode}, Merchant ID: ${config.merchantId}`);
  
  return config;
}

export function generatePayFastUrl(): string {
  const config = getPayFastConfig();
  return config.mode === 'sandbox'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

export function generateSignature(data: Record<string, string>, passphrase?: string, skipEmptyFields: boolean = true): string {
  // CRITICAL: PayFast PHP example uses foreach($data as $key => $val) which preserves insertion order
  // JavaScript objects maintain insertion order as of ES2015+
  // Reference: https://developers.payfast.co.za/docs#step_2_signature
  // For webhooks: skipEmptyFields=false (include all fields PayFast sends)
  // For payment forms: skipEmptyFields=true (skip empty/blank fields)
  
  let paramString = '';
  
  // Build parameter string
  for (const key in data) {
    const value = data[key];
    
    // Skip signature field always
    if (key === 'signature') continue;
    
    // For payment forms, skip empty fields. For webhooks, include them.
    if (skipEmptyFields && (!value || value === '')) continue;
    
    // URL encode and replace %20 with + as per PayFast spec
    const encodedValue = encodeURIComponent((value || '').trim()).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  // Remove trailing ampersand
  paramString = paramString.slice(0, -1);
  
  // SECURITY: Log BEFORE adding passphrase
  console.log('[PayFast] Building signature for merchant:', data.merchant_id?.substring(0, 4) + '****');
  console.log('[PayFast] Param string (first 100 chars):', paramString.substring(0, 100));
  
  // Append passphrase to end
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  // Generate MD5 hash
  const signature = crypto.createHash('md5').update(paramString).digest('hex');
  console.log('[PayFast] Generated signature:', signature);
  
  return signature;
}

export function createPaymentData(
  purchaseId: string,
  amount: number,
  seatType: 'founder' | 'patron',
  email: string,
  firstName: string
): PaymentData {
  const config = getPayFastConfig();
  // Use BACKEND_URL for production (Railway), REPLIT_DOMAINS for Replit dev, fallback to localhost
  const baseUrl = process.env.BACKEND_URL
    || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null)
    || 'http://localhost:5000';
  
  console.log('[PayFast] Using base URL:', baseUrl);

  // CRITICAL: Order of properties MUST match PayFast documentation exactly
  // This order is used for signature generation - DO NOT REORDER!
  // Reference: https://developers.payfast.co.za/docs#step_2_signature
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
  // For webhook verification, include ALL fields (even empty ones)
  const calculatedSignature = generateSignature(data, config.passphrase, false);
  const isValid = calculatedSignature === signature;
  
  if (!isValid) {
    console.log('[PayFast] Signature mismatch!');
    console.log('[PayFast] Expected:', signature);
    console.log('[PayFast] Calculated:', calculatedSignature);
  }
  
  return isValid;
}
