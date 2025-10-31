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

**UI/UX Decisions:**
- **Color Scheme:** Dark theme with Bronze (#a67c52), Patina (#6f8f79), and Accent Gold (#d8c3a5).
- **Typography:** Playfair Display (headings), Inter (body).
- **Animations:** Slow-moving gradient text (10-16s cycles) and crossfading smoke/fire video backgrounds (1.5s transitions) on sign-in.
- **Background:** Fixed aloe sculpture image with radial gradient overlays.
- **Buttons:** Glassy bronze with `backdrop-blur` and animated gradient overlays.

**Technical Implementations & Features:**
- **Authentication:** Supabase Auth for user management; backend verifies JWT tokens using service role key.
- **Seat Sales:** Founder (R3,000) and Patron (R6,000) seats with live counters and PayFast integration.
- **Seasonal Purchase System:** Three options: "Cast Now" (studio-selected, 6-12 weeks), "Wait Till Season" (user selects style, waits for peak quality), "Provide Your Own" (custom photo upload with admin approval).
- **Specimen Organization:** Over 20 South African botanicals categorized by style (e.g., Protea Heads, Aloe Inflorescences).
- **Production Status Tracking:** Visual dashboard (Queued → Invested → Ready to Pour → Poured & Finishing → Complete).
- **Admin Approval Workflow:** UI for custom specimen review, with email notifications.
- **Code Generation:** Automated unique bronze claim, workshop voucher (50%/80% discount), and lifetime workshop codes (20%/30% discount), each with an `appliesTo` field.
- **Certificate Generation:** Automated PDF certificates with aloe background.
- **Email Notifications:** Seasonal messaging in confirmation and certificate emails.
- **User Dashboard:** Displays purchases, production status, codes, and downloadable certificates.
- **Admin Panel:** Provides analytics, seat tracking, purchase management, custom specimen approval, and subscriber export.
- **Database Schema:** Key tables include `users`, `seats`, `purchases`, `codes`, `sculptures`, and `subscribers`. `purchases` table tracks `purchaseChoice`, `specimenStyle`, `customSpecimenApprovalStatus`, etc.
- **API Endpoints:** Public for registration/seat availability; protected for purchases, sculpture selection, user dashboards; admin for data management and specimen approval.
- **Payment Processing:** Secure PayFast Onsite Payments integration for in-house checkout. Critical: Requires production credentials; sandbox mode not supported for onsite.
- **Session Management:** Currently memory-based; aiming to restore PostgreSQL session storage.
- **Subscriber System:** API endpoints for managing pre-launch interest (name, email, phone).

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **PayFast:** Payment gateway for seat purchases.
- **Netlify:** Frontend hosting.
- **Railway:** Backend API hosting.
- **Nodemailer:** Email delivery.
- **PDFKit:** Server-side PDF certificate generation.