# Timeless Organics — Founding 100 Investor Launch

## Overview
Timeless Organics is launching a premium, dark-themed platform to sell 100 limited founding investor seats (50 Founder, 50 Patron). The platform automates certificate generation, processes payments via PayFast, and issues unique lifetime benefit codes. The business vision is to blend timeless craft with artistic independence, targeting investors interested in a high-end organic brand. The project aims to create a seamless and visually stunning investment experience, offering unique benefits and fostering a community around artisanal organic products.

## User Preferences
- I prefer clear and concise explanations.
- I appreciate an iterative development approach.
- Please ask for my approval before implementing major architectural changes or feature deprecations.
- I value detailed explanations for complex technical decisions.
- Do not make changes to the `attached_assets` folder.
- Do not make changes to files related to legacy features without explicit instruction.

## System Architecture
The application uses a React + TypeScript frontend with Tailwind CSS and Shadcn UI for a stunning dark aesthetic. The backend is built with Express, connecting to a PostgreSQL database hosted on Supabase.

**Deployment Architecture:**
- **Frontend:** Hosted on Netlify at `www.timeless.organic` (static build from `main` branch)
- **Backend:** Hosted on Railway at `timeless-organics-fouding-100-production.up.railway.app` (auto-deploys from GitHub)
- **Database:** PostgreSQL on Supabase (connected via `DATABASE_URL`)
- **CRITICAL:** Netlify requires `VITE_API_URL` environment variable set to Railway backend URL for API communication
- **Auth Flow:** Replit Auth endpoints (`/api/login`, `/api/logout`) must redirect to Railway backend, not Netlify frontend
- All frontend API calls and auth redirects use `import.meta.env.VITE_API_URL` to point to Railway backend in production

