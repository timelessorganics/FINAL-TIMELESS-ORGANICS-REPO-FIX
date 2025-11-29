import axios from "axios";
import https from "https";
import { getPayFastConfig, generateSignature, createPaymentData } from "./payfast.js";

// NOTE: TLS verification bypass is scoped to PayFast axios agent only (see httpsAgent config below)
// We do NOT set NODE_TLS_REJECT_UNAUTHORIZED globally as that would affect all HTTPS traffic

/**
 * Generate PayFast Payment Identifier (UUID) for Onsite Payments
 * This UUID is used to open the PayFast modal on the client side
 * 
 * @param userIp - User's IP address (REQUIRED by PayFast Onsite API)
 * @param userAgent - User's browser user-agent (REQUIRED by PayFast Onsite API)
 */
export async function generatePaymentIdentifier(
  purchaseId: string,
  amount: number,
  seatType: 'founder' | 'patron',
  email: string,
  firstName: string,
  userIp: string,
  userAgent: string
): Promise<string> {
  const config = getPayFastConfig();
  
  // Create payment data using existing function
  const paymentData = createPaymentData(
    purchaseId,
    amount,
    seatType,
    email,
    firstName
  );

  // Convert PaymentData to Record<string, string> and ADD user context BEFORE signing
  const dataForSignature: Record<string, string> = {};
  Object.keys(paymentData).forEach(key => {
    const value = paymentData[key as keyof typeof paymentData];
    if (value !== undefined) {
      dataForSignature[key] = value;
    }
  });
  
  // ADD PayFast Onsite REQUIRED fields to signature payload
  dataForSignature['user_ip'] = userIp;
  dataForSignature['user_agent'] = userAgent;
  dataForSignature['payment_method'] = 'cc';

  // Generate signature with ALL fields (including user context)
  const signature = generateSignature(dataForSignature, config.passphrase);

  // Final payload with signature
  const dataWithSignature = {
    ...dataForSignature,
    signature,
  };

  console.log('[PayFast Onsite] Generating payment identifier for purchase:', purchaseId);
  console.log('[PayFast Onsite] Amount:', amount, 'Seat Type:', seatType);
  console.log('[PayFast Onsite] User context:', { ip: userIp, agent: userAgent.substring(0, 50) });

  try {
    // Convert to URL-encoded format
    const params = new URLSearchParams();
    Object.keys(dataWithSignature).forEach(key => {
      const value = dataWithSignature[key as keyof typeof dataWithSignature];
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    // Call PayFast Onsite API to generate UUID
    // IMPORTANT: PayFast Onsite Payments ONLY work with production credentials
    // Sandbox mode does not support onsite payments - always use production endpoint
    const onsiteUrl = 'https://www.payfast.co.za/onsite/process';

    console.log('[PayFast Onsite] Making request to:', onsiteUrl);
    console.log('[PayFast Onsite] NOTE: Onsite payments require production credentials (sandbox not supported)');
    console.log('[PayFast Onsite] Merchant ID:', config.merchantId);
    console.log('[PayFast Onsite] Payment Data Keys:', Object.keys(dataWithSignature));
    console.log('[PayFast Onsite] Signature (first 20 chars):', signature.substring(0, 20) + '...');
    console.log('[PayFast Onsite] Full request body:', params.toString().substring(0, 200) + '...');

    // Configure axios with custom HTTPS agent to handle SSL
    // PayFast's SSL certificates can cause issues in some hosting environments
    // IMPORTANT: This TLS bypass is SCOPED to this specific request only (not global)
    // Only enabled explicitly via PAYFAST_ALLOW_INSECURE_TLS env var
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: process.env.PAYFAST_ALLOW_INSECURE_TLS !== 'true',
      }),
      timeout: 10000,
    };
    
    if (process.env.PAYFAST_ALLOW_INSECURE_TLS === 'true') {
      console.warn('[PayFast] INSECURE: TLS verification disabled for this request (PAYFAST_ALLOW_INSECURE_TLS=true)');
    }

    const response = await axios.post(
      onsiteUrl,
      params.toString(),
      axiosConfig
    );

    // PayFast returns the UUID as text or in response.data.uuid
    const uuid = typeof response.data === 'string' ? response.data.trim() : response.data.uuid;

    if (!uuid) {
      throw new Error('PayFast did not return a payment identifier');
    }

    console.log('[PayFast Onsite] Successfully generated UUID:', uuid.substring(0, 8) + '...');
    return uuid;

  } catch (error: any) {
    console.error('[PayFast Onsite] Error generating payment identifier:', error.message);
    
    // Enhanced error logging to capture the actual PayFast error response
    let errorDetail = error.message;
    if (error.response) {
      console.error('[PayFast Onsite] Response status:', error.response.status);
      console.error('[PayFast Onsite] Response headers:', JSON.stringify(error.response.headers));
      console.error('[PayFast Onsite] Response data:', JSON.stringify(error.response.data));
      
      // Extract actual PayFast error message from response
      const pfError = error.response.data;
      if (typeof pfError === 'string') {
        errorDetail = `PayFast error (${error.response.status}): ${pfError}`;
      } else if (pfError && typeof pfError === 'object') {
        errorDetail = `PayFast error (${error.response.status}): ${JSON.stringify(pfError)}`;
      } else {
        errorDetail = `PayFast rejected request with status ${error.response.status}`;
      }
      
      // Common 400 error causes
      if (error.response.status === 400) {
        console.error('[PayFast Onsite] 400 Error - Common causes:');
        console.error('  1. Passphrase mismatch (check PAYFAST_PASSPHRASE matches PayFast dashboard EXACTLY)');
        console.error('  2. Invalid merchant credentials (PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY)');
        console.error('  3. Signature calculation error');
        console.error('  4. Invalid return_url, cancel_url, or notify_url');
      }
    }
    
    if (error.request) {
      console.error('[PayFast Onsite] Request was made but no response received');
    }
    
    throw new Error('Failed to generate PayFast payment identifier: ' + errorDetail);
  }
}
