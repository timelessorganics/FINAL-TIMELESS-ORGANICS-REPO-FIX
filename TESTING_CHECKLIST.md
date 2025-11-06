# Timeless Organics - Email & Certificate Testing Checklist

## ✅ Status Update
- **Mailchimp Integration**: ✅ CONFIGURED AND WORKING
- **SMTP Email**: ✅ CONFIGURED (Gmail: studio@timeless.organic)
- **Test Promo Code**: ✅ CREATED (Code: TESTEMAIL, 100% off Patron seat)

---

## 🧪 Manual Testing Steps

### Test 1: Subscriber Form → Mailchimp Sync
1. Go to your live site: **www.timeless.organic**
2. Scroll down to the "Register Interest" form
3. Fill in:
   - Name: Your Name
   - Email: **studio@timeless.organic** (or another email you can check)
   - Phone: +27 82 123 4567
4. Submit the form
5. **Expected Results**:
   - ✅ Success message appears
   - ✅ Check your Mailchimp audience for new contact tagged "Pre-Launch Subscriber"

---

### Test 2: Free VIP Purchase with Promo Code
1. Go to **www.timeless.organic/founding100**
2. Click "Secure Your Patron Seat"
3. Sign in with Google (use studio@timeless.organic or your own email)
4. Fill in the checkout form:
   - **Specimen Style**: Select any style (e.g., "Protea Head")
   - **Delivery Name**: Test User
   - **Delivery Phone**: +27 82 123 4567
   - **Delivery Address**: 123 Test St, Cape Town, 8001
   - **Mounting**: Check or uncheck as desired
   - **International Shipping**: Check or uncheck as desired
5. Enter Promo Code: **TESTEMAIL**
6. Click "Apply Promo Code"
7. **Expected**: Price drops to R0 (100% discount)
8. Click "Complete Purchase"
9. **Expected Results**:
   - ✅ Purchase completes WITHOUT PayFast payment
   - ✅ Redirect to dashboard
   - ✅ Dashboard shows your purchase with "Complimentary VIP Seat" badge
   - ✅ 3 codes displayed: Bronze Claim, Workshop Voucher, Lifetime Workshop
   - ✅ Certificate PDF available for download

---

### Test 3: Email Verification
**Check inbox: studio@timeless.organic**

You should receive 2 emails:

#### Email 1: Purchase Confirmation
- **From**: Timeless Organics <studio@timeless.organic>
- **Subject**: "Welcome to the Founding 100 - Your [Patron] Investment Confirmed"
- **Content Should Include**:
  - ✅ Chosen specimen style (e.g., "Protea Head")
  - ✅ Delivery details
  - ✅ Mounting option (if selected)
  - ✅ International shipping note (if selected)
  - ✅ Production status tracker

#### Email 2: Certificate & Codes
- **From**: Timeless Organics <studio@timeless.organic>
- **Subject**: "Your Founding 100 Certificate & Lifetime Codes"
- **Content Should Include**:
  - ✅ PDF Certificate attachment
  - ✅ Workshop Voucher code (80% off for Patron)
  - ✅ Lifetime Workshop code (30% off for Patron)
  - ✅ Bronze Claim code
  - ✅ Chosen specimen style mentioned

---

### Test 4: Certificate PDF Quality Check
1. Download the certificate PDF from the email or dashboard
2. **Verify**:
   - ✅ Aloe background image renders correctly
   - ✅ Your name appears correctly
   - ✅ Seat type (Founder/Patron) is correct
   - ✅ Certificate number is unique
   - ✅ Date is correct
   - ✅ All text is readable and properly formatted

---

### Test 5: Mailchimp Tags Check
1. Go to your Mailchimp account
2. Find the contact: studio@timeless.organic
3. **Expected Tags**:
   - ✅ "Founding 100 Investor"
   - ✅ "VIP Complimentary" (since you used promo code)
   - ✅ "patron" (your seat type)

---

### Test 6: Admin Panel Bulk Sync
1. Sign in to **www.timeless.organic**
2. Navigate to **/admin** (if you're an admin user)
3. Click "Sync to Mailchimp" button
4. **Expected**:
   - ✅ Success message
   - ✅ All subscribers and purchasers synced to Mailchimp
   - ✅ Check Mailchimp for updated contacts with correct tags

---

## 🚨 Troubleshooting

### If you don't receive emails:
1. Check spam/junk folder
2. Verify Railway has all 4 SMTP variables:
   - SMTP_HOST=smtp.gmail.com
   - SMTP_PORT=587
   - SMTP_USER=studio@timeless.organic
   - SMTP_PASS=hceglgyxirbkaooni
3. Check Railway deployment logs for email errors

### If Mailchimp doesn't sync:
1. Verify Railway has all 3 Mailchimp variables:
   - MAILCHIMP_API_KEY=0c6d046e1fa4e42229d949b2674dae-us2
   - MAILCHIMP_SERVER=us2
   - MAILCHIMP_LIST_ID=033fba3160
2. Check Railway logs for "[Mailchimp]" messages

### If certificate doesn't generate:
1. Check Railway logs for PDF generation errors
2. Verify purchase status is "completed" in database
3. Check dashboard for certificate download link

---

## 📝 Notes
- Promo code **TESTEMAIL** can only be used ONCE (it's for testing)
- All emails will be sent to the email address you used during checkout
- Certificates are stored in the database and can be re-downloaded from dashboard
- Code slips are also generated as PDFs (bronze claim, workshop vouchers)

---

## ✅ Success Criteria
After completing all tests, you should have:
1. ✅ Subscriber added to Mailchimp with correct tag
2. ✅ Purchase completed with VIP badge
3. ✅ 2 emails received with all details
4. ✅ Certificate PDF downloaded and verified
5. ✅ 3 codes visible on dashboard
6. ✅ Mailchimp contact updated with investor tags
