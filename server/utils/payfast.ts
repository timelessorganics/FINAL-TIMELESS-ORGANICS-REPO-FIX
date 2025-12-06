import crypto from "crypto";

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: 'sandbox' | 'production' | 'live';
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
  // CRITICAL: PayFast Onsite Payments require production/live mode and credentials
  // Sandbox mode is NOT supported for onsite payments
  const mode = (process.env.PAYFAST_MODE as 'sandbox' | 'production' | 'live');
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  
  // Enforce required configuration
  if (!merchantId || !merchantKey || !passphrase || !mode) {
    throw new Error(
      'PayFast configuration missing. Required: PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_MODE'
    );
  }
  
  if (mode === 'sandbox') {
    console.warn('[PayFast Config] WARNING: Sandbox mode does not support Onsite Payments!');
    console.warn('[PayFast Config] Set PAYFAST_MODE=production or PAYFAST_MODE=live for real transactions.');
  }
  
  const config: PayFastConfig = {
    merchantId,
    merchantKey,
    passphrase,
    mode,
  };
  
  console.log(`[PayFast Config] Mode: ${config.mode}, Merchant ID: ${config.merchantId.substring(0, 4)}****`);
  
  return config;
}

export function generatePayFastUrl(): string {
  const config = getPayFastConfig();
  return config.mode === 'sandbox'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'; // production and live both use live endpoint
}

export function generateSignature(data: Record<string, string>, passphrase?: string, skipEmptyFields: boolean = true): string {
  // CRITICAL: PayFast CUSTOM INTEGRATION (simple form) uses FIELD ORDER, NOT alphabetical
  // Reference: https://developers.payfast.co.za/docs#step_2_signature
  // Quote: "The pairs must be listed in the order in which they appear in the attributes description"
  // Quote: "*Do not use the API signature format, which uses alphabetical ordering!*"
  // For webhooks (ITN): skipEmptyFields=false (include all fields PayFast sends)
  // For payment forms: skipEmptyFields=true (skip empty/blank fields)
  
  // Preserve the correct field order from PayFast documentation (NOT alphabetical)
  const fieldOrder = [
    'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
    'name_first', 'name_last', 'email_address', 'cell_number',
    'm_payment_id', 'amount', 'item_name', 'item_description',
    'custom_int1', 'custom_int2', 'custom_int3', 'custom_int4', 'custom_int5',
    'custom_str1', 'custom_str2', 'custom_str3', 'custom_str4', 'custom_str5',
    'email_confirmation', 'confirmation_address', 'payment_method'
  ];
  
  let paramString = '';
  
  // Build parameter string using PayFast field order
  for (const key of fieldOrder) {
    const value = data[key];
    
    // Skip signature and passphrase fields (passphrase is appended separately at the end)
    if (key === 'signature' || key === 'passphrase') continue;
    
    // For payment forms, skip empty fields. For webhooks, include them.
    if (skipEmptyFields && (!value || value === '')) continue;
    
    // URL encode and replace %20 with + as per PayFast spec
    const encodedValue = encodeURIComponent((value || '').trim()).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  // Also add any extra fields not in the standard list (for future extensibility)
  for (const key of Object.keys(data)) {
    if (fieldOrder.includes(key) || key === 'signature' || key === 'passphrase') continue;
    const value = data[key];
    if (skipEmptyFields && (!value || value === '')) continue;
    const encodedValue = encodeURIComponent((value || '').trim()).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  // Remove trailing ampersand
  paramString = paramString.slice(0, -1);
  
  // SECURITY: Log BEFORE adding passphrase
  console.log('[PayFast] Building signature using FIELD ORDER (not alphabetical) for merchant:', data.merchant_id?.substring(0, 4) + '****');
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
  
  // Frontend URL for user redirects (return/cancel)
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.timeless.organic';
  
  // Backend URL for PayFast webhook notifications
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
  throw new Error("[PayFast] BACKEND_URL is not set. Set it to your Railway URL.");
}
  
  console.log('[PayFast] Frontend URL (return/cancel):', frontendUrl);
  console.log('[PayFast] Backend URL (notify webhook):', backendUrl);

  // CRITICAL: PayFast m_payment_id has 32-character limit
  // Strip hyphens from UUID (36 chars → 32 chars)
  const paymentRef = purchaseId.replace(/-/g, '');
  
  if (paymentRef.length > 32) {
    throw new Error(`PayFast m_payment_id too long: ${paymentRef.length} chars (max 32)`);
  }

  // CRITICAL: Order of properties MUST match PayFast documentation exactly
  // This order is used for signature generation - DO NOT REORDER!
  // Reference: https://developers.payfast.co.za/docs#step_2_signature
  const data: PaymentData = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${frontendUrl}/payment/success`,
    cancel_url: `${frontendUrl}/payment/cancel`,
    notify_url: `${backendUrl}/api/payment/notify`,
    name_first: firstName,
    email_address: email,
    m_payment_id: paymentRef,
    amount: (amount / 100).toFixed(2), // Convert cents to rands
    item_name: seatType === 'founder' ? 'Founders Pass' : 'Patron Gift Card',
    item_description: `Timeless Organics ${seatType === 'founder' ? 'Founder' : 'Patron'} Seat`,
  };

  return data;
}

export function verifyPayFastSignature(data: Record<string, string>, signature: string): boolean {
  const config = getPayFastConfig();
  
  // CRITICAL: ITN (webhook) signature uses ALPHABETICAL order, not form order!
  // Reference: https://developers.payfast.co.za/docs#step_4_confirm_payment
  // "Sort the data alphabetically by key before creating the parameter string"
  
  // Get all keys except signature, sort alphabetically
  const sortedKeys = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort();
  
  // Build param string in alphabetical order
  let paramString = '';
  for (const key of sortedKeys) {
    const value = data[key];
    if (value !== undefined && value !== '') {
      // URL encode and replace %20 with + as per PayFast spec
      const encodedValue = encodeURIComponent(value.trim()).replace(/%20/g, '+');
      paramString += `${key}=${encodedValue}&`;
    }
  }
  
  // Remove trailing &
  paramString = paramString.slice(0, -1);
  
  // Add passphrase at the end
  if (config.passphrase) {
    paramString += `&passphrase=${encodeURIComponent(config.passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  console.log('[PayFast ITN] Verifying with alphabetical order');
  console.log('[PayFast ITN] Param string (first 100 chars):', paramString.substring(0, 100));
  
  // Generate MD5 hash
  const calculatedSignature = crypto.createHash('md5').update(paramString).digest('hex');
  
  console.log('[PayFast ITN] Expected signature:', signature);
  console.log('[PayFast ITN] Calculated signature:', calculatedSignature);
  
  const isValid = calculatedSignature === signature;
  
  if (!isValid) {
    console.log('[PayFast ITN] Signature mismatch!');
  } else {
    console.log('[PayFast ITN] Signature verified successfully!');
  }
  
  return isValid;
}
