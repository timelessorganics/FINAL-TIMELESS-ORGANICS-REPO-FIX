# 🚨 Deployment Pipeline Troubleshooting Guide

## Your Stack
- **Source**: Replit → GitHub
- **Backend**: Railway (Node.js/Express)
- **Frontend**: Netlify (React/Vite)
- **Database**: Supabase (PostgreSQL)
- **Payment**: PayFast Integration

---

## 🔥 Common Issues & Solutions

### 1. **GitHub Push Issues**

#### Problem: Can't push from Replit to GitHub
**Symptoms:**
- Authentication failures
- Push rejected errors
- Remote not found

**Solutions:**
```bash
# Check current remote
git remote -v

# If remote is missing, add it
git remote add origin https://github.com/timelessorganics/Timeless-Organics-Main-Repository.git

# Set up GitHub authentication
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Use GitHub token for authentication
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/timelessorganics/Timeless-Organics-Main-Repository.git

# Force push if needed (CAUTION: only if you're sure)
git push -u origin main --force
```

**Alternative: Use the upload scripts**
```bash
# Use the existing helper script
node upload-to-github.js
```

---

### 2. **Railway Deployment Failures**

#### Problem A: Build Failures
**Symptoms:**
- "Module not found" errors
- TypeScript compilation errors
- Build timeout

**Solutions:**

1. **Check `railway.json` configuration:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "NODE_ENV=production node dist/index.js"
  }
}
```

2. **Verify `package.json` build scripts:**
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

3. **Check Railway logs:**
```bash
# In Railway dashboard:
# Project → Deployments → Click on failed deployment → View logs
```

**Common build errors:**
- Missing dependencies: Add to `package.json` dependencies (not devDependencies)
- Node version mismatch: Railway uses Node 18 by default
- esbuild issues: Ensure `esbuild` is in `devDependencies`

#### Problem B: Runtime Crashes
**Symptoms:**
- App starts but crashes immediately
- "Cannot connect to database" errors
- 502 Bad Gateway errors

**Solutions:**

1. **Verify all environment variables are set in Railway:**

Go to Railway → Your Project → Variables tab and set:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:6543/dbname?pgbouncer=true

# Session
SESSION_SECRET=your-random-secure-string-here

# PayFast
PAYFAST_MERCHANT_ID=10043126
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
PAYFAST_MODE=production  # or 'sandbox' for testing

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Node
NODE_ENV=production
PORT=5000
```

2. **Database Connection Issues:**
```bash
# Make sure you're using the pooled connection string (port 6543)
# NOT the direct connection (port 5432)

# Correct format:
postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# If still failing, try without pgbouncer:
postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

3. **Check Railway service logs:**
```bash
# Look for specific error messages
# Common issues:
# - Port binding: Ensure using process.env.PORT
# - Database timeout: Check Supabase connection limits
# - Missing env vars: Check spelling and values
```

#### Problem C: CORS Issues
**Symptoms:**
- Frontend can't connect to backend
- "Blocked by CORS policy" in browser console

**Solutions:**

1. **Update `server/index.ts` CORS configuration:**
```typescript
const allowedOrigins = [
  'https://your-netlify-site.netlify.app',  // Add your Netlify URL
  'https://www.timeless.organic',
  'https://timeless.organic',
  'https://your-railway-app.railway.app',  // Railway URL
  'http://localhost:5000',
  'http://localhost:5173',
];
```

2. **Commit and push changes:**
```bash
git add server/index.ts
git commit -m "fix: Update CORS origins for production"
git push origin main
```

---

### 3. **Netlify Deployment Issues**

#### Problem A: Build Failures
**Symptoms:**
- Vite build fails
- "Cannot find module" errors

**Solutions:**

1. **Verify Netlify build settings:**
```bash
# Base directory: (leave empty or set to root)
# Build command: npm run build
# Publish directory: dist
```

2. **Check environment variables in Netlify:**
```bash
# Site settings → Environment variables

# Add:
VITE_API_URL=https://your-railway-app.railway.app

# Important: Vite env vars must start with VITE_
```

3. **Update client code to use environment variable:**
```typescript
// In client code (e.g., client/src/lib/api.ts)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

#### Problem B: Site loads but API calls fail
**Symptoms:**
- Frontend loads fine
- API requests return 404 or fail to connect
- Network errors in browser console

**Solutions:**

1. **Verify API URL environment variable:**
```bash
# In Netlify dashboard:
# Site settings → Environment variables → Check VITE_API_URL
# Should be: https://your-railway-app.railway.app (without trailing slash)
```

2. **Rebuild Netlify site:**
```bash
# After updating env vars, trigger a new deploy:
# Deploys → Trigger deploy → Clear cache and deploy site
```

3. **Check browser console:**
```javascript
// Should see API calls going to Railway URL
// e.g., https://your-railway-app.railway.app/api/...
```

---

### 4. **Supabase Database Issues**

