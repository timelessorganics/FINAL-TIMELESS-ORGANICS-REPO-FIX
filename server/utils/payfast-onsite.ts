import axios from "axios";
import https from "https";
import { getPayFastConfig, generateSignature, createPaymentData } from "./payfast.js";

// Force SSL bypass for PayFast in production environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
  dataForSignature['payment_method'] = 'card';

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
    // Some hosting environments (Railway, Heroku) have SSL cert verification issues
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    };

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
    if (error.response) {
      console.error('[PayFast Onsite] Response status:', error.response.status);
      console.error('[PayFast Onsite] Response data:', error.response.data);
    }
    throw new Error('Failed to generate PayFast payment identifier: ' + error.message);
  }
}
