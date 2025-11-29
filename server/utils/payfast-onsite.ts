import axios from "axios";
import https from "https";
import { getPayFastConfig, createPaymentData, generateSignature } from "./payfast.js";

/**
 * Generate PayFast Payment Identifier (UUID) for Onsite Payments
 * This UUID is used to open the PayFast modal on the client side
 * 
 * CRITICAL: Uses FIELD ORDER signature generation (same as HTML forms)
 * Reference: https://developers.payfast.co.za/docs#step_2_signature
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

  // Convert PaymentData to Record<string, string>
  const dataForSignature: Record<string, string> = {};
  Object.keys(paymentData).forEach(key => {
    const value = paymentData[key as keyof typeof paymentData];
    if (value !== undefined) {
      dataForSignature[key] = value;
    }
  });
  
  // ADD PayFast Onsite REQUIRED fields
  dataForSignature['user_ip'] = userIp;
  dataForSignature['user_agent'] = userAgent;
  dataForSignature['payment_method'] = 'cc';

  // Generate signature using FIELD ORDER (same as HTML forms, NOT alphabetical)
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
    // Sandbox mode does not support onsite payments
    const onsiteUrl = 'https://www.payfast.co.za/onsite/process';

    console.log('[PayFast Onsite] Making request to:', onsiteUrl);
    console.log('[PayFast Onsite] Merchant ID:', config.merchantId);
    console.log('[PayFast Onsite] Request body keys:', Object.keys(dataWithSignature));

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
      console.warn('[PayFast] INSECURE: TLS verification disabled (PAYFAST_ALLOW_INSECURE_TLS=true)');
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
    
    let errorDetail = error.message;
    if (error.response) {
      console.error('[PayFast Onsite] Response status:', error.response.status);
      console.error('[PayFast Onsite] Response data:', JSON.stringify(error.response.data));
      
      const pfError = error.response.data;
      if (typeof pfError === 'string') {
        errorDetail = `PayFast error (${error.response.status}): ${pfError}`;
      } else if (pfError && typeof pfError === 'object') {
        errorDetail = `PayFast error (${error.response.status}): ${JSON.stringify(pfError)}`;
      } else {
        errorDetail = `PayFast rejected request with status ${error.response.status}`;
      }
      
      if (error.response.status === 400) {
        console.error('[PayFast Onsite] 400 Error - Check:');
        console.error('  - PAYFAST_PASSPHRASE matches PayFast dashboard EXACTLY');
        console.error('  - PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY are correct');
        console.error('  - Signature calculation (alphabetical sorting per API spec)');
        console.error('  - All required fields are present and properly formatted');
      }
    }
    
    throw new Error('Failed to generate PayFast payment identifier: ' + errorDetail);
  }
}
