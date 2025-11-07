# Timeless Organics - Founding 100 Campaign

A full-stack web application for the Timeless Organics Founding 100 investment campaign, featuring PayFast payment integration, Supabase authentication, and automated certificate generation.

## 🏗️ Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Replit Auth + Supabase Auth
- **Payments**: PayFast (South African payment gateway)
- **Hosting**: 
  - Backend: Railway
  - Frontend: Netlify
  - Development: Replit

## 🚀 Deployment Pipeline

```
Replit (Development) 
    ↓ git push
GitHub (Repository)
    ↓ auto-deploy
Railway (Backend) + Netlify (Frontend)
    ↓ connects to
Supabase (Database) + PayFast (Payments)
```

## 📋 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/timelessorganics/Timeless-Organics-Main-Repository.git
cd Timeless-Organics-Main-Repository
npm install
```

### 2. Set Up Environment Variables

**Required environment variables:**

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:6543/postgres?pgbouncer=true

# Session
SESSION_SECRET=your-random-secure-string-min-32-chars

# PayFast (Sandbox for testing)
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=jt7NOE43FZPn
PAYFAST_MODE=sandbox

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Check your environment setup:**
```bash
# Run the diagnostic
node diagnose-deployment.js

# Or check environment variables
./check-env-setup.sh
```

### 3. Initialize Database

```bash
# Push database schema
npm run db:push

# Or manually run INIT_SUPABASE_DATA.sql in Supabase SQL Editor
```

### 4. Run Development Server

```bash
npm run dev
# App runs on http://localhost:5000
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema to Supabase
```

## 📚 Documentation

### For Troubleshooting

- **[QUICK_FIX_GUIDE.md](./QUICK_FIX_GUIDE.md)** - Start here! Common issues and quick fixes
- **[DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)** - Comprehensive troubleshooting guide
- **[diagnose-deployment.js](./diagnose-deployment.js)** - Automated diagnostic script

### For Deployment

- **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)** - Railway backend deployment
- **[PUSH_TO_GITHUB.md](./PUSH_TO_GITHUB.md)** - GitHub push guide
- **[FRESH-START-GUIDE.md](./FRESH-START-GUIDE.md)** - Start from scratch

### For Specific Features

- **[PAYFAST_SETUP.md](./PAYFAST_SETUP.md)** - PayFast integration setup
- **[PAYFAST_CREDENTIALS_SETUP.md](./PAYFAST_CREDENTIALS_SETUP.md)** - PayFast credentials
- **[SUPABASE_AUTH_DEPLOYMENT.md](./SUPABASE_AUTH_DEPLOYMENT.md)** - Supabase auth setup
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Complete testing checklist
- **[FIXES_SUMMARY.md](./FIXES_SUMMARY.md)** - Recent fixes and improvements

## 🐛 Common Issues

### Can't push to GitHub?
```bash
# Use the helper script
node upload-to-github.js

# Or check the guide
See PUSH_TO_GITHUB.md
```

### Railway deployment failing?
```bash
# Check environment variables in Railway dashboard
# See RAILWAY_DEPLOYMENT.md for detailed steps

# Common fixes:
1. Verify all environment variables are set
2. Check build logs for specific errors
3. Ensure DATABASE_URL uses port 6543 (pooled connection)
```

### PayFast "Invalid merchant ID" error?
```bash
# Verify credentials match mode
# Sandbox: merchant ID = 10000100
# Production: merchant ID = 10043126

# See PAYFAST_SETUP.md for details
```

### Netlify can't connect to backend?
```bash
# In Netlify → Site settings → Environment variables
# Add: VITE_API_URL=https://your-railway-app.railway.app

