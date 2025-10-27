# PayFast Credentials Setup - No More Manual Swapping!

## 🎯 The Solution

You now have **TWO separate sets of credentials** configured:
- **Sandbox credentials** (for testing)
- **Production credentials** (for live payments)

**Simply change `PAYFAST_MODE` to switch between them!** No more manual credential swapping! 🎉

---

## 📝 Configure Your Secrets (One-Time Setup)

### **Step 1: Add Sandbox Credentials**

Click "Secrets" (🔒) in Replit, add these:

```
PAYFAST_SANDBOX_MERCHANT_ID     →    10043126
PAYFAST_SANDBOX_MERCHANT_KEY    →    tqjx0xk2w4hqe  
PAYFAST_SANDBOX_PASSPHRASE      →    DavidjunorTimeorg123
```

### **Step 2: Add Production Credentials** (when ready for live payments)

```
PAYFAST_PRODUCTION_MERCHANT_ID     →    [your_live_merchant_id]
PAYFAST_PRODUCTION_MERCHANT_KEY    →    [your_live_merchant_key]  
PAYFAST_PRODUCTION_PASSPHRASE      →    [your_live_passphrase]
```

### **Step 3: Set Mode**

```
PAYFAST_MODE    →    sandbox    (or "production" when going live)
```

---

## 🔄 Switching Between Sandbox and Production

**For Testing:**
```
PAYFAST_MODE = sandbox
```
→ Uses `PAYFAST_SANDBOX_*` credentials automatically

**For Live Payments:**
```
PAYFAST_MODE = production  
```
→ Uses `PAYFAST_PRODUCTION_*` credentials automatically

**That's it!** Change one variable, refresh browser, done! ✅

---

## 📊 What Happens Now

The system automatically:

1. ✅ Reads `PAYFAST_MODE`
2. ✅ Selects correct credentials (sandbox or production)
3. ✅ Uses correct PayFast URL:
   - Sandbox: `https://sandbox.payfast.co.za/eng/process`
   - Production: `https://www.payfast.co.za/eng/process`
4. ✅ Logs which mode and merchant ID is active

---

## 🧪 Test Now with Sandbox

1. **Secrets are already configured** (I set sandbox as default)
2. **Restart workflow** (refresh your browser)
3. **Sign in** and click "Invest Now"
4. **You'll be redirected to PayFast sandbox**
5. **Use test card**: `5200000000000015`

---

## 🔍 Verify Configuration

After restarting, check the logs for:

```
[PayFast Config] Mode: sandbox, Merchant ID: 10043126
```

This confirms:
- ✅ Mode is set correctly
- ✅ Correct merchant ID is being used
- ✅ No more guessing which credentials are active!

---

## 🚀 Going Live Checklist

When ready for production:

1. ✅ Get production credentials from PayFast account
2. ✅ Add them as `PAYFAST_PRODUCTION_*` secrets
3. ✅ Change `PAYFAST_MODE` to `production`
4. ✅ Restart workflow
5. ✅ Verify logs show production merchant ID
6. ✅ Test with small real payment first

---

## 🎓 Technical Details (How It Works)

### Old Way (Manual Swapping) ❌
```typescript
// Had to manually change these every time!
PAYFAST_MERCHANT_ID = 10043126  // sandbox
PAYFAST_MERCHANT_ID = 10xxxxxx  // production (manual swap)
```

### New Way (Automatic Selection) ✅
```typescript
// Code automatically selects based on mode
const sandboxConfig = {
  merchantId: process.env.PAYFAST_SANDBOX_MERCHANT_ID,
  // ...
};

const productionConfig = {
  merchantId: process.env.PAYFAST_PRODUCTION_MERCHANT_ID,
  // ...
};

const config = mode === 'sandbox' ? sandboxConfig : productionConfig;
```

---

## 📚 PayFast Documentation References

- **Custom Integration**: https://developers.payfast.co.za/docs#quickstart
- **Signature Generation**: https://developers.payfast.co.za/docs#step_2_signature  
- **Sandbox Testing**: https://developers.payfast.co.za/docs#sandbox

### Important Note on Signatures

- **Payment Form Signature**: Uses order fields appear in documentation
- **API Call Signature**: Uses alphabetical order

The code now correctly implements the payment form signature (insertion order), not the API signature!

---

## ✅ Current Status

Your sandbox credentials are configured and ready to test:
- Merchant ID: `10043126`
- Merchant Key: `tqjx0xk2w4hqe`
- Passphrase: `DavidjunorTimeorg123`
- Mode: `sandbox`

**No production credentials set yet** - add them when you're ready to go live!
