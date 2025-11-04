# Supabase Auth Deployment Guide

## Overview
This guide will help you configure Supabase Auth for your Timeless Organics platform across Railway (backend) and Netlify (frontend).

---

## Step 1: Configure OAuth Providers in Supabase Dashboard

### 1.1 Set Site URL and Redirect URLs
1. Go to **Authentication** → **URL Configuration** in Supabase Dashboard
2. Set **Site URL** to: `https://www.timeless.organic`
3. Add these **Redirect URLs**:
   - `https://www.timeless.organic/auth/callback` (Production - Netlify)
   - `https://timeless-organics-fouding-100-production.up.railway.app/auth/callback` (Backend - Railway)
   - `http://localhost:5000/auth/callback` (Local development)

### 1.2 Enable OAuth Providers
Go to **Authentication** → **Providers** and enable:

#### Google OAuth
1. Click **Google** provider
2. Enable it
3. Add your Google Client ID and Secret (create at https://console.cloud.google.com/)
4. **Authorized redirect URIs** in Google Console:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`

#### GitHub OAuth
1. Click **GitHub** provider
2. Enable it
3. Add your GitHub OAuth App credentials (create at https://github.com/settings/developers)
4. **Authorization callback URL** in GitHub:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`

#### Apple OAuth (Optional)
1. Click **Apple** provider
2. Enable it
3. Add![https___timeless-organics-fouding-100-production](https___timeless-organics-fouding-100-production.up.railway.app_api_seats_availability.url)[InternetShortcut]
URL=https://timeless-organics-fouding-100-production.up.railway.app/api/seats/availability
IDList=
HotKey=0
IconFile=C:\Users\DavidHelena\AppData\Local\Mozilla\Firefox\Profiles\pkqzpo2c.default-release\shortcutCache\Jf15rvVQkVFXkHn7HvhVfsZ4wq2fLHMPUJxuDkoL1qU=.ico
IconIndex=0
 Apple Service ID and credentials (create at https://developer.apple.com/)

#### Email Auth
1. Click **Email** provider
2. Enable **Email provider**
3. Enable **Confirm email** if you want email verification

---

## Step 2: Set Environment Variables on Railway (Backend)

Go to your Railway project → **Variables** tab and add:

```bash
# Supabase Auth
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-public-key>

# PayFast (already configured)
PAYFAST_MERCHANT_ID=<existing>
PAYFAST_MERCHANT_KEY=<existing>
PAYFAST_PASSPHRASE=<existing>
PAYFAST_MODE=production

# Database (already configured)
DATABASE_URL=<existing>

# Session
SESSION_SECRET=<existing>

# Backend URL
BACKEND_URL=https://timeless-organics-fouding-100-production.up.railway.app
```

**Where to get Supabase keys:**
- Go to **Settings** → **API** in Supabase Dashboard
- Copy `URL` for **SUPABASE_URL**
- Copy `anon public` key for **SUPABASE_ANON_KEY**
- Copy `service_role` key for **SUPABASE_SERVICE_ROLE_KEY** (keep secret!)

---

## Step 3: Set Environment Variables on Netlify (Frontend)

Go to your Netlify site → **Site settings** → **Environment variables** and add:

```bash
# API Backend
VITE_API_URL=https://timeless-organics-fouding-100-production.up.railway.app

# Supabase Auth (Frontend)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

**Note:** The `VITE_` prefix is required for Vite to expose these to the frontend.

---

## Step 4: Redeploy Both Services

### Railway
1. Push to GitHub (Railway auto-deploys)
2. Or manually trigger redeploy in Railway dashboard

### Netlify
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Or push to `main` branch (auto-deploys)

---

## Step 5: Test Auth Flow

1. Visit `https://www.timeless.organic`
2. Click **Sign In** button
3. Choose a provider (Google/GitHub/Apple/Email)
4. Complete OAuth flow
5. Should redirect to `/auth/callback` then to your dashboard

---

## Local Development Setup

For local testing, set these in `.env` file (create if it doesn't exist):

```bash
# Supabase
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-public-key>

# Frontend (accessed via import.meta.env)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>

# Local backend
BACKEND_URL=http://localhost:5000
```

Then add to `.gitignore`:
```
.env
.env.local
```

---

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
│  (Netlify SPA)  │
└────────┬────────┘
         │
         │ 1. Click "Sign in with Google"
         │    → supabase.auth.signInWithOAuth({provider: 'google'})
         ↓
┌─────────────────┐
│ Supabase Auth   │ ← OAuth with Google/GitHub/Apple
│   Service       │
└────────┬────────┘
         │
         │ 2. Redirects to: /auth/callback?code=xyz
         ↓
┌─────────────────┐
│  Auth Callback  │
│  (Frontend SPA) │ → Exchanges code for session
└────────┬────────┘
         │
         │ 3. Makes API calls with JWT token
         │    Authorization: Bearer <supabase-jwt>
         ↓
┌─────────────────┐
│ Railway Backend │
│  Express API    │ ← Verifies JWT, extracts user ID
└─────────────────┘
```

---

## Security Notes

1. **NEVER commit** `SUPABASE_SERVICE_ROLE_KEY` to Git
2. **Service Role Key** = full database access (backend only)
3. **Anon Key** = safe to expose (frontend/public)
4. **JWT tokens** automatically sent by frontend to backend
5. Backend verifies JWT signature using `SUPABASE_SERVICE_ROLE_KEY`

---

## Troubleshooting

### "Invalid JWT" errors
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly on Railway
- Ensure frontend is sending `Authorization: Bearer <token>` header

### OAuth redirect not working
- Verify redirect URLs in Supabase Dashboard match exactly
- Check OAuth provider credentials (Google/GitHub)
- Ensure Site URL is `https://www.timeless.organic`

### CORS errors
- Backend already has CORS enabled for Netlify domain
- Check `VITE_API_URL` is set correctly on Netlify

### Session not persisting
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on Netlify
- Clear browser localStorage and try again

---

## Migration from Replit Auth

✅ **Completed:**
- Replaced Replit Auth with Supabase Auth
- Updated all auth endpoints and middleware
- Created sign-in page with OAuth buttons
- Added auth callback handler

🔄 **User Action Required:**
1. Configure OAuth providers in Supabase Dashboard
2. Set environment variables on Railway
3. Set environment variables on Netlify
4. Redeploy both services
5. Test complete auth flow

---

## Support Resources

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- OAuth Setup Guide: https://supabase.com/docs/guides/auth/social-login
- Railway Docs: https://docs.railway.app/
- Netlify Docs: https://docs.netlify.com/