#### Problem A: Connection Timeouts
**Symptoms:**
- "Connection pool exhausted" errors
- Slow queries
- Random disconnects

**Solutions:**

1. **Use connection pooler (port 6543):**
```bash
# Session mode (default - recommended):
postgresql://user:pass@host:6543/postgres?pgbouncer=true

# Transaction mode (for serverless):
postgresql://user:pass@host:6543/postgres?pgbouncer=true&pool_mode=transaction
```

2. **Optimize connection pool settings:**
```typescript
// In server/db.ts or wherever you initialize DB
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

3. **Check Supabase connection limits:**
```bash
# Go to Supabase dashboard:
# Settings → Database → Connection pooling
# Ensure you haven't exceeded connection limits
```

#### Problem B: Schema/Migration Issues
**Symptoms:**
- "Table does not exist" errors
- Column missing errors

**Solutions:**

1. **Push schema to Supabase:**
```bash
# From your local machine (not Replit):
npm run db:push

# Or manually apply migrations:
# Go to Supabase SQL Editor and run:
```

2. **Initialize database with seed data:**
```bash
# Run the initialization SQL:
# Copy contents of INIT_SUPABASE_DATA.sql
# Paste into Supabase SQL Editor
# Execute
```

3. **Verify tables exist:**
```sql
-- In Supabase SQL Editor, run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see: users, seats, purchases, codes, cuttings, etc.
```

---

### 5. **PayFast Integration Issues**

#### Problem A: "Invalid merchant ID" error
**Symptoms:**
- Payment redirect fails
- 400 Bad Request from PayFast
- Error in browser console

**Solutions:**

1. **Verify credentials match mode:**

**For Sandbox Testing:**
```bash
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn
PAYFAST_MODE=sandbox
```

**For Production:**
```bash
PAYFAST_MERCHANT_ID=10043126  # Your actual merchant ID
PAYFAST_MERCHANT_KEY=your-actual-key
PAYFAST_PASSPHRASE=your-actual-passphrase
PAYFAST_MODE=production
```

2. **Common mistake:**
```bash
# ❌ WRONG: Production merchant ID with sandbox mode
PAYFAST_MERCHANT_ID=10043126
PAYFAST_MODE=sandbox

# ✅ CORRECT: Match credentials to mode
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MODE=sandbox
```

3. **Restart server after changing credentials:**
```bash
# In Replit: Stop and restart workflow
# In Railway: Redeploy (changes env vars)
```

#### Problem B: Payment webhook not receiving notifications
**Symptoms:**
- Payment completes on PayFast
- Purchase stays "pending" in database
- No codes generated

**Solutions:**

1. **Verify webhook URL in PayFast dashboard:**
```bash
# Should be:
https://your-railway-app.railway.app/api/payment/notify

# NOT localhost or Replit URL
```

2. **Check PayFast ITN (Instant Transaction Notification) settings:**
```bash
# In PayFast dashboard:
# Settings → Integration → Notify URL
# Enter: https://your-railway-app.railway.app/api/payment/notify
```

3. **Test webhook manually:**
```bash
# Use PayFast's ITN testing tool or:
curl -X POST https://your-railway-app.railway.app/api/payment/notify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "m_payment_id=test123&payment_status=COMPLETE&merchant_id=10000100"

# Should return 200 OK
```

4. **Check Railway logs for webhook hits:**
```bash
# In Railway dashboard:
# Check logs for POST /api/payment/notify
# Look for signature verification messages
```

#### Problem C: Signature verification fails
**Symptoms:**
- Webhook receives notification
- "Invalid signature" error in logs
- Purchase not updated

**Solutions:**

1. **Verify passphrase matches exactly:**
```bash
# Case-sensitive, no extra spaces
# Must match PayFast dashboard settings
PAYFAST_PASSPHRASE=YourExactPassphrase123
```

2. **Check server log for signature details:**
```typescript
// Look for logs like:
[PayFast] Received webhook notification
[PayFast] Signature verification: PASSED ✅
// or
[PayFast] Signature verification: FAILED ❌
```

3. **Update return and cancel URLs:**
```bash
# In server/utils/payfast.ts or equivalent:
// Make sure these point to your production frontend:
return_url: 'https://your-netlify-site.netlify.app/payment/success'
cancel_url: 'https://your-netlify-site.netlify.app/payment/cancel'
notify_url: 'https://your-railway-app.railway.app/api/payment/notify'
```

---

## 🔄 Complete Deployment Workflow

### Step 1: Local Development (Replit)
```bash
# Make changes in Replit
# Test locally: npm run dev

# Commit changes
git add .
git commit -m "feat: description of changes"
```

### Step 2: Push to GitHub
```bash
# Method 1: Direct push
git push origin main

# Method 2: Use helper script
node upload-to-github.js

# Method 3: Use simple script
./simple-push.sh
```

### Step 3: Railway Auto-Deploys
```bash
# Railway watches your GitHub main branch
# Automatically triggers build & deploy on push

