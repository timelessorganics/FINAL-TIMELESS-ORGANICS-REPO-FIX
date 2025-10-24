# Timeless Organics — Founding 100 Investor Launch

A premium dark-themed launch platform for Timeless Organics' founding investor program, featuring seat sales, unique code generation, PDF certificates, and sculpture selection.

## Project Overview

**Purpose**: Launch site for selling 100 limited founding seats (50 Founder + 50 Patron) with automated certificate generation, PayFast payment processing, and lifetime benefit codes.

**Tech Stack**: React + TypeScript + Express + PostgreSQL + Tailwind CSS + Shadcn UI

## Visual Design

The application features a stunning dark aesthetic with:
- **Colors**: Bronze (#a67c52), Patina (#6f8f79), Accent Gold (#d8c3a5)
- **Typography**: Playfair Display (headings), Inter (body)
- **Animations**: Slow-moving gradient text effects (10-16s cycles) on key elements
- **Background**: Fixed aloe sculpture image with radial gradient overlays
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
- `codes` - Unique codes (bronze_claim, workshop_voucher, lifetime_referral)
- `sculptures` - Available sculpture options with images
- `sculpture_selections` - User's chosen sculptures

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

### Workshop Voucher
- Format: `FO-40-XXXX-XXXX` (Founder) or `PA-60-XXXX-XXXX` (Patron)
- Discount: 40% (Founder) or 60% (Patron)
- Transferable, first 3-day workshop

### Lifetime Referral
- Format: `REF-LIFETIME-20%`
- 20-30% discount for referrals
- Unlimited uses, transferable for life

## PayFast Integration

- Merchant ID and Merchant Key required (to be provided)
- Sandbox/Production mode configuration
- Payment signature validation
- Return URLs for success/cancel/notify

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `PAYFAST_MERCHANT_ID` - PayFast merchant ID
- `PAYFAST_MERCHANT_KEY` - PayFast merchant key
- `PAYFAST_PASSPHRASE` - PayFast security passphrase
- `PAYFAST_MODE` - "sandbox" or "production"

Optional:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email delivery

## Recent Changes

**2025-01-24**: Initial schema and frontend implementation
- Created complete database schema with 8 tables
- Built email gate, main launch, sculpture gallery, dashboard, admin panel
- Configured dark theme with bronze/patina color palette
- Implemented animated gradient text system
- Added custom CSS for glassy bronze buttons and aloe background

## Development Notes

- Application enforces dark mode (`.dark` class on `documentElement`)
- Email gate uses localStorage to track verified status
- All gradient animations use CSS `animation` with `text-hue` keyframe
- Seat counters update in real-time from database
- Certificates generated server-side with aloe background image

## Next Steps

1. Implement backend API routes with Express
2. Add PayFast payment gateway integration
3. Set up PDF certificate generation with PDFKit
4. Configure email delivery with Nodemailer
5. Test complete purchase flow end-to-end
