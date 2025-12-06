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

// PayFast server IPs for ITN validation
const PAYFAST_IPS = [
  '197.97.145.144',
  '197.97.145.145',
  '197.97.145.146',
  '197.97.145.147',
  '197.97.145.148'
];

export function getPayFastConfig(): PayFastConfig {
  const mode = (process.env.PAYFAST_MODE as 'sandbox' | 'production' | 'live');
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  
  if (!merchantId || !merchantKey || !passphrase || !mode) {
    throw new Error(
      'PayFast configuration missing. Required: PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, PAYFAST_MODE'
    );
  }
  
  if (mode === 'sandbox') {
    console.warn('[PayFast Config] WARNING: Sandbox mode does not support Onsite Payments!');
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
    : 'https://www.payfast.co.za/eng/process';
}

export function generateSignature(
  data: Record<string, string>, 
  passphrase?: string, 
  skipEmptyFields: boolean = true
): string {
  const fieldOrder = [
    'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
    'name_first', 'name_last', 'email_address', 'cell_number',
    'm_payment_id', 'amount', 'item_name', 'item_description',
    'custom_int1', 'custom_int2', 'custom_int3', 'custom_int4', 'custom_int5',
    'custom_str1', 'custom_str2', 'custom_str3', 'custom_str4', 'custom_str5',
    'email_confirmation', 'confirmation_address', 'payment_method'
  ];
  
  let paramString = '';
  
  for (const key of fieldOrder) {
    const value = data[key];
    
    if (key === 'signature' || key === 'passphrase') continue;
    
    if (skipEmptyFields && (!value || value === '')) continue;
    
    const encodedValue = encodeURIComponent((value || '').trim()).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  for (const key of Object.keys(data)) {
    if (fieldOrder.includes(key) || key === 'signature' || key === 'passphrase') continue;
    const value = data[key];
    if (skipEmptyFields && (!value || value === '')) continue;
    const encodedValue = encodeURIComponent((value || '').trim()).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  paramString = paramString.slice(0, -1);
  
  console.log('[PayFast] Building signature using FIELD ORDER');
  console.log('[PayFast] Param string (first 100 chars):', paramString.substring(0, 100));
  
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
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
  
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.timeless.organic';
  const backendUrl = process.env.BACKEND_URL;
  
  if (!backendUrl) {
    throw new Error("[PayFast] BACKEND_URL is not set. Set it to your Railway URL.");
  }
  
  console.log('[PayFast] Frontend URL:', frontendUrl);
  console.log('[PayFast] Backend URL:', backendUrl);
  
  const paymentRef = purchaseId.replace(/-/g, '');
  
  if (paymentRef.length > 32) {
    throw new Error(`PayFast m_payment_id too long: ${paymentRef.length} chars (max 32)`);
  }

  const data: PaymentData = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${frontendUrl}/payment/success`,
    cancel_url: `${frontendUrl}/payment/cancel`,
    notify_url: `${backendUrl}/api/payfast/notify`,
    name_first: firstName,
    email_address: email,
    m_payment_id: paymentRef,
    amount: (amount / 100).toFixed(2),
    item_name: seatType === 'founder' ? 'Founders Pass' : 'Patron Gift Card',
    item_description: `Timeless Organics ${seatType === 'founder' ? 'Founder' : 'Patron'} Seat`,
  };

  return data;
}

export function verifyPayFastSignature(
  data: Record<string, string>, 
  signature: string
): boolean {
  const config = getPayFastConfig();
  
  // Sort alphabetically for ITN verification
  const sortedKeys = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort();
  
  let paramString = '';
  for (const key of sortedKeys) {
    const raw = data[key];

    // FIXED: Skip undefined AND empty strings for ITN
    if (raw === undefined || raw === '') continue;

    const value = String(raw); // Safer type coercion
    const encodedValue = encodeURIComponent(value.trim()).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  paramString = paramString.slice(0, -1);
  
  if (config.passphrase) {
    paramString += `&passphrase=${encodeURIComponent(config.passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  console.log('[PayFast ITN] Verifying with alphabetical order');
  console.log('[PayFast ITN] Param string (first 100 chars):', paramString.substring(0, 100));
  
  const calculatedSignature = crypto.createHash('md5').update(paramString).digest('hex');
  
  console.log('[PayFast ITN] Expected signature:', signature);
  console.log('[PayFast ITN] Calculated signature:', calculatedSignature);
  
  const isValid = calculatedSignature === signature;
  
  if (!isValid) {
    console.error('[PayFast ITN] Signature mismatch!');
  } else {
    console.log('[PayFast ITN] Signature verified ✓');
  }
  
  return isValid;
}

// NEW: Validate PayFast server IP
export function isValidPayFastIP(ip: string): boolean {
  // Extract IP from potential X-Forwarded-For format
  const clientIp = ip.split(',')[0].trim();
  const isValid = PAYFAST_IPS.includes(clientIp);
  
  if (!isValid) {
    console.warn(`[PayFast ITN] Invalid IP: ${clientIp}`);
  }
  
  return isValid;
}

// NEW: Validate payment status
export function isSuccessfulPayment(paymentStatus: string): boolean {
  return paymentStatus === 'COMPLETE';
}

// NEW: Confirm payment with PayFast API
export async function validatePaymentWithPayFast(
  pfData: Record<string, string>
): Promise<boolean> {
  const config = getPayFastConfig();
  const validationUrl = config.mode === 'sandbox'
    ? 'https://sandbox.payfast.co.za/eng/query/validate'
    : 'https://www.payfast.co.za/eng/query/validate';
  
  // Build param string (same format as signature, without passphrase)
  const paramString = Object.keys(pfData)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => {
      const value = String(pfData[key] || '');
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  try {
    console.log('[PayFast] Validating with API:', validationUrl);
    
    const response = await fetch(validationUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Timeless-Organics/1.0'
      },
      body: paramString
    });
    
    const result = await response.text();
    const isValid = result.trim() === 'VALID';
    
    console.log('[PayFast] API validation result:', result, '→', isValid ? '✓' : '✗');
    
    return isValid;
  } catch (error) {
    console.error('[PayFast] Validation API error:', error);
    return false;
  }
}

// NEW: Complete ITN validation workflow
export async function validateITN(
  pfData: Record<string, string>,
  signature: string,
  clientIp: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Step 1: Verify IP
  if (!isValidPayFastIP(clientIp)) {
    errors.push(`Invalid source IP: ${clientIp}`);
  }
  
  // Step 2: Verify signature
  if (!verifyPayFastSignature(pfData, signature)) {
    errors.push('Signature verification failed');
  }
  
  // Step 3: Verify payment status
  if (!isSuccessfulPayment(pfData.payment_status || '')) {
    errors.push(`Payment not complete: ${pfData.payment_status}`);
  }
  
  // Step 4: Validate with PayFast API
  const apiValid = await validatePaymentWithPayFast(pfData);
  if (!apiValid) {
    errors.push('PayFast API validation failed');
  }
  
  const valid = errors.length === 0;
  
  if (valid) {
    console.log('[PayFast ITN] All validation checks passed ✓');
  } else {
    console.error('[PayFast ITN] Validation failed:', errors);
  }
  
  return { valid, errors };
}
