# 🚀 Quick Fix Guide - Get Your Deployment Working NOW

Based on the diagnostic, here are the **most common issues** and how to fix them:

---

## 🔥 Issue #1: Environment Variables Not Configured

### The Problem
Your app needs environment variables (secrets) in 3 different places:
1. **Replit** (for local development)
2. **Railway** (for backend production)
3. **Netlify** (for frontend production)

### The Fix

#### Step 1: Set Up Replit Secrets (For Local Development)

1. Click the **🔒 Secrets** tab in Replit (left sidebar)
2. Add these secrets one by one:

```
DATABASE_URL = postgresql://user:pass@host:6543/postgres?pgbouncer=true
SESSION_SECRET = generate-a-random-string-here-min-32-chars
PAYFAST_MERCHANT_ID = 10000100
PAYFAST_MERCHANT_KEY = 46f0cd694581a
PAYFAST_PASSPHRASE = jt7NOE43FZPn
PAYFAST_MODE = sandbox
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

**To get your Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → Database → Connection String (URI, Pooled)
4. Copy the connection string for `DATABASE_URL`
5. Go to Settings → API → Project API keys
6. Copy `service_role` key for `SUPABASE_SERVICE_ROLE_KEY`
7. Copy `URL` for `SUPABASE_URL`

**To generate a secure SESSION_SECRET:**
```bash
# Run in Replit shell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Restart your Replit** after adding secrets

#### Step 2: Set Up Railway Environment Variables