# Then: Deploys → Trigger deploy → Clear cache and deploy
```

## 🔍 Diagnostic Tools

### Run Full Diagnostic
```bash
node diagnose-deployment.js
```
Checks:
- Git configuration
- Required files
- Build scripts
- Environment variables
- PayFast configuration
- Database connection
- Dependencies

### Check Environment Variables
```bash
./check-env-setup.sh
```
Validates:
- All required variables are set
- PayFast credentials match mode
- Database URL format
- Connection pooler settings

## 🏗️ Project Structure

```
.
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and hooks
│   └── public/            # Static assets
├── server/                # Backend Express app
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database configuration
│   ├── utils/             # Utilities (PayFast, emails, etc.)
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
├── dist/                  # Production build output
├── scripts/               # Helper scripts
└── *.md                   # Documentation files
```

## 🔐 Environment Variables Reference

### Required for All Environments

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase connection string | `postgresql://...` |
| `SESSION_SECRET` | Session encryption key | Random 32+ char string |
| `PAYFAST_MERCHANT_ID` | PayFast merchant ID | `10000100` (sandbox) |
| `PAYFAST_MERCHANT_KEY` | PayFast merchant key | From PayFast dashboard |
| `PAYFAST_PASSPHRASE` | PayFast passphrase | From PayFast dashboard |
| `PAYFAST_MODE` | PayFast mode | `sandbox` or `production` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | From Supabase dashboard |
| `NODE_ENV` | Node environment | `development` or `production` |
| `PORT` | Server port | `5000` (default) |

### Frontend Only (Netlify)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-app.railway.app` |

## 📦 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Railway
- [ ] `VITE_API_URL` set in Netlify
- [ ] Database schema pushed to Supabase
- [ ] PayFast webhook URL configured
- [ ] PayFast return/cancel URLs updated
- [ ] CORS origins updated in `server/index.ts`
- [ ] Test payment flow end-to-end
- [ ] Verify certificate generation works
- [ ] Check email notifications (if enabled)

## 🧪 Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Test flow:
1. Sign in with Replit Auth
2. Click "Invest Now" on a seat
3. Should redirect to PayFast sandbox
4. Use test card: 5200000000000015
5. Complete payment
6. Should redirect to success page
7. Check dashboard for completed purchase
```

### Production Testing
```bash
# After deploying to Railway + Netlify:
1. Visit Netlify URL
2. Complete full payment flow
3. Verify purchase updates
4. Check codes are generated
5. Test certificate download
6. Verify cutting selection works
```

## 🆘 Getting Help

### Documentation
1. **Start with**: [QUICK_FIX_GUIDE.md](./QUICK_FIX_GUIDE.md)
2. **Run diagnostics**: `node diagnose-deployment.js`
3. **Check environment**: `./check-env-setup.sh`
4. **Review logs**:
   - Railway: Dashboard → Deployments → Logs
   - Netlify: Deploys → Deploy log
   - Supabase: Logs & Reports

### Support Resources
- **Railway**: https://discord.gg/railway
- **Netlify**: https://answers.netlify.com
- **Supabase**: https://discord.supabase.com
- **PayFast**: support@payfast.co.za

## 📝 Features

### For Investors
- **Seat Selection**: Choose between Founder (R3,000) and Patron (R5,000) seats
- **Secure Payments**: PayFast integration with signature verification
- **Digital Certificates**: Auto-generated investment certificates
- **Voucher Codes**:
  - Bronze claim code (guaranteed bronze casting)
  - One-time workshop voucher (50% or 80% off)
  - Lifetime workshop code (20% or 30% off all future workshops)
- **Cutting Selection**: Choose your aloe cutting for bronze casting
- **Dashboard**: Track purchases, codes, and cutting selections

### For Admin
- **Purchase Management**: Track all investments
- **Seat Availability**: Real-time seat counting
- **Code Generation**: Automatic voucher code creation
- **Payment Webhooks**: IPN verification and processing

## 🔒 Security Features

- **Session encryption** with secure secrets
- **PayFast signature verification** on all webhooks
- **Idempotent payment processing** (prevents duplicate charges)
- **CORS protection** for API endpoints
- **Environment variable isolation** (dev/production)
- **SQL injection protection** via Drizzle ORM
- **XSS protection** via React's built-in escaping

## 🚀 Performance

- **Connection pooling** via Supabase pooler (port 6543)
- **Production build optimization** with Vite
- **Code splitting** for faster initial load
- **Static asset caching** on Netlify CDN
- **Edge deployment** on Railway

## 📄 License

MIT

## 👥 Team

**Timeless Organics**
- Website: https://www.timeless.organic
- Email: info@timeless.organic

---

**Last Updated**: November 7, 2025

**Version**: 1.0.0

**Status**: Production Ready ✅
