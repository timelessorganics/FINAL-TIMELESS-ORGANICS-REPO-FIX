import axios from "axios";
import { getPayFastConfig, generateSignature, createPaymentData } from "./payfast.js";

/**
 * Generate PayFast Payment Identifier (UUID) for Onsite Payments
 * This UUID is used to open the PayFast modal on the client side
 */
export async function generatePaymentIdentifier(
  purchaseId: string,
  amount: number,
  seatType: 'founder' | 'patron',
  email: string,
  firstName: string
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

  // Convert PaymentData to Record<string, string> for signature generation
  const dataForSignature: Record<string, string> = {};
  Object.keys(paymentData).forEach(key => {
    const value = paymentData[key as keyof typeof paymentData];
    if (value !== undefined) {
      dataForSignature[key] = value;
    }
  });

  // Generate signature
  const signature = generateSignature(dataForSignature, config.passphrase);

  // Add signature to payment data
  const dataWithSignature = {
    ...paymentData,
    signature,
  };

  console.log('[PayFast Onsite] Generating payment identifier for purchase:', purchaseId);
  console.log('[PayFast Onsite] Amount:', amount, 'Seat Type:', seatType);

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

    const response = await axios.post(
      onsiteUrl,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 second timeout
      }
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