# Monitor in Railway dashboard:
# 1. Check build logs
# 2. Verify deployment succeeds
# 3. Check service logs for runtime errors
```

### Step 4: Update Netlify (if needed)
```bash
# Netlify also watches GitHub (if connected)
# OR manually trigger deploy:
# Netlify dashboard → Deploys → Trigger deploy

# After deploy:
# 1. Verify API_URL environment variable is correct
# 2. Test frontend functionality
# 3. Check browser console for errors
```

### Step 5: Verify Everything Works
```bash
# Test checklist:
✅ Frontend loads on Netlify
✅ Backend responds on Railway
✅ Database queries work (Supabase)
✅ Payment flow works (PayFast)
✅ Webhook receives notifications
✅ Codes are generated
✅ Emails are sent (if configured)
```

---

## 🛠️ Quick Diagnostic Commands

### Check GitHub Connection
```bash
cd /home/user/webapp
git remote -v
git status
git log --oneline -5
```

### Verify Environment Variables
```bash
# Check what's set in current environment
echo "Database: ${DATABASE_URL:0:30}..."
echo "PayFast Mode: $PAYFAST_MODE"
echo "PayFast Merchant: ${PAYFAST_MERCHANT_ID}"
```

### Test Database Connection
```bash
# Create a test script: test-db.js
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => {
  console.log('✅ Database connected:', res.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error('❌ Database error:', err.message);
  process.exit(1);
});
"
```

### Test PayFast Credentials
```bash
# Check if credentials are loaded
node -e "
console.log('Mode:', process.env.PAYFAST_MODE);
console.log('Merchant ID:', process.env.PAYFAST_MERCHANT_ID);
console.log('Key (first 4):', process.env.PAYFAST_MERCHANT_KEY?.substring(0, 4));
console.log('Passphrase length:', process.env.PAYFAST_PASSPHRASE?.length);
"
```

---

## 📋 Environment Variables Checklist

### Replit Secrets (Development)
```bash
✅ DATABASE_URL
✅ SESSION_SECRET
✅ PAYFAST_MERCHANT_ID (use sandbox credentials)
✅ PAYFAST_MERCHANT_KEY
✅ PAYFAST_PASSPHRASE
✅ PAYFAST_MODE=sandbox
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
```

### Railway Environment Variables (Production Backend)
```bash
✅ DATABASE_URL (Supabase pooled connection)
✅ SESSION_SECRET (generate new for production)
✅ PAYFAST_MERCHANT_ID (production credentials)
✅ PAYFAST_MERCHANT_KEY
✅ PAYFAST_PASSPHRASE
✅ PAYFAST_MODE=production
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NODE_ENV=production
✅ PORT=5000 (Railway auto-sets this)
```

### Netlify Environment Variables (Production Frontend)
```bash
✅ VITE_API_URL=https://your-railway-app.railway.app
```

---

## 🚨 Emergency Fixes

### Issue: Everything is broken
```bash
# 1. Check all services are running:
# - Supabase: https://app.supabase.com
# - Railway: https://railway.app
# - Netlify: https://app.netlify.com

# 2. Check service status pages:
# - https://status.railway.app
# - https://www.netlifystatus.com
# - https://status.supabase.com

# 3. Roll back to last working commit:
git log --oneline -10
git reset --hard COMMIT_HASH
git push origin main --force  # CAREFUL!

# 4. Check Railway logs for specific errors
# 5. Re-verify all environment variables
```

### Issue: Need to start fresh
```bash
# See FRESH-START-GUIDE.md for complete reset instructions
```

---

## 📞 Getting Help

### Check Logs First
1. **Railway**: Project → Deployments → Logs
2. **Netlify**: Deploys → Click deployment → Deploy log
3. **Supabase**: Logs & Reports → API Logs

### Common Error Messages
- `ECONNREFUSED`: Service not running or wrong URL
- `401 Unauthorized`: Check API keys and tokens
- `502 Bad Gateway`: Backend crashed or not responding
- `CORS error`: Update allowed origins in server config
- `Database connection timeout`: Check connection string and pooler settings

### Support Resources
- Railway Discord: https://discord.gg/railway
- Netlify Forum: https://answers.netlify.com
- Supabase Discord: https://discord.supabase.com
- PayFast Support: support@payfast.co.za

---

## ✅ Final Checklist Before Going Live

```bash
✅ All environment variables set correctly
✅ Database schema up to date
✅ Railway deployment successful
✅ Netlify deployment successful
✅ CORS configured for production domains
✅ PayFast webhooks pointing to Railway URL
✅ Payment flow tested end-to-end
✅ Email notifications working (if enabled)
✅ SSL certificates valid (Railway & Netlify auto-provide)
✅ Custom domains configured (if applicable)
✅ Backup database before launch
✅ Monitor logs during first transactions
```

---

**Last Updated**: November 7, 2025
**Stack Version**: Node 20, Vite 5, Express 4, Supabase PostgreSQL, Railway, Netlify, PayFast