1. Go to https://railway.app
2. Select your project
3. Click **Variables** tab
4. Add the SAME variables as above, but:
   - For production, use **production PayFast credentials** instead of sandbox:
   ```
   PAYFAST_MERCHANT_ID = 10043126  (your actual merchant ID)
   PAYFAST_MERCHANT_KEY = your-actual-key
   PAYFAST_PASSPHRASE = your-actual-passphrase
   PAYFAST_MODE = production
   ```
   - Generate a NEW SESSION_SECRET for production (don't reuse dev secret)
   - Add these Railway-specific vars:
   ```
   NODE_ENV = production
   PORT = (Railway sets this automatically, don't add manually)
   ```

5. **Redeploy** after adding variables (Railway → Deployments → Redeploy)

#### Step 3: Set Up Netlify Environment Variables

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add ONE variable:
   ```
   VITE_API_URL = https://your-railway-app.railway.app
   ```
   (Replace with your actual Railway URL)

5. **Redeploy** (Deploys → Trigger deploy → Clear cache and deploy)

---

## 🔥 Issue #2: PayFast "Invalid Merchant ID" Error

### The Problem
PayFast credentials don't match the mode (sandbox vs production).

### The Fix

**For Testing (Sandbox Mode):**
```bash
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn
PAYFAST_MODE=sandbox
```

**For Live Payments (Production Mode):**
```bash
PAYFAST_MERCHANT_ID=10043126  # Your actual merchant ID
PAYFAST_MERCHANT_KEY=your-actual-key  # From PayFast dashboard
PAYFAST_PASSPHRASE=your-actual-passphrase  # From PayFast dashboard
PAYFAST_MODE=production
```

**⚠️ CRITICAL:** The credentials MUST match the mode!
- Sandbox merchant ID (10000100) → Use sandbox mode
- Your merchant ID (10043126) → Use production mode

After changing, **restart your server**.

---

## 🔥 Issue #3: Can't Push to GitHub from Replit

### The Problem
Git authentication failing or remote not configured.

### The Fix

**Option 1: Use Replit's Built-in Git (Easiest)**
1. Click the **Version Control** tab in Replit
2. Stage your changes (checkboxes)
3. Add commit message
4. Click **Commit & Push**

**Option 2: Use Helper Script**
```bash
# In Replit Shell:
node upload-to-github.js
```

**Option 3: Manual Git Commands**
```bash
# Set up authentication (one-time):
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# Add changes
git add .
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

If authentication fails, you may need a **GitHub Personal Access Token**:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy the token
5. Use it as password when pushing, or set it in the remote URL:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/timelessorganics/Timeless-Organics-Main-Repository.git
```

---

## 🔥 Issue #4: Railway Build Fails

### The Problem
Build succeeds locally but fails on Railway.

### Common Causes & Fixes

**Cause 1: Missing dependencies**
```bash
# Make sure all deps are in package.json, not just node_modules
npm install --save missing-package-name
git add package.json package-lock.json
git commit -m "fix: Add missing dependency"
git push origin main
```

**Cause 2: TypeScript errors**
```bash
# Check for TypeScript errors locally first:
npm run check

# Fix any errors, then:
git add .
git commit -m "fix: Resolve TypeScript errors"
git push origin main
```

**Cause 3: Build timeout**
- Railway has a 10-minute build timeout
- If your build is slow, optimize by removing unused dependencies

**Check Railway logs:**
1. Railway dashboard → Deployments
2. Click on the failed deployment
3. View logs to see the exact error

---

## 🔥 Issue #5: Railway Deploys but App Crashes

### The Problem
Build succeeds but app crashes on startup.

### Common Causes & Fixes

**Cause 1: Database connection fails**
```bash
# In Railway, check your DATABASE_URL:
# - Should use port 6543 (pooled connection)
# - Should include ?pgbouncer=true
# - Format: postgresql://user:pass@host:6543/postgres?pgbouncer=true

# Test connection in Railway logs:
# Look for "Database connected" or connection errors
```

**Cause 2: Missing environment variables**
```bash
# In Railway Variables tab, verify ALL required vars are set:
✅ DATABASE_URL
✅ SESSION_SECRET
✅ PAYFAST_MERCHANT_ID
✅ PAYFAST_MERCHANT_KEY
✅ PAYFAST_PASSPHRASE
✅ PAYFAST_MODE
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NODE_ENV=production
```

**Cause 3: Port binding issue**
```bash
# Ensure server listens on process.env.PORT:
# In server/index.ts:
const port = parseInt(process.env.PORT || '5000', 10);
server.listen({ port, host: "0.0.0.0" });

# Railway automatically sets PORT, don't override it
```

---

## 🔥 Issue #6: Netlify Deploys but Can't Connect to Backend

### The Problem
Frontend loads but API calls fail.

### The Fix

1. **Check VITE_API_URL in Netlify:**
   - Site settings → Environment variables
   - Should be: `https://your-railway-app.railway.app` (NO trailing slash)
   - If missing or wrong, add/update it

2. **Redeploy Netlify after changing env vars:**
   - Deploys → Trigger deploy → **Clear cache and deploy site**

3. **Verify CORS in backend:**
   - In `server/index.ts`, add your Netlify URL to `allowedOrigins`:
   ```typescript
   const allowedOrigins = [
     'https://your-netlify-site.netlify.app',  // Add this
     'https://www.timeless.organic',
     // ... other origins
   ];
   ```
   - Commit and push to trigger Railway redeploy

4. **Test in browser console:**
   ```javascript
   // Open your Netlify site
   // Press F12 → Console
   // Check what API URL is being used:
   console.log(import.meta.env.VITE_API_URL);
   
   // Should show your Railway URL
   ```

---

## 🔥 Issue #7: Payment Flow Doesn't Work

### The Problem
Payment redirect fails or webhook doesn't update purchase.

### The Fix

**For Redirect Issues:**
1. Check PayFast credentials match mode (see Issue #2)
2. Restart server after changing credentials
3. Clear browser cache
4. Try payment again

**For Webhook Issues (purchase stays "pending"):**
1. **Verify webhook URL in PayFast dashboard:**
   - Should be: `https://your-railway-app.railway.app/api/payment/notify`
   - NOT localhost or Replit URL

2. **Check Railway logs for webhook hits:**
   ```bash
   # In Railway logs, look for:
   POST /api/payment/notify
   [PayFast] Received webhook notification
   [PayFast] Signature verification: PASSED ✅
   ```

3. **Test webhook manually:**
   ```bash
   curl -X POST https://your-railway-app.railway.app/api/payment/notify \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "m_payment_id=test&payment_status=COMPLETE&merchant_id=10000100"
   
   # Should return 200 OK
   ```

4. **Verify passphrase is correct:**
   - Case-sensitive, no extra spaces
   - Must match PayFast dashboard settings exactly

---

## ✅ Verification Checklist

After fixing the above issues, verify everything works:

### Local Development (Replit)
```bash
✅ Secrets set in Replit
✅ Run `npm run dev`
✅ App starts on port 5000
✅ Can sign in
✅ Database queries work
✅ No errors in console
```

### GitHub
```bash
✅ Can push commits
✅ Repository shows latest code
✅ No merge conflicts
```

### Railway Backend
```bash
✅ Latest deployment successful
✅ All environment variables set
✅ Service is running (green status)
✅ Logs show no errors
✅ Can access API: https://your-railway-app.railway.app/api/health
```

### Netlify Frontend
```bash
✅ Latest deployment successful
✅ VITE_API_URL set correctly
✅ Site loads: https://your-netlify-site.netlify.app
✅ Can connect to backend
✅ No CORS errors in browser console
```

### End-to-End Test
```bash
✅ Visit Netlify site
✅ Sign in works
✅ Dashboard loads
✅ Click "Invest Now"
✅ Redirects to PayFast
✅ Complete payment (sandbox test card)
✅ Redirected back to success page
✅ Purchase shows as "completed" in dashboard
✅ Codes are generated
✅ Can select cutting
```

---

## 🆘 Still Stuck?

### Run the Diagnostic Again
```bash
# In Replit Shell:
node diagnose-deployment.js
```

### Check Specific Logs
- **Railway**: Dashboard → Deployments → View logs
- **Netlify**: Deploys → Click deployment → Deploy log
- **Supabase**: Dashboard → Logs & Reports → API Logs

### Review Documentation
- `DEPLOYMENT_TROUBLESHOOTING.md` - Comprehensive troubleshooting
- `RAILWAY_DEPLOYMENT.md` - Railway-specific guide
- `PAYFAST_SETUP.md` - PayFast integration guide

### Common Error Messages
| Error | Location | Solution |
|-------|----------|----------|
| "Invalid merchant ID" | PayFast | Check credentials match mode (Issue #2) |
| "ECONNREFUSED" | Frontend | Check VITE_API_URL in Netlify (Issue #6) |
| "Blocked by CORS" | Browser | Update allowedOrigins in server (Issue #6) |
| "Database connection timeout" | Railway | Check DATABASE_URL uses port 6543 (Issue #5) |
| "Module not found" | Railway Build | Add to package.json dependencies (Issue #4) |

---

**Last Updated**: November 7, 2025
