# Timeless Organics — Founding 100 Investor Launch

## Overview
Timeless Organics is launching an exclusive platform for 100 founding investors (50 Founder, 50 Patron). This platform automates certificate generation, processes payments via PayFast, and issues unique lifetime benefit codes. The project's vision is to merge traditional craftsmanship with artistic independence, offering a high-end organic brand experience. It aims to provide a seamless, visually striking investment journey with unique benefits, fostering a community around artisanal organic products and targeting a sophisticated investor base.

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
- **Frontend:** Netlify (`www.timeless.organic`)
- **Backend:** Railway (`timeless-organics-fouding-100-production.up.railway.app`)
- **Database:** PostgreSQL on Supabase
- **Authentication:** Supabase Auth with OAuth (Google, GitHub, Apple) and Email. Frontend communicates with backend via `VITE_API_URL` environment variable.

**Site Structure:**
- **Unified Navigation:** Single site with consistent Header/Footer components across all pages
- **Home Page:** Hero section with Founding 100 launch message, seat cards, brand introduction sections
- **Brand Pages:** Workshops (coming Q2 2025), Commission (custom bronze services), About (David's story)
- **Conversion CTAs:** Each brand page includes "Secure Your Seat" CTA linking back to /#seats anchor
- **Checkout Flow:** Dedicated checkout page with variant Header (hides navigation, shows back button) and Footer for trust/consistency
- **Navigation Flow:** Home → Brand Pages → Back to Seats → Checkout → Dashboard

**UI/UX Decisions:**
- **Color Scheme:** Dark theme with Bronze (#a67c52), Patina (#6f8f79), and Accent Gold (#d8c3a5).
- **Typography:** Playfair Display (headings), Inter (body).
- **Animations:** Slow-moving gradient text (10-16s cycles) and crossfading smoke/fire video backgrounds (1.5s transitions) on sign-in.
- **Background:** Fixed aloe sculpture image with radial gradient overlays.
- **Buttons:** Glassy bronze with `backdrop-blur` and animated gradient overlays.
- **Header Component:** Supports checkout variant (props: variant, showNav, backHref, backLabel, context); sticky positioning with backdrop blur
- **Footer Component:** 4-column layout (Company Info, Explore Links, Legal, Newsletter Signup via InterestForm)

**Technical Implementations & Features:**
- **Authentication:** Supabase Auth for user management (Google, GitHub, Email); backend verifies JWT tokens using service role key. Google OAuth uses `prompt: 'select_account'` to force account picker.
- **Seat Sales:** Founder (R3,000) and Patron (R5,000) seats with live counters and PayFast integration. Frontend fetches actual seat prices from `/api/seats/availability` to ensure accuracy.
- **Promo Code System:** 10 FREE VIP seats via promo codes (bonus seats ON TOP of 100 paid seats, don't reduce available count). Admin generates codes, VIPs redeem at checkout (100% discount bypasses payment), dashboard shows "Complimentary VIP Seat" badge with Gift icon. Seat type matching enforced for security. FREE seats do NOT reduce the 100 paid seat inventory.
- **Specimen Style Selection:** Users choose from 12 Cape Fynbos specimen styles at checkout (Protea Head, Pincushion Bloom, Cone + Bracts, Aloe Inflorescence, Erica Spray, Restio Seedheads, Bulb Spike, Pelargonium Leaf/Flower, Woody Branch, Cone/Seed Pod, Succulent Rosette, Miniature Mix). David personally selects the finest specimen of the chosen style from current or upcoming seasonal harvest. Castings occur when specimens reach peak seasonal beauty. Required field stored in `specimenStyle` column of purchases table.
- **Mounting Option:** Optional bronze mounting service (+R10) added to checkout. Mounting style (wall mount, base, custom) chosen during production. When selected, `hasMounting` field stored in purchases table. Retail value messaging (R25-40K) highlights investment value.
- **International Shipping:** Checkbox option at checkout for international delivery (R0 upfront). Manual DHL quotes sent later. `internationalShipping` boolean flag stored in purchases table. Admin panel displays shipping flags.
- **Gift Purchasing:** Complete gift flow allowing users to purchase seats as gifts. At checkout, purchasers provide recipient email, name, and personal message. Upon payment completion, automated gift notification email sent to recipient with claim link (`/claim-gift?id=xxx`). Recipients claim gift via authenticated flow, linking purchase to their account. Gift status tracked (`pending` → `claimed`). Database fields: `isGift`, `giftRecipientEmail`, `giftRecipientName`, `giftMessage`, `giftStatus`, `claimedByUserId`, `giftClaimedAt`.
- **Purchase Mode:** Two casting timeline options at checkout: "Cast Now" (immediate casting when seasonal specimens available) vs "Wait for Season" (delayed casting for specific seasonal preferences). Stored in `purchaseMode` field. Simplifies timeline expectations for investors.
- **Production Status Tracking:** Visual dashboard (Queued → Invested → Ready to Pour → Poured & Finishing → Complete).
- **Code Generation:** Every purchase generates 3 codes for FUTURE workshops: (1) Bronze Claim Code - free bronze casting slot in future workshop; (2) Workshop Voucher - 50%/80% off ONE future workshop; (3) Lifetime Workshop - 20%/30% off ALL future workshops. All codes have `appliesTo` field.
- **Certificate Generation:** Automated PDF certificates with aloe background.
- **Email Notifications:** Seasonal messaging in confirmation and certificate emails.
- **User Dashboard:** Displays purchases, production status, codes, and downloadable certificates.
- **Admin Panel:** Provides analytics, seat tracking, purchase management, custom specimen approval, subscriber export, promo code generation, and displays mounting/international shipping flags for each purchase.
- **Database Schema:** Key tables include `users`, `seats`, `purchases` (with `hasMounting` and `internationalShipping` booleans), `codes`, `sculptures`, `promo_codes`, and `subscribers`. Legacy seasonal fields preserved for backward compatibility (30 existing purchases). New Founding 100 purchases use studio-selected approach.
- **API Endpoints:** Public for registration/seat availability; protected for purchases, sculpture selection, user dashboards, promo validation; admin for data management, specimen approval, and promo code management.
- **Payment Processing:** Secure PayFast Onsite Payments integration for in-house checkout. Critical: Requires production credentials; sandbox mode not supported for onsite.
- **Session Management:** Currently memory-based; aiming to restore PostgreSQL session storage.
- **Subscriber System:** API endpoints for managing pre-launch interest (name, email, phone).
- **Mailchimp Integration:** Automated email list sync. Pre-launch subscribers tagged "Pre-Launch Subscriber"; purchasers tagged "Founding 100 Investor" + seat type; VIP promo redemptions tagged "VIP Complimentary". Admin panel includes "Sync to Mailchimp" button for bulk-syncing existing contacts. Requires `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER`, and `MAILCHIMP_LIST_ID` environment variables.
- **Seasonal Guide:** Educational page showcasing all 12 specimen styles with seasonal availability chart. Includes updated "Future Workshop Options" section explaining date-based booking system, studio selection vs. bring-your-own options, safety net (free second casting), commission fallback options, and future bespoke/casting services.

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **PayFast:** Payment gateway for seat purchases.
- **Mailchimp:** Email marketing platform for subscriber list management and campaigns.
- **Netlify:** Frontend hosting.
- **Railway:** Backend API hosting.
- **Nodemailer:** Email delivery.
- **PDFKit:** Server-side PDF certificate generation.