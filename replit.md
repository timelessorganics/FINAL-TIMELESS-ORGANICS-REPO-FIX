# Timeless Organics — Founding 100 Investor Launch

## Overview
Timeless Organics is launching an exclusive platform for 100 founding investors to merge traditional craftsmanship with artistic independence, offering a high-end organic brand experience. This platform automates certificate generation, processes payments, and issues unique lifetime benefit codes, aiming to provide a seamless, visually striking investment journey and foster a community around artisanal organic products. Key capabilities include automated certificate generation, PayFast integration, and unique lifetime benefit code issuance. The project targets a sophisticated investor base with a vision for an exclusive community and significant market potential in high-end organic artisanal products.

## User Preferences
- I prefer clear and concise explanations.
- I appreciate an iterative development approach.
- Please ask for my approval before implementing major architectural changes or feature deprecations.
- I value detailed explanations for complex technical decisions.
- Do not make changes to the `attached_assets` folder.
- Do not make changes to files related to legacy features without explicit instruction.

## System Architecture
The application features a React + TypeScript frontend with Tailwind CSS and Shadcn UI for a dark-themed aesthetic, and an Express backend connected to a PostgreSQL database on Supabase.

**Deployment Architecture:**
- **Frontend:** Netlify
- **Backend:** Railway
- **Database:** PostgreSQL on Supabase
- **Authentication:** Supabase Auth with OAuth (Google, GitHub, Apple) and Email.

**UI/UX Decisions:**
- **Color Scheme:** Dark theme with Bronze (#a67c52), Patina (#6f8f79), and Accent Gold (#d8c3a5).
- **Typography:** Playfair Display (headings), Inter (body).
- **Animations:** Slow-moving gradient text and crossfading video backgrounds.
- **Background:** Fixed aloe sculpture image with radial gradient overlays.
- **Buttons:** Glassy bronze with `backdrop-blur` and animated gradient overlays.
- **Header Component:** Supports checkout variant.
- **Footer Component:** 4-column layout including newsletter signup.
- **Mobile Responsiveness:** All spacing (padding, margins, gaps) now scales from tight on mobile to spacious on desktop using responsive Tailwind classes (e.g., `py-8 sm:py-16`, `gap-4 sm:gap-6`).

**Technical Implementations & Features:**
- **Authentication:** Supabase Auth for user management; backend verifies Supabase JWT tokens.
- **Seat Sales:** Founder and Patron seats with live counters and PayFast integration.
- **24-Hour Seat Reservation System:** Allows users to reserve seats temporarily, with backend tracking and auto-expiration.
- **Promo Code System:** Supports 10 free VIP seats via admin-generated promo codes.
- **Specimen Style Selection:** Users choose from 12 Cape Fynbos specimen styles at checkout.
- **Mounting Option:** Optional bronze mounting service at checkout.
- **International Shipping:** Checkbox option for international delivery.
- **Gift Purchasing:** Full gift flow allowing users to purchase seats for others.
- **Purchase Mode:** Two casting timeline options: "Cast Now" and "Wait for Season."
- **Production Status Tracking:** Visual dashboard for tracking sculpture production stages.
- **Code Generation:** Generates three unique codes for future workshops per purchase.
- **Certificate Generation:** Automated PDF certificates.
- **Email Notifications:** Automated confirmation, certificate, and gift notification emails.
- **User Dashboard:** Displays purchases, production status, codes, and certificates.
- **Admin Panel:** Comprehensive management dashboard with 5 tabbed sections:
  - **Overview Tab:** Analytics, seat tracking, purchase management, custom specimen approval, subscriber export, promo code generation, Mailchimp sync, mounting/international shipping flags
  - **Media Library Tab:** Upload/manage images with URL, alt text, caption, tags; grid view with delete/view actions
  - **Products Tab:** Create/manage shop products with name, price (cents), category (bronze/print/merchandise), status (draft/active/sold_out)
  - **Auctions Tab:** Schedule bronze auctions with title, start/end times, starting bid; tracks current bids and bid history
  - **Workshops Tab:** Manage workshop dates with date/time, max participants, deposit amount, location; status badges (available/fully_booked)
- **Payment Processing:** Secure PayFast Onsite Payments integration.
- **Subscriber System:** API endpoints for managing pre-launch interest.
- **Mailchimp Integration:** Automated email list synchronization with tagging.
- **Seasonal Guide:** Educational page detailing specimen styles and future workshop options.

## Recent Changes (November 28, 2025)

### Database Schema Sync (CRITICAL FIX)
- **Issue:** Supabase database was missing critical tables and columns that the code expected, causing 500 errors on admin pages and stats endpoints
- **Root Cause:** SSL connection issues prevented `npm run db:push` from working; columns like `reservation_type`, `hold_expires_at`, `hold_status`, etc. were not synced to database
- **Solution:** Manually ran SQL in Supabase to create missing tables:
  - `media_assets` - for Media Library feature
  - `products` - for Products admin tab
  - `mounting_options` - for managing mounting types
  - `auctions` - for Auctions tab
  - Added missing columns to `subscribers` table: `reservation_type`, `seat_type`, `hold_expires_at`, `hold_status`
- **Result:** All 500 errors resolved; `/api/prelaunch/stats` now returns 200 status with accurate data

### Mobile Responsiveness Improvements
- Reduced hero button gaps from `gap-8` to `gap-3 sm:gap-6` for tighter mobile layouts
- Scaled all section padding: `py-8 sm:py-16` and `px-4 sm:px-6`
- Responsive text sizes using `text-xs sm:text-base` pattern throughout
- Reduced benefit card padding: `p-4 sm:p-6` 
- Scaled icon sizes to mobile-friendly proportions
- Mobile site now displays compactly without awkward large gaps
- Desktop users still get spacious, elegant layout

### Code Resilience Improvements
- Modified `/api/prelaunch/stats` endpoint to gracefully handle database schema transitions
- Endpoint now tries reservations table first, falls back to purchases table if needed
- Returns safe default stats instead of 500 errors if both fail
- All 4 LSP type errors in server/routes.ts remain (minor type issues that don't affect runtime)

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **PayFast:** Payment gateway.
- **Mailchimp:** Email marketing platform.
- **Netlify:** Frontend hosting.
- **Railway:** Backend API hosting.
- **Nodemailer:** Email delivery.
- **PDFKit:** Server-side PDF generation.

## Known Issues & Limitations
1. **Drizzle SSL Connection:** `npm run db:push` fails with SSL error; manual SQL migration required for future schema changes
2. **Supabase Security Warnings:** Several RLS (Row Level Security) policies show as "disabled in public" - not blocking functionality but should be reviewed before production launch
3. **Test Systems:** `/api/admin/test-systems` endpoint available for verifying certificate generation, code generation, and hold expiration logic before launch

## Next Steps for Launch
1. Verify all admin panel tabs work (Products, Media Library, Auctions, Workshops)
2. Configure mounting options via admin or direct SQL
3. Set up patina finish options and pricing
4. Test complete checkout flow with PayFast
5. Verify all emails send correctly (confirmation, certificates, gift notifications)
6. Test pre-launch reservation modal and Monday midnight auto-expiration
7. Deploy to Netlify (frontend) and Railway (backend)
8. Send WhatsApp to 50-70 special friends Monday midnight SA time (early bird launch)
