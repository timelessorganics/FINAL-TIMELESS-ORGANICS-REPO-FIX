# 🚀 Deploy Backend to Railway (Simple Guide)

**Time:** 15 minutes  
**Cost:** $7/month  
**What it does:** Hosts your Express backend with auto-deploy from GitHub

---

## Step 1: Push Your Code to GitHub (if not already)

```bash
# Make sure your latest code is on GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

---

## Step 2: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login with GitHub"**
3. Authorize Railway to access your repositories

---

## Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **`Timeless-Organics-Founding-100`** repository
4. Railway will detect it's a Node.js app automatically ✅

---

## Step 4: Add Environment Variables

Click **"Variables"** tab and add these:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# Session
SESSION_SECRET=your-session-secret-here

# PayFast
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
PAYFAST_MODE=sandbox

# Supabase (for object storage if needed)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Node Environment
NODE_ENV=production
```

**💡 TIP:** Copy these from your Replit Secrets

---

## Step 5: Configure Build Settings

Railway should auto-detect, but verify:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `/` (leave blank)

---

## Step 6: Deploy!

1. Railway will automatically deploy
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://timeless-organics-production.up.railway.app`

---

## Step 7: Get Your Backend URL

1. Go to **Settings** tab
2. Click **"Generate Domain"**
3. Copy your Railway URL (e.g., `timeless-organics-production.up.railway.app`)

---

## Step 8: Update Netlify Frontend

In your Netlify environment variables, add:

```bash
VITE_API_URL=https://timeless-organics-production.up.railway.app
```

Then rebuild your Netlify site.

---

## ✅ Done! Your backend is live on Railway

**Auto-deploys:** Every time you push to GitHub, Railway rebuilds automatically

**Costs:** ~$7/month (billed only for actual usage)

**Monitoring:** Check Railway dashboard for logs and metrics

---

## Troubleshooting

**Build fails?**
- Check that `package.json` has correct `start` script
- Verify all environment variables are set

**Can't connect to database?**
- Make sure `DATABASE_URL` is the Supabase **transaction pooler** URL (port 6543)
- Use the connection string with SSL enabled

**Need help?**
- Railway docs: https://docs.railway.app
- Railway Discord: Very active community support
