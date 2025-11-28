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

## External Dependencies
- **Supabase:** PostgreSQL database and authentication.
- **PayFast:** Payment gateway.
- **Mailchimp:** Email marketing platform.
- **Netlify:** Frontend hosting.
- **Railway:** Backend API hosting.
- **Nodemailer:** Email delivery.
- **PDFKit:** Server-side PDF generation.