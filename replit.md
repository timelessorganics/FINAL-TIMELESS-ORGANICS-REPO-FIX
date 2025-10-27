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
- **Code Generation:** Automated generation of unique bronze claim, workshop voucher (50%/80% discount), and lifetime workshop codes (20%/30% discount). Codes have an `appliesTo` field (workshop/seat/any).
- **Certificate Generation:** Automated PDF certificates with an aloe background.
- **Sculpture Gallery:** Interface for users to select bronze casting specimens from 20 diverse South African botanicals.
- **User Dashboard:** Displays purchases, codes, and downloadable certificates.
- **Admin Panel:** Provides analytics, seat tracking, purchase management, and subscriber export.
- **Database Schema:** Key tables include `users`, `seats`, `purchases`, `codes`, `sculptures`, `sculpture_selections`, `referrals`, and `subscribers`.
- **API Endpoints:** Public endpoints for registration and seat availability; protected endpoints for purchase initiation/completion, sculpture selection, and user dashboards; admin endpoints for comprehensive data management.
- **Payment Processing:** Secure PayFast integration with signature validation and dual sandbox/production credential management.
- **Session Management:** Currently uses memory-based session storage due to Supabase connection issues, but aims to restore PostgreSQL session storage.
- **Subscriber System:** Captures pre-launch interest (name, email, phone, notes) with dedicated API endpoints for administration.

## External Dependencies
- **Supabase:** PostgreSQL database hosting.
- **PayFast:** Payment gateway for processing seat purchases.
- **Netlify:** Hosting for the production frontend.
- **Nodemailer:** For email delivery (SMTP configurable).
- **PDFKit:** For server-side PDF certificate generation.
- **Replit Auth:** Authentication service.
```