# Timeless Organics — Founding 100 Investor Launch

A premium dark-themed launch platform for Timeless Organics' founding investor program, featuring seat sales, unique code generation, PDF certificates, and sculpture selection.

## Project Overview

**Purpose**: Launch site for selling 100 limited founding seats (50 Founder + 50 Patron) with automated certificate generation, PayFast payment processing, and lifetime benefit codes.

**Production Domain**: www.timeless.organic (hosted on Netlify)

**Tech Stack**: React + TypeScript + Express + PostgreSQL (Supabase) + Tailwind CSS + Shadcn UI

## Visual Design

The application features a stunning dark aesthetic with:
- **Colors**: Bronze (#a67c52), Patina (#6f8f79), Accent Gold (#d8c3a5)
- **Typography**: Playfair Display (headings), Inter (body)
- **Animations**: Slow-moving gradient text effects (10-16s cycles) on key elements
- **Background**: Fixed aloe sculpture image with radial gradient overlays
- **Sign-in Page**: Crossfading smoke/fire video backgrounds (6 videos rotating with 1.5s transitions)
- **Buttons**: Glassy bronze buttons with backdrop-blur and animated gradient overlays

## Features

### Phase 1: MVP (Current)
1. **Email Gate**: Registration wall before main site access
2. **Main Launch Page**: Hero with animated gradients, seat selection cards with live counters
3. **Seat Purchase**: Founder (R3,000) and Patron (R6,000) options with PayFast integration
4. **Code Generation**: Unique codes for bronze claims, workshop vouchers, lifetime referrals
5. **Certificate Generation**: Automated PDF certificates with aloe background
6. **Sculpture Gallery**: Selection interface for bronze casting specimens
7. **User Dashboard**: View purchases, codes, and download certificates
8. **Admin Panel**: Analytics, seat tracking, purchase management

## Database Schema

### Tables
- `sessions` - Session storage for Replit Auth
- `users` - User accounts with admin flag
- `registrations` - Email gate registrations
- `seats` - Seat inventory (type, price, total, sold)
- `purchases` - User seat purchases with PayFast references
- `codes` - Unique codes (bronze_claim, workshop_voucher, lifetime_workshop) with `appliesTo` enum field
- `sculptures` - Available sculpture options with images
- `sculpture_selections` - User's chosen sculptures
- `referrals` - Tracks lifetime workshop code redemptions

### Key Relationships
- Purchase → User (many-to-one)
- Purchase → Codes (one-to-many)
- Purchase → SculptureSelection (one-to-one)
- SculptureSelection → Sculpture (many-to-one)

## API Endpoints (To Be Implemented)

### Public
- `POST /api/register` - Email registration
- `GET /api/seats/availability` - Current seat counts

### Protected
- `POST /api/purchase/initiate` - Start PayFast payment
- `POST /api/purchase/complete` - PayFast webhook
- `GET /api/sculptures` - Get available sculptures
- `POST /api/sculpture-selection` - Save sculpture choice
- `GET /api/dashboard` - User's purchases and codes

### Admin
- `GET /api/admin/seats` - Seat statistics
- `GET /api/admin/purchases` - All purchases
- `GET /api/admin/registrations` - All registrations
- `GET /api/admin/codes` - All codes

## Code System

### Bronze Claim Code
- Format: `BR-XXXX-XXXX`
- One per purchase, used to claim bronze casting
- Applies to: Any

### Workshop Voucher (One-Time Use)
- Format: `FO-50-XXXX-XXXX` (Founder) or `PA-80-XXXX-XXXX` (Patron)
- Discount: 50% (Founder) or 80% (Patron)
- Transferable, first 2-day workshop only
- Applies to: Workshops only (NOT valid for seat purchases)

### Lifetime Workshop Code
- Format: `LF-20-XXXX-XXXX` (Founder) or `LP-30-XXXX-XXXX` (Patron)
- Discount: 20% (Founder) or 30% (Patron)
- Unlimited uses, transferable for life
- Applies to: Workshops only (NOT valid for seat purchases)
- Unique code per user (not shared)

## PayFast Integration

- Merchant ID and Merchant Key required (to be provided)
- Sandbox/Production mode configuration
- Payment signature validation
- Return URLs for success/cancel/notify

## Environment Variables

Required:
- `SUPABASE_URL` - Supabase project URL (e.g., https://xxxxx.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)
- `SESSION_SECRET` - Session encryption key
- `PAYFAST_MERCHANT_ID` - PayFast merchant ID
- `PAYFAST_MERCHANT_KEY` - PayFast merchant key
- `PAYFAST_PASSPHRASE` - PayFast security passphrase
- `PAYFAST_MODE` - "sandbox" or "production"

Optional:
- `DATABASE_URL` - Fallback PostgreSQL connection string (if not using Supabase)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email delivery

## Recent Changes

**2025-10-24**: Supabase database successfully connected and operational
- Resolved "Tenant or user not found" errors by switching from direct connection to transaction pooler
- Connection string format: `postgresql://postgres.{project-ref}:[password]@aws-0-{region}.pooler.supabase.com:6543/postgres`
- Added SSL configuration: `{ ssl: { rejectUnauthorized: false } }` for pg Pool
- Database schema pushed successfully with all tables created
- Seeded 50 Founder seats (R3,000) and 50 Patron seats (R5,000)
- Seeded 10 aloe sculpture options with descriptions and images
- API endpoints tested and working: `/api/seats/availability`, `/api/sculptures`
- Database now accessible from both Replit development environment and Netlify production site

**2025-01-24**: Backend implementation and feature completion
- Removed unused registration/email gate features (replaced with Replit Auth)
- Implemented email delivery service with nodemailer (gracefully handles missing SMTP config)
- Added code redemption tracking (redemptionCount, maxRedemptions, redeemedBy array, lastRedeemedAt)
- Created referrals table and API endpoint GET /api/referrals/code/:codeId for tracking lifetime workshop code usage
- Fixed header nested anchor tag warnings (removed nested `<a>` elements)
- Production domain configured: www.timeless.organic (Netlify)
- All backend routes operational for purchase flow, code management, and admin analytics

**2025-10-25**: Discount code system overhaul & visual enhancements
- Updated code generation: Workshop vouchers now 50%/80%, lifetime codes now 20%/30%
- Changed code types: `lifetime_referral` → `lifetime_workshop` (unique per user)
- Added `appliesTo` enum field to codes table (workshop/seat/any) to enforce workshop-only restrictions
- Created comprehensive workshop explanation section on main launch page
- Implemented SmokeFireBackground component with 6 crossfading videos for sign-in page
- Fixed email template bug where lifetime workshop codes weren't appearing
- Added .gitignore rules for video files (140+ MB total, excluded from Git)
- All text updated: "3-day" → "2-day" workshops, correct discount percentages everywhere

**2025-10-27**: Marketing landing page with David Junor's personal story
- Created stunning root landing page (/) with full-screen hero, scrolling sections, and compelling CTAs
- Increased video visibility: opacity 0.85, transition 1000ms for dramatic effect
- Added "David Junor - The Founder" section with personal background, London dental lab experience, globally recognized bronze artist collaboration
- Featured iconic quote: "Those pieces weren't mine to sign; the craft became mine to master"
- Emphasized brand values: timeless/priceless craft meets artistic independence
- Layout: Hero → How It Works → Founder vs Patron → David's Story → Vision → Final CTA
- Created deployment guides: DEPLOYMENT_RAILWAY.md ($7/mo backend) and DEPLOYMENT_VIDEOS.md (free video hosting)
- Marketing page publicly accessible without login for immediate investor viewing

**2025-10-27 PM**: Navigation and user flow improvements
- Added "Sign In" button to header (shows when not authenticated)
- Improved purchase flow with clear "Sign In Required" message when attempting to invest without authentication
- Fixed "Secure Your Seat Now" button - now properly scrolls to top of /founding100 page
- Added smooth scroll-to-top on all route changes for better UX
- Updated "Workshops" section to "What's Next?" with clear explanation of post-purchase flow
- Removed broken "Workshop Schedule" and "Cutting Gallery" buttons from dashboard (workshops not live yet during Founding 100 launch)
- Added placeholder images for cutting gallery using placehold.co service (bronze/dark theme colors)
- Cutting gallery automatically falls back to placeholders if images don't exist
- Fixed z-index layering: Background (z-40), Content (z-50), Header (z-100) for consistent text visibility
- SmokeFireBackground opacity set to 85% for dramatic effect matching marketing page

**2025-10-27 LATE PM**: Payment flow fixes, content updates, and specimen expansion
- **CRITICAL FIX**: Fixed payment flow bug - apiRequest now properly parses JSON response before accessing purchaseId
- Expanded cutting gallery from 10 aloe-only to 20 diverse South African botanicals:
  - Added King Protea, Silver Tree, Strelitzia, Fern Frond, Succulent Rosette, Cycad Leaf, Restio, Protea Neriifolia, Cotyledon, Watsonia
  - Placeholders use themed colors (bronze/patina/gold) for visual consistency
- Updated investment timeline explanation: "Jan 2026 workshop-ready" with mold secure storage details
- Removed confusing "Pending Purchases Explained" card from dashboard
- Improved pending purchase UX: clearer messaging, "Return to Invest Page" button
- Added comprehensive workshop schedule details: Day 1 (09:30-13:00), Day 2 (09:30-15:00), two weekly sessions
- Added workshop pricing structure: variable cost up to R10,000 max, vouchers deduct percentage off final price
- Added "What to Bring/Wear" section: specimen requirements, safety clothing (closed shoes, long pants, cotton top)
- Added optional add-ons pricing: Patina service (R1,000-R3,000), mounting options
- **PayFast Debugging**: Added merchant ID logging (first 4 digits) to identify configuration issues

**2025-10-26**: Session storage hotfix - Supabase connectivity issue
- **CRITICAL FIX**: Switched from Postgres session storage to memory-based session storage
- Supabase connection timeouts were preventing user authentication and site access
- Changed session store from `connect-pg-simple` to `memorystore` in `server/replitAuth.ts`
- Site now fully operational with login functionality restored
- **NOTE**: Session data now stored in memory (sessions will reset on server restart)
- **TODO**: Investigate Supabase pooler connection issues (port 6643 timeouts) and potentially restore PG session storage once resolved

## Development Notes

- Application enforces dark mode (`.dark` class on `documentElement`)
- Email gate uses localStorage to track verified status
- All gradient animations use CSS `animation` with `text-hue` keyframe
- Seat counters update in real-time from database
- Certificates generated server-side with aloe background image

## Production Deployment Notes

### Video Assets
- Sign-in page uses 6 smoke/fire video files (140+ MB total)
- Videos are NOT committed to Git (excluded via .gitignore)
- For production deployment to Netlify:
  1. **Option A**: Upload videos directly to Netlify's `public/` folder during deploy
  2. **Option B**: Host videos on CDN (Cloudflare R2, AWS S3, or Supabase Storage) and update URLs in `SmokeFireBackground.tsx`
  3. **Option C**: Use Netlify Large Media (Git LFS) for video assets
- Current local paths: `/attached_assets/*.mp4` work in development only

### Database Schema
- Schema changes may need manual SQL updates due to Supabase connection timeouts
- Run `npm run db:push --force` if regular push fails
- For production: Ensure `appliesTo` column exists in `codes` table before go-live

## Next Steps

1. Implement backend API routes with Express
2. Add PayFast payment gateway integration
3. Set up PDF certificate generation with PDFKit
4. Configure email delivery with Nodemailer
5. Test complete purchase flow end-to-end
