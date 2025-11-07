# 🔥 NUCLEAR RESET - Fresh Start Guide

## ✅ Prerequisites (COMPLETED)
- [x] All environment variables backed up from Railway
- [x] All environment variables backed up from Netlify
- [x] Supabase database preserved (DO NOT DELETE - has 30 purchases!)

---

## 📋 STEP 1: Clean GitHub Repository

### 1.1 Change Default Branch to Main
1. Go to: https://github.com/timelessorganics/Timeless-Organics-Fouding-100/settings/branches
2. Click the ⇄ icon next to current default branch
3. Select **main** from dropdown
4. Click "Update" and confirm

### 1.2 Delete ALL Other Branches
1. Go to: https://github.com/timelessorganics/Timeless-Organics-Fouding-100/branches
2. Delete these branches (click trash icon 🗑️):
   - `timeless-organics-founding-100`
   - Any other branches you see

**Result**: ONE branch only (main) with latest code including PayFast fixes

---

## 📋 STEP 2: Fresh Railway Deployment

### 2.1 Delete Old Railway Service
1. Go to: https://railway.app/dashboard
2. Find: `Timeless-Organics-Fouding-100-production`
3. Click service → Settings → Danger Zone
4. Click "Delete Service" and confirm

### 2.2 Create New Railway Service
1. Click "+ New Project"
2. Select "Deploy from GitHub repo"
3. Choose: `timelessorganics/Timeless-Organics-Fouding-100`
4. Branch: **main** (CRITICAL!)
5. Root Directory: `/` (leave default)
6. Build Command: `npm install`
7. Start Command: `npm run dev`

### 2.3 Configure Environment Variables
In Railway Settings → Variables, add ALL these:

**Supabase (Database + Auth)**
```
DATABASE_URL=postgresql://...your-supabase-url...
SUPABASE_URL=https://auth.timeless.organic
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-key...
```

**PayFast (Production)**
```
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
PAYFAST_MODE=production
```

**Session**
```
SESSION_SECRET=your-random-secret-string
```

**Email (SMTP)**
```
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

**Mailchimp**
```
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_SERVER=us21
MAILCHIMP_LIST_ID=your-list-id
```

**GitHub**
```
GITHUB_TOKEN=your-github-token
```

### 2.4 Deploy
1. Railway will auto-deploy after adding environment variables
2. Wait ~90 seconds for build
3. Copy the Railway domain (e.g., `timeless-organics-production.up.railway.app`)

### 2.5 Add Custom Domain (Optional)
1. Settings → Domains
2. Add: `api.timeless.organic` (or keep Railway domain)

---

## 📋 STEP 3: Fresh Netlify Deployment

### 3.1 Delete Old Netlify Site
1. Go to: https://app.netlify.com/sites
2. Find: `www.timeless.organic` site
3. Site Settings → Danger Zone
4. Click "Delete this site" and confirm

### 3.2 Create New Netlify Site
1. Click "Add new site" → "Import an existing project"
2. Connect to GitHub
3. Choose: `timelessorganics/Timeless-Organics-Fouding-100`
4. Branch: **main** (CRITICAL!)
5. Build Settings:
   - Base directory: `/`
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3.3 Configure Environment Variables
In Netlify Site Settings → Environment Variables, add:

**Supabase (Frontend)**
```
VITE_SUPABASE_URL=https://auth.timeless.organic
VITE_SUPABASE_ANON_KEY=eyJhbG...your-anon-key...
```

**Backend API URL**
```
VITE_API_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
```
⚠️ Use the Railway domain from Step 2.4!

### 3.4 Deploy
1. Trigger Deploy (Deploys → Trigger deploy)
2. Wait ~60 seconds for build
3. Site will be live at temporary Netlify URL

### 3.5 Add Custom Domain
1. Site Settings → Domain Management
2. Add custom domain: `www.timeless.organic`
3. Configure DNS (A record or CNAME)
4. Enable HTTPS (auto via Let's Encrypt)

---

## 📋 STEP 4: Verify Everything Works

### 4.1 Test Backend (Railway)
```bash
curl https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/seats/availability
```
Should return: `[{"type":"founder","price":1000,...},{"type":"patron","price":1000,...}]`

### 4.2 Test Frontend (Netlify)
1. Visit: `https://www.timeless.organic`
2. Sign in with your account
3. Navigate to checkout

### 4.3 Test Payment Flow
1. Select a seat (Founder or Patron)
2. Fill checkout form with specimen selection
3. Click "Complete Purchase"
4. PayFast modal should open (no errors!)
5. Complete test payment with test card

---

## 🎯 SUCCESS CHECKLIST

- [ ] GitHub: Only `main` branch exists
- [ ] Railway: Fresh deployment from `main` branch
- [ ] Netlify: Fresh deployment from `main` branch
- [ ] Backend API responds (seat availability endpoint)
- [ ] Frontend loads correctly
- [ ] PayFast payment modal opens without errors
- [ ] Test payment completes successfully

---

## 🆘 If Something Goes Wrong

**Backend not responding:**
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `SUPABASE_URL` uses `auth.timeless.organic`

**Frontend not loading:**
- Check Netlify deploy logs
- Verify `VITE_API_URL` points to Railway domain
- Check browser console for errors

**PayFast errors:**
- Verify PayFast credentials are production (not sandbox)
- Check Railway logs for detailed PayFast API errors
- Ensure user_ip and user_agent are being captured

**Database errors:**
- DO NOT recreate Supabase database!
- Check `DATABASE_URL` is correct
- Supabase should have 30 existing purchases

---

## 📝 From Now On

✅ **Single Branch Workflow**
- ALL commits go to `main` branch
- Railway auto-deploys from `main`
- Netlify auto-deploys from `main`
- No more branch confusion!

✅ **Environment Variables**
- Railway: Backend secrets
- Netlify: Frontend env vars (VITE_ prefix)
- Never commit secrets to code!

✅ **Deployment Flow**
1. Push code to `main` branch
2. Railway auto-deploys backend (~90s)
3. Netlify auto-deploys frontend (~60s)
4. Both services stay in sync!

---

**Good luck! 🚀**
