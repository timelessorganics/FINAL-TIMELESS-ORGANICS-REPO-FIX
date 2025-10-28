# Deploy to Railway - Quick Guide

## ✅ Pre-Deployment Checklist

Your code is **READY TO DEPLOY**! Build tested successfully.

## 🚀 Deploy Steps

### 1. Push to GitHub
Your code is already syncing to: `https://github.com/timelessorganics/Timeless-Organics-Fouding-100.git`

### 2. Create Railway Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `timelessorganics/Timeless-Organics-Fouding-100`
5. Railway will auto-detect `railway.json` config ✅

### 3. Set Environment Variables in Railway

Go to your Railway project → **Variables** tab and add:

#### Database (CRITICAL)
```
DATABASE_URL=postgresql://postgres.zagsuh...your-supabase-connection-string
```

#### Authentication
```
SESSION_SECRET=your-random-secure-string-here
```

#### PayFast - For Testing (R10 amounts)
```
PAYFAST_MERCHANT_ID=10043126
PAYFAST_MERCHANT_KEY=tqjx0xk2w4hqe
PAYFAST_PASSPHRASE=DavidjunorTimeorg123
PAYFAST_MODE=sandbox
```

#### PayFast - For LAUNCH DAY (Real Payments)
```
PAYFAST_MERCHANT_ID=32126679
PAYFAST_MERCHANT_KEY=your-live-merchant-key
PAYFAST_PASSPHRASE=your-live-passphrase
PAYFAST_MODE=production
```

#### Supabase (Already set)
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
```

#### Node Environment
```
NODE_ENV=production
```

### 4. Deploy!
- Railway will automatically build and deploy
- Monitor the deployment logs
- You'll get a URL like: `https://your-app.up.railway.app`

### 5. Update Netlify Frontend
Once Railway is live:
1. Go to Netlify → Site settings → Environment variables
2. Update `VITE_API_URL` to your Railway URL (e.g., `https://your-app.up.railway.app`)
3. Trigger a new Netlify deployment

## 🎯 Test After Deployment

1. Visit your Railway URL: `https://your-app.up.railway.app/api/seats/availability`
2. Should return JSON with seat data
3. Test full payment flow from Netlify frontend

## 📋 Quick Switch: Testing → Production

**For R10 Testing:**
- Set `PAYFAST_MODE=sandbox`
- Use merchant ID `10043126`

**For Launch Day:**
- Set `PAYFAST_MODE=production`
- Use merchant ID `32126679`

## 🔍 Troubleshooting

**Build fails?**
- Check Railway logs for errors
- All dependencies are in package.json ✅

**Database connection fails?**
- Verify `DATABASE_URL` is correct Supabase connection string
- Check Supabase allows Railway's IP addresses

**PayFast not working?**
- Verify merchant credentials match mode (sandbox vs production)
- Check PayFast return URL points to Railway backend

## 📝 Current Configuration

✅ Build command: `npm run build`
✅ Start command: `npm start`
✅ Build tested: **SUCCESS** (71.6kb backend bundle)
✅ CORS configured for: `https://www.timeless.organic` and `https://timeless.organic`
✅ All routes registered
✅ Database schema ready

**You're ready to deploy!** 🚀
