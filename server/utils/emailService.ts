import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { Purchase, Code } from "@shared/schema";

// Email service configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Get email configuration from environment
function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn("Email configuration not complete. Emails will not be sent.");
    return null;
  }

  return {
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  };
}

// Create transporter (singleton)
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();
  if (!config) {
    return null;
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
}

// Send certificate to gift recipient when they claim (or auto-send option)
export async function sendCertificateToRecipient(
  recipientEmail: string,
  recipientName: string,
  certificateUrl: string,
  seatType: string
): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log("Email service not configured. Skipping certificate email to recipient.");
    return false;
  }

  try {
    const seatName = seatType === "founder" ? "Founder" : "Patron";
    const baseUrl = process.env.VITE_API_URL || 'https://timeless-organics-fouding-100-production.up.railway.app';
    const fullCertificateUrl = `${baseUrl}${certificateUrl}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Georgia', serif; background-color: #0a0a0a; color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border: 2px solid #a67c52; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #a67c52 0%, #6f8f79 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; font-size: 28px; margin: 0; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #a67c52 0%, #8a6542 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { background: #0a0a0a; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Your Certificate is Ready</h1>
    </div>
    <div class="content">
      <p>Dear ${recipientName},</p>
      <p>Thank you for claiming your ${seatName} seat in the Timeless Organics Founding 100!</p>
      <p>Your official certificate of investment is now ready for download. This beautiful document certifies your lifetime investment in artisanal bronze sculpture.</p>
      <center>
        <a href="${fullCertificateUrl}" class="cta-button">Download Your Certificate</a>
      </center>
      <p style="color: #999; font-size: 14px;">You can download your certificate anytime from your dashboard.</p>
    </div>
    <div class="footer">
      <p>Timeless Organics<br>With gratitude,<br>David van Heerden</p>
    </div>
  </div>
</body>
</html>
    `;

    await transport.sendMail({
      from: `"Timeless Organics" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      cc: 'studio@timeless.organic',
      subject: `Your ${seatName} Certificate is Ready - Timeless Organics`,
      html,
    });

    console.log(`Certificate sent to ${recipientEmail} (CC: studio@timeless.organic)`);
    return true;
  } catch (error: any) {
    console.error("Failed to send certificate to recipient:", error);
    return false;
  }
}

export async function sendGiftNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  seatType: string,
  message: string,
  purchaseId: string
): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log("Email service not configured. Skipping gift notification email.");
    return false;
  }

  try {
    const seatName = seatType === "founder" ? "Founder" : "Patron";
    const apiUrl = process.env.VITE_API_URL || 'https://timeless-organics-fouding-100-production.up.railway.app';
    const claimUrl = `${apiUrl.replace('/api', '')}/claim-gift?id=${purchaseId}`;

    const subject = `${senderName} has gifted you a Timeless Organics ${seatName} Seat`;

    const text = `
Dear ${recipientName},

You've received an incredible gift from ${senderName}!

${message ? `Their message to you:\n"${message}"\n` : ''}
You've been gifted a ${seatName} seat in the exclusive Founding 100 of Timeless Organics. This is a lifetime investment in artisanal bronze sculpture, featuring a hand-selected Cape Fynbos specimen cast in bronze by David van Heerden.

Your ${seatName} seat includes:
- One bespoke bronze Cape Fynbos sculpture
- Certificate of authenticity
- Exclusive workshop vouchers
- Lifetime workshop discounts

To claim your gift and select your specimen style, visit:
${claimUrl}

This is a limited-time invitation. The Founding 100 is closing soon, and your seat is reserved.

With gratitude,
David van Heerden
Timeless Organics
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #a67c52 0%, #6f8f79 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
    .message-box { background: #f8f5f0; border-left: 4px solid #a67c52; padding: 20px; margin: 25px 0; border-radius: 4px; font-style: italic; }
    .benefits { background: #fafafa; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .benefits h3 { margin-top: 0; color: #a67c52; }
    .benefits ul { margin: 0; padding-left: 20px; }
    .benefits li { margin: 8px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #a67c52 0%, #8b6847 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 25px 0; }
    .cta-button:hover { background: linear-gradient(135deg, #8b6847 0%, #a67c52 100%); }
    .footer { text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎁 You've Received a Gift</h1>
  </div>
  
  <div class="content">
    <p>Dear ${recipientName},</p>
    
    <p><strong>${senderName}</strong> has gifted you something extraordinary.</p>
    
    ${message ? `<div class="message-box">"${message}"</div>` : ''}
    
    <p>You've been gifted a <strong>${seatName} seat</strong> in the exclusive <strong>Founding 100</strong> of Timeless Organics. This is a lifetime investment in artisanal bronze sculpture, featuring a hand-selected Cape Fynbos specimen cast in bronze by master craftsman David van Heerden.</p>
    
    <div class="benefits">
      <h3>Your ${seatName} Seat Includes:</h3>
      <ul>
        <li>One bespoke bronze Cape Fynbos sculpture (your choice of 12 specimen styles)</li>
        <li>Certificate of authenticity signed by David</li>
        <li>Exclusive workshop vouchers (${seatType === 'founder' ? '80%' : '50%'} off first workshop)</li>
        <li>Lifetime workshop discounts (${seatType === 'founder' ? '30%' : '20%'} off all future workshops)</li>
      </ul>
    </div>
    
    <center>
      <a href="${claimUrl}" class="cta-button">Claim Your Gift & Choose Specimen</a>
    </center>
    
    <p style="color: #d8704d; font-weight: 600; text-align: center;">⏰ The Founding 100 is closing soon. Claim your seat today.</p>
    
    <div class="footer">
      <p>With gratitude,<br><strong>David van Heerden</strong><br>Timeless Organics</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await transport.sendMail({
      from: '"Timeless Organics" <studio@timeless.organic>',
      to: recipientEmail,
      cc: 'studio@timeless.organic',
      subject,
      text,
      html,
    });

    console.log(`Gift notification email sent to ${recipientEmail} (CC: studio@timeless.organic) for purchase ${purchaseId}`);
    return true;
  } catch (error: any) {
    console.error("Failed to send gift notification email:", error);
    return false;
  }
}

// Send certificate email to user with both certificate and code slips
export async function sendCertificateEmail(
  userEmail: string,
  userName: string,
  purchase: Purchase,
  codes: Code[],
  certificateUrl: string,
  codeSlipsUrl?: string
): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log("Email service not configured. Skipping certificate email.");
    return false;
  }

  try {
    const seatName = purchase.seatType === "founder" ? "Founder" : "Patron";
    const workshopCode = codes.find((c) => c.type === "workshop_voucher");
    const lifetimeWorkshopCode = codes.find((c) => c.type === "lifetime_workshop");

    // Build full certificate URL - use production URL if available
    const baseUrl = process.env.VITE_API_URL || process.env.REPLIT_DEV_DOMAIN || 'https://timeless-organics-fouding-100-production.up.railway.app';
    const fullCertificateUrl = `${baseUrl}${certificateUrl}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Georgia', serif;
      background-color: #0a0a0a;
      color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1a1a1a;
      border: 2px solid #a67c52;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #a67c52 0%, #6f8f79 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 32px;
      margin: 0;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #d8c3a5;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      line-height: 1.6;
      color: #cccccc;
      font-size: 16px;
    }
    .code-box {
      background: #0a0a0a;
      border: 1px solid #a67c52;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
    }
    .code-label {
      color: #6f8f79;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .code-value {
      color: #d8c3a5;
      font-size: 20px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }
    .code-description {
      color: #999;
      font-size: 14px;
      margin-top: 5px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #a67c52 0%, #8a6542 100%);
      color: #ffffff;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background: #0a0a0a;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TIMELESS ORGANICS</h1>
      <p style="color: #fff; margin: 10px 0 0 0;">Certificate of Patronage</p>
    </div>
    
    <div class="content">
      <h2>Welcome to the Founding 100, ${userName}!</h2>
      
      <p>Congratulations on securing your <strong>${seatName} seat</strong>. Your investment is now part of our foundry's history, and your bronze casting awaits.</p>
      
      <h2 style="color: #d8c3a5; font-size: 20px; margin-top: 30px;">📜 Your Investment Documents</h2>
      
      <p>We've prepared two beautiful documents for you:</p>
      
      <div class="code-box" style="background: rgba(111, 143, 121, 0.1); border-color: #6f8f79;">
        <div class="code-label" style="color: #6f8f79;">Official Certificate</div>
        <div class="code-description" style="margin-top: 10px; margin-bottom: 15px;">
          Your elegant certificate of investment — free of codes, designed to be framed and cherished. This document celebrates your role as a founding patron.
        </div>
        <div style="text-align: center;">
          <a href="${fullCertificateUrl}" class="cta-button" style="display: inline-block; font-size: 14px; padding: 12px 24px;">Download Certificate</a>
        </div>
      </div>
      
      ${codeSlipsUrl ? `
      <div class="code-box" style="background: rgba(166, 124, 82, 0.1); border-color: #a67c52;">
        <div class="code-label" style="color: #a67c52;">Workshop Access Codes</div>
        <div class="code-description" style="margin-top: 10px; margin-bottom: 15px;">
          Beautiful printable gift cards containing your workshop voucher codes. Print and cut along the dotted lines — perfect for gifting to friends and family.
        </div>
        <div style="text-align: center;">
          <a href="${baseUrl}${codeSlipsUrl}" class="cta-button" style="display: inline-block; font-size: 14px; padding: 12px 24px; background: linear-gradient(135deg, #6f8f79 0%, #5a7563 100%);">Download Code Slips</a>
        </div>
      </div>
      ` : ''}
      
      <p style="color: #999; font-size: 14px; font-style: italic; margin-top: 20px;">
        💡 <strong>Tip:</strong> Your code slips are designed as gift vouchers. The one-time workshop voucher is transferable — perfect for introducing someone special to the art of bronze casting.
      </p>
      
      <h2>Your Specimen Selection</h2>
      
      ${purchase.specimenStyle ? `
      <p><strong>Your Chosen Style:</strong> ${purchase.specimenStyle.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
      <p>David will personally select the finest specimen of your chosen style from the current or upcoming seasonal harvest. If your style is currently in peak season, we'll begin casting immediately. Otherwise, we'll immortalize it when it reaches its prime - worth the wait for perfection!</p>
      <p style="color: #999; font-size: 14px;">You'll receive updates as your bronze moves through production status changes.</p>
      ` : ''}
      
      <h2>Next Steps</h2>
      
      <p><strong>1. Track Your Production:</strong> Log in to your dashboard to see your bronze's production status (Queued → Invested → Ready to Pour → Poured & Finishing → Complete).</p>
      
      <p><strong>2. Schedule Your Workshop:</strong> Use your voucher code to book a 2-day lost-wax casting workshop at our Kommetjie studio.</p>
      
      <p><strong>3. Claim Your Bronze:</strong> Present your bronze claim code when you're ready to receive your finished casting.</p>
      
      <p style="margin-top: 30px;">Thank you for believing in our vision. Your investment allows us to complete our foundry fit-out and share the ancient art of bronze casting.</p>
      
      <p style="color: #6f8f79; font-style: italic;">— The Timeless Organics Team</p>
    </div>
    
    <div class="footer">
      <p>Timeless Organics<br>
      Kommetjie, Cape Town<br>
      South Africa</p>
      <p style="margin-top: 10px; font-size: 12px;">
        This email was sent because you completed a purchase on our Founding 100 launch platform.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const info = await transport.sendMail({
      from: `"Timeless Organics" <${process.env.SMTP_USER}>`,
      to: userEmail,
      cc: 'studio@timeless.organic',
      subject: `Welcome to the Founding 100 - Your ${seatName} Certificate`,
      html: htmlContent,
    });

    console.log("Certificate email sent successfully to", userEmail, "and CC'd to studio@timeless.organic:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send certificate email:", error);
    return false;
  }
}

// Send purchase confirmation email
export async function sendPurchaseConfirmationEmail(
  userEmail: string,
  userName: string,
  purchase: Purchase
): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log("Email service not configured. Skipping confirmation email.");
    return false;
  }

  try {
    const seatName = purchase.seatType === "founder" ? "Founder" : "Patron";
    const amount = (purchase.amount / 100).toLocaleString();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Georgia', serif;
      background-color: #0a0a0a;
      color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1a1a1a;
      border: 2px solid #a67c52;
      border-radius: 8px;
    }
    .header {
      background: linear-gradient(135deg, #a67c52 0%, #6f8f79 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 32px;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      line-height: 1.6;
      color: #cccccc;
    }
    .footer {
      background: #0a0a0a;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed</h1>
    </div>
    
    <div class="content">
      <p>Dear ${userName},</p>
      
      <p>Thank you for your purchase! We've received your payment of <strong>R${amount}</strong> for a <strong>${seatName} seat</strong>.</p>
      
      <h2 style="color: #d8c3a5; font-size: 20px; margin-top: 30px;">Your Specimen Selection</h2>
      
      ${purchase.specimenStyle ? `
      <p><strong>Your Chosen Style:</strong> ${purchase.specimenStyle.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
      <p>David will personally select the finest specimen of your chosen style from the current or upcoming seasonal harvest. If your style is currently in peak season, we'll begin casting immediately. Otherwise, we'll immortalize it when it reaches its prime - worth the wait for perfection!</p>
      <p style="color: #999; font-size: 14px;">You'll receive updates as your bronze moves through production: Investment → Ready to Pour → Poured & Finishing → Complete.</p>
      ` : ''}
      
      <p>Your certificate and exclusive codes are being generated. You'll receive another email shortly with:</p>
      
      <ul style="color: #d8c3a5;">
        <li>Your official Certificate of Patronage (PDF)</li>
        <li>Bronze claim code</li>
        <li>Workshop voucher code (${purchase.seatType === "founder" ? "50%" : "80%"} discount)</li>
        <li>Lifetime workshop discount code (${purchase.seatType === "founder" ? "20%" : "30%"} discount)</li>
      </ul>
      
      <p>In the meantime, you can log in to your dashboard to track your production status and view your investment details.</p>
      
      <p style="margin-top: 30px; color: #6f8f79; font-style: italic;">— The Timeless Organics Team</p>
    </div>
    
    <div class="footer">
      <p>Timeless Organics | Kommetjie, Cape Town</p>
    </div>
  </div>
</body>
</html>
    `;

    const info = await transport.sendMail({
      from: `"Timeless Organics" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Payment Confirmed - Timeless Organics",
      html: htmlContent,
    });

    console.log("Confirmation email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return false;
  }
}
