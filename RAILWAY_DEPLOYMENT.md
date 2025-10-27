# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with this code
- All environment secrets ready

## Environment Variables Required

Set these in Railway's environment variables:

### Database
- `DATABASE_URL` - Supabase PostgreSQL connection string

### Authentication
- `SESSION_SECRET` - Random secure string for session encryption

### PayFast
- `PAYFAST_MERCHANT_ID` - PayFast merchant ID
- `PAYFAST_MERCHANT_KEY` - PayFast merchant key
- `PAYFAST_PASSPHRASE` - PayFast passphrase
- `PAYFAST_MODE` - Set to `live` for production (or `sandbox` for testing)

### Supabase (if used)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Email (Optional - for notifications)
Configure your SMTP settings if you want email notifications

### Node Environment
- `NODE_ENV` - Set to `production`

## Deployment Steps

1. **Create New Project**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**
   - Go to project settings
   - Add all required environment variables listed above
   - Save changes

3. **Configure Build & Deploy**
   - Railway will automatically detect the `railway.json` config
   - Build command: `npm run build`
   - Start command: `npm start`
   - These are already configured in `railway.json`

4. **Deploy**
   - Railway will automatically deploy on push to main branch
   - Monitor deployment logs for any errors
   - Once deployed, you'll get a Railway URL (e.g., `your-app.railway.app`)

5. **Custom Domain (Optional)**
   - Go to project settings > Domains
   - Add custom domain if needed
   - Update DNS records as instructed

## Post-Deployment

1. **Update Netlify Frontend**
   - Update frontend environment variable `VITE_API_URL` to point to your Railway backend URL
   - Redeploy frontend on Netlify

2. **Test PayFast Integration**
   - Ensure PayFast return URL is configured to point to your Railway backend
   - Test a purchase flow in sandbox mode first
   - Switch to live mode when ready

3. **Database Migrations**
   - Run `npm run db:push` locally if schema changes are needed
   - Or connect to production database and run migrations

## Monitoring

- Check Railway logs for errors
- Monitor database connections
- Test all critical flows (purchase, redemption, certificate generation)

## Troubleshooting

**Build Fails:**
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify Node version compatibility

**Runtime Errors:**
- Check environment variables are set correctly
- Verify DATABASE_URL is accessible
- Check CORS configuration allows your frontend domain

**Database Connection Issues:**
- Verify Supabase connection string
- Check IP allowlist in Supabase (Railway IPs may need whitelisting)
- Test connection string locally first