**UI/UX Decisions:**
- **Color Scheme:** Dark theme with Bronze (#a67c52), Patina (#6f8f79), and Accent Gold (#d8c3a5).
- **Typography:** Playfair Display for headings and Inter for body text.
- **Animations:** Slow-moving gradient text effects (10-16s cycles) and crossfading smoke/fire video backgrounds (6 videos rotating with 1.5s transitions) on the sign-in page.
- **Background:** Fixed aloe sculpture image with radial gradient overlays.
- **Buttons:** Glassy bronze with `backdrop-blur` and animated gradient overlays.
- **Deployment:** The production domain `www.timeless.organic` is hosted on Netlify.

**Technical Implementations & Features:**
- **Authentication:** Replit Auth is used for user management.
- **Email Gate:** (Deprecated, replaced by Replit Auth).
- **Seat Sales:** Founder (R3,000) and Patron (R6,000) seats with live counters and PayFast integration.
- **Seasonal Purchase System:** Three purchase paths for bronze casting:
  - **Cast Now:** Studio-selected in-season specimen for fastest turnaround (6-12 weeks)
  - **Wait Till Season:** User selects specimen style, waits for peak seasonal quality (specimen chosen when in bloom)
  - **Provide Your Own:** Custom botanical photo upload with admin approval workflow
- **Specimen Organization:** 20+ South African botanicals organized by style categories (Protea Heads, Pincushion Blooms, Cone Bracts, Aloe Inflorescences, Erica Sprays, Restio Seedheads, Bulb Spikes, Succulent Rosettes, Fern Fronds, etc.)
- **Production Status Tracking:** Visual dashboard showing cast progress (Queued → Invested → Ready to Pour → Poured & Finishing → Complete)
- **Admin Approval Workflow:** Custom specimen review UI with approve/reject functionality, email notifications for status updates
- **Code Generation:** Automated generation of unique bronze claim, workshop voucher (50%/80% discount), and lifetime workshop codes (20%/30% discount). Codes have an `appliesTo` field (workshop/seat/any).
- **Certificate Generation:** Automated PDF certificates with aloe background and seasonal purchase details.
- **Email Notifications:** Seasonal messaging in confirmation and certificate emails based on purchase choice
- **User Dashboard:** Displays purchases, production status, seasonal batch windows, codes, and downloadable certificates.
- **Admin Panel:** Provides analytics, seat tracking, purchase management, custom specimen approval, and subscriber export.
- **Database Schema:** Key tables include `users`, `seats`, `purchases`, `codes`, `sculptures`, `sculpture_selections`, `referrals`, and `subscribers`. Purchases table includes `purchaseChoice`, `specimenStyle`, `seasonalBatchWindow`, `customSpecimenPhotoUrl`, `customSpecimenApprovalStatus`, and `productionStatus` fields.
- **API Endpoints:** Public endpoints for registration and seat availability; protected endpoints for purchase initiation/completion, sculpture selection, and user dashboards; admin endpoints for comprehensive data management including custom specimen approval (`POST /api/admin/approve-specimen/:id`, `POST /api/admin/reject-specimen/:id`).
- **Payment Processing:** Secure PayFast Onsite Payments integration with in-house checkout experience (no redirect to PayFast). Uses production endpoint with signature validation. **CRITICAL**: Onsite payments ONLY work with production credentials - sandbox mode is not supported by PayFast for onsite integration.
- **Session Management:** Currently uses memory-based session storage due to Supabase connection issues, but aims to restore PostgreSQL session storage.
- **Subscriber System:** Captures pre-launch interest (name, email, phone, notes) with dedicated API endpoints for administration.

## External Dependencies
- **Supabase:** PostgreSQL database hosting.
- **PayFast:** Payment gateway for processing seat purchases.
- **Netlify:** Hosting for the production frontend.
- **Nodemailer:** For email delivery (SMTP configurable).
- **PDFKit:** For server-side PDF certificate generation.
- **Replit Auth:** Authentication service.

## PayFast Onsite Payments Integration

### Overview
The application uses PayFast Onsite Payments to provide an in-house checkout experience. The payment modal appears as an overlay on the site instead of redirecting to PayFast.

### Critical Requirements
1. **Production Credentials Only**: PayFast Onsite Payments do NOT work with sandbox credentials. You must use production merchant credentials.
2. **HTTPS Required**: PayFast Onsite requires HTTPS (Railway provides this).
3. **PayFast Engine.js**: The script is loaded from `https://www.payfast.co.za/onsite/engine.js` in `client/index.html`.

### Environment Variables (Railway)
The following environment variables must be set on Railway with **production PayFast credentials**:
- `PAYFAST_MERCHANT_ID` - Your production merchant ID
- `PAYFAST_MERCHANT_KEY` - Your production merchant key  
- `PAYFAST_PASSPHRASE` - Your production passphrase
- `PAYFAST_MODE` - Set to `production` (onsite doesn't work in sandbox mode)
- `BACKEND_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app`)

### Integration Flow
1. User selects seat type and clicks "Proceed to Payment"
2. Frontend POSTs to `/api/purchase/initiate` with seat type
3. Backend calls PayFast API at `https://www.payfast.co.za/onsite/process` to generate payment UUID
4. Backend generates signature using production credentials
5. Frontend receives UUID and calls `window.payfast_do_onsite_payment({uuid}, callback)`
6. PayFast modal appears as overlay
7. User completes payment in modal
8. PayFast sends ITN (Instant Transaction Notification) to `/api/payment/notify`
9. Backend verifies signature and updates purchase status

### Signature Generation
The signature is generated by:
1. Building parameter string (key=value pairs separated by &)
2. URL-encoding all values and replacing %20 with +
3. Skipping empty fields and 'signature'/'passphrase' fields
4. Appending passphrase at the end: `&passphrase=YOUR_PASSPHRASE`
5. Generating MD5 hash of the complete string

**Important**: The passphrase is used for signature generation but must NOT be sent as a field in the request to PayFast.

### Testing
- **Development**: Signature validation will fail if using sandbox credentials
- **Production**: Must use production credentials on Railway for onsite payments to work
- The integration is implemented in:
  - `server/utils/payfast-onsite.ts` - UUID generation
  - `server/utils/payfast.ts` - Signature generation and payment data
  - `client/src/pages/checkout.tsx` - Frontend modal trigger

### Troubleshooting
- **"Generated signature does not match submitted signature"**: Verify production credentials are correct
- **400 Bad Request from PayFast**: Check that passphrase is not being sent as a field, only used for signature
- **Modal not appearing**: Ensure engine.js script is loaded and production credentials are set
```