# PayFast Integration Setup Guide

## 🚨 Current Issue: "Invalid merchant ID" Error

**Problem**: PayFast is rejecting payments with "Invalid merchant ID" error (400 Bad Request).

**Root Cause**: Mismatch between PayFast credentials and mode configuration.

---

## 🔧 Quick Fix Checklist

### Step 1: Verify Your PayFast Credentials

Check the **Secrets** tab in Replit. You should have:

```
PAYFAST_MERCHANT_ID=10043126        # Your actual merchant ID
PAYFAST_MERCHANT_KEY=xxxxxxxx       # Your merchant key
PAYFAST_PASSPHRASE=xxxxxxxx         # Your security passphrase
PAYFAST_MODE=sandbox                # or "production"
```

### Step 2: Confirm Sandbox vs Production Mode

**SANDBOX Mode** (for testing):
- Use PayFast sandbox credentials from https://sandbox.payfast.co.za
- Set `PAYFAST_MODE=sandbox`
- Test merchant ID: `10000100` (default test account)
- Test merchant key: `46f0cd694581a`

**PRODUCTION Mode** (for live payments):
- Use credentials from your actual PayFast account
- Set `PAYFAST_MODE=production`
- Your merchant ID appears to be: `10043126`

### Step 3: Match Credentials to Mode

❌ **COMMON ERROR**: Using production merchant ID with `PAYFAST_MODE=sandbox`

✅ **CORRECT SETUP**:

**Option A - Sandbox Testing:**
```
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn
PAYFAST_MODE=sandbox
```

**Option B - Production (Your Live Account):**
```
PAYFAST_MERCHANT_ID=10043126
PAYFAST_MERCHANT_KEY=[your_actual_key]
PAYFAST_PASSPHRASE=[your_actual_passphrase]
PAYFAST_MODE=production
```

---

## 📊 Debugging: Check What's Being Used

After restarting the workflow, initiate a purchase. Check the logs:

```bash
# Look for this line in the workflow logs:
[PayFast Config] Mode: sandbox, Merchant ID starts with: 1000****
```

This tells you:
1. What mode is active (`sandbox` or `production`)
2. First 4 digits of merchant ID being used

**If you see `1000****`** → Using sandbox test credentials
**If you see `1004****`** → Using your production credentials (`10043126`)

---

## 🧪 Testing Payment Flow

### Sandbox Testing (Recommended First)

1. **Set sandbox credentials** (see Option A above)
2. **Restart workflow**
3. **Sign in** to the site
4. **Click "Invest Now"**
5. **You'll be redirected to PayFast sandbox**
6. **Use test credit card**:
   - Card Number: `5200000000000015`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Production Testing

⚠️ **WARNING**: This charges real money!

1. **Set production credentials** (see Option B above)
2. **Restart workflow**
3. **Test with small amount** (modify seat price temporarily if needed)
4. **Use real payment method**

---

## 🔍 What Happens After Payment?

### Success Flow:
1. ✅ User pays on PayFast
2. ✅ PayFast sends webhook to `/api/payment/notify`
3. ✅ Backend updates purchase status to "completed"
4. ✅ Backend generates 3 codes:
   - Bronze claim code (`BR-XXXX-XXXX`)
   - Workshop voucher (`FO-50-XXXX-XXXX` or `PA-80-XXXX-XXXX`)
   - Lifetime workshop code (`LF-20-XXXX-XXXX` or `LP-30-XXXX-XXXX`)
5. ✅ PDF certificate generated
6. ✅ Email sent with all codes and certificate
7. ✅ User redirected to `/payment/success`
8. ✅ Dashboard shows completed purchase with codes

### Cancel Flow:
- User clicks "Cancel" on PayFast
- Redirected to `/payment/cancel`
- Purchase remains "pending" in database

---

## 🎫 Voucher Code System

### Bronze Claim Code
- **Format**: `BR-XXXX-XXXX`
- **Purpose**: Claim your guaranteed bronze casting
- **Applies To**: Any specimen selection
- **One-time use**: Redeemed when selecting cutting

### Workshop Voucher (One-Time)
- **Format**: `FO-50-XXXX-XXXX` (Founder) or `PA-80-XXXX-XXXX` (Patron)
- **Discount**: 50% (Founder) or 80% (Patron)
- **Applies To**: **Workshops only** (NOT seat purchases)
- **Transferable**: Yes
- **Usage**: First 2-day workshop attendance only
- **Redemption**: On future main website booking system

### Lifetime Workshop Code (Unlimited)
- **Format**: `LF-20-XXXX-XXXX` (Founder) or `LP-30-XXXX-XXXX` (Patron)
- **Discount**: 20% (Founder) or 30% (Patron)
- **Applies To**: **Workshops only** (NOT seat purchases)
- **Transferable**: Yes
- **Usage**: Unlimited for life
- **Unique per user**: Each investor gets their own code
- **Redemption**: On future main website booking system

---

## 🚀 Future Main Website Integration

### Code Redemption API (To Be Built)

When you build the main Timeless Organics website, you'll need endpoints:

```typescript
// Verify code validity and discount
POST /api/verify-code
{
  "code": "FO-50-ABCD-1234",
  "appliesTo": "workshop"  // or "seat" or "any"
}
Response: {
  "valid": true,
  "discount": 50,
  "type": "workshop_voucher",
  "remainingUses": 1
}

// Apply code to booking
POST /api/apply-code
{
  "code": "FO-50-ABCD-1234",
  "bookingId": "uuid",
  "userId": "replit-user-id"
}
Response: {
  "success": true,
  "discountApplied": 2500,  // in cents
  "newTotal": 2500
}
```

### Database Tables Already Set Up

The `codes` table tracks:
- `redemptionCount`: How many times used
- `maxRedemptions`: Max uses allowed
- `redeemedBy`: Array of user IDs who used it
- `lastRedeemedAt`: Timestamp of last use
- `appliesTo`: Enum (`workshop`, `seat`, `any`)

---

## 📝 Summary

**To fix your current issue:**

1. **Check Secrets** → Verify `PAYFAST_MERCHANT_ID` and `PAYFAST_MODE` match
2. **Restart workflow** → Let PayFast config reload
3. **Test payment** → Try again with correct credentials
4. **Check logs** → Look for `[PayFast Config]` line to confirm settings

**Next steps after fixing:**
- Complete end-to-end payment test
- Verify code generation
- Test certificate download
- Document voucher redemption for main website

---

## 🆘 Still Having Issues?

If you continue to see "Invalid merchant ID":

1. Double-check merchant ID is exactly as shown in PayFast dashboard
2. Verify passphrase matches (case-sensitive)
3. Confirm mode is set correctly (`sandbox` or `production`)
4. Try deleting and re-adding the secrets
5. Contact PayFast support to verify account status
