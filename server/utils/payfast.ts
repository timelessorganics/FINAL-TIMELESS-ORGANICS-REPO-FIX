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
  
  // Sandbox credentials (PayFast test account)
  const sandboxConfig = {
    merchantId: process.env.PAYFAST_SANDBOX_MERCHANT_ID || '10043126',
    merchantKey: process.env.PAYFAST_SANDBOX_MERCHANT_KEY || 'tqjx0xk2w4hqe',
    passphrase: process.env.PAYFAST_SANDBOX_PASSPHRASE || 'DavidjunorTimeorg123',
  };
  
  // Production credentials (your live PayFast account)
  const productionConfig = {
    merchantId: process.env.PAYFAST_PRODUCTION_MERCHANT_ID || '',
    merchantKey: process.env.PAYFAST_PRODUCTION_MERCHANT_KEY || '',
    passphrase: process.env.PAYFAST_PRODUCTION_PASSPHRASE || '',
  };
  
  // Select config based on mode
  const selectedConfig = mode === 'sandbox' ? sandboxConfig : productionConfig;
  
  const config = {
    ...selectedConfig,
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

export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // CRITICAL: PayFast PHP example uses foreach($data as $key => $val) which preserves insertion order
  // JavaScript objects maintain insertion order as of ES2015+
  // Reference: https://developers.payfast.co.za/docs#step_2_signature
  
  let paramString = '';
  
  // Build parameter string - skip empty values and signature field
  for (const key in data) {
    const value = data[key];
    if (value && value !== '' && key !== 'signature') {
      // URL encode and replace %20 with + as per PayFast spec
      const encodedValue = encodeURIComponent(value.trim()).replace(/%20/g, '+');
      paramString += `${key}=${encodedValue}&`;
    }
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
  const baseUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

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
  const calculatedSignature = generateSignature(data, config.passphrase);
  return calculatedSignature === signature;
}
