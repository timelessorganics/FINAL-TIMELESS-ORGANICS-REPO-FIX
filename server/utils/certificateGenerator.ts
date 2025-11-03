import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { Purchase, Code } from "@shared/schema";

export async function generateCertificate(
  purchase: Purchase,
  codes: Code[],
  userName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create certificates directory if it doesn't exist
      const certDir = path.join(process.cwd(), "certificates");
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      const fileName = `certificate-${purchase.id}.pdf`;
      const filePath = path.join(certDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 60, right: 60 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Site colors
      const BRONZE = '#a67c52';
      const PATINA = '#6f8f79';
      const ACCENT_GOLD = '#d8c3a5';
      const DARK_BG = '#0a0a0a';
      const CARD_BG = '#1a1a1a';

      // Dark background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK_BG);

      // Full-page translucent aloe background
      const aloeImagePath = path.join(process.cwd(), 'attached_assets', 'aloe-certificate-background.png');
      if (fs.existsSync(aloeImagePath)) {
        doc.save();
        doc.opacity(0.15);
        // Center the image and scale to fit page
        const imgWidth = doc.page.width * 0.7;
        const imgX = (doc.page.width - imgWidth) / 2;
        const imgY = 100;
        doc.image(aloeImagePath, imgX, imgY, {
          width: imgWidth,
          align: 'center'
        });
        doc.restore();
      }

      // Bronze border frame
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(2)
        .stroke(BRONZE);

      // Inner accent frame
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .stroke(ACCENT_GOLD);

      // Title - Playfair-style serif
      doc.fontSize(52)
        .fillColor(ACCENT_GOLD)
        .font('Times-Bold')
        .text('TIMELESS ORGANICS', 60, 90, { align: 'center', width: doc.page.width - 120 });

      // Subtitle
      doc.fontSize(18)
        .fillColor(PATINA)
        .font('Times-Roman')
        .text('Official Certificate of Investment', 60, 160, { align: 'center', width: doc.page.width - 120 });

      // Decorative line
      const lineY = 195;
      doc.moveTo(doc.page.width / 2 - 80, lineY)
        .lineTo(doc.page.width / 2 + 80, lineY)
        .lineWidth(1)
        .stroke(BRONZE);

      // Recognition text
      doc.fontSize(13)
        .fillColor('#999999')
        .font('Helvetica')
        .text('This document certifies that', 60, 230, { align: 'center', width: doc.page.width - 120 });

      // Investor name - large serif
      doc.fontSize(44)
        .fillColor('#ffffff')
        .font('Times-Bold')
        .text(userName.toUpperCase(), 60, 265, { align: 'center', width: doc.page.width - 120 });

      // Status description
      const seatName = purchase.seatType === 'founder' ? 'Founder' : 'Patron';
      const seatPrice = purchase.seatType === 'founder' ? 'R3,000' : 'R5,000';
      
      doc.fontSize(15)
        .fillColor('#cccccc')
        .font('Helvetica')
        .text(
          `has secured a ${seatName} Pass (${seatPrice}) in the Founding 100,`,
          60, 330, { align: 'center', width: doc.page.width - 120 }
      );
      
      doc.text(
        'investing in the final fit-out of Timeless Organics foundry.',
        60, 355, { align: 'center', width: doc.page.width - 120 }
      );

      // Benefits section box
      const boxTop = 400;
      doc.rect(80, boxTop, doc.page.width - 160, 200)
        .fillAndStroke('rgba(26, 26, 26, 0.8)', BRONZE);

      // Benefits title
      doc.fontSize(18)
        .fillColor(ACCENT_GOLD)
        .font('Times-Bold')
        .text('LIFETIME INVESTMENT BENEFITS', 100, boxTop + 25, { width: doc.page.width - 200, align: 'center' });

      // Divider
      doc.moveTo(120, boxTop + 58)
        .lineTo(doc.page.width - 120, boxTop + 58)
        .lineWidth(0.5)
        .stroke(BRONZE);

      // Benefits list (elegant, no codes)
      let yPos = boxTop + 75;
      const lineHeight = 28;

      // Signed bronze sculpture
      doc.fontSize(12)
        .fillColor(BRONZE)
        .font('Helvetica-Bold')
        .text('• ', 120, yPos);
      
      doc.fillColor('#e8e8e8')
        .font('Helvetica')
        .text('One signed bronze botanical sculpture, cast from your chosen specimen', 135, yPos, { width: doc.page.width - 255 });
      yPos += lineHeight;

      // Workshop access
      const workshopDiscount = purchase.seatType === 'founder' ? '50%' : '80%';
      doc.fontSize(12)
        .fillColor(PATINA)
        .font('Helvetica-Bold')
        .text('• ', 120, yPos);
      
      doc.fillColor('#e8e8e8')
        .font('Helvetica')
        .text(`One-time workshop experience voucher (${workshopDiscount} discount, transferable)`, 135, yPos, { width: doc.page.width - 255 });
      yPos += lineHeight;

      // Lifetime privileges
      const lifetimeDiscount = purchase.seatType === 'founder' ? '20%' : '30%';
      doc.fontSize(12)
        .fillColor(ACCENT_GOLD)
        .font('Helvetica-Bold')
        .text('• ', 120, yPos);
      
      doc.fillColor('#e8e8e8')
        .font('Helvetica')
        .text(`Lifetime workshop access privileges (${lifetimeDiscount} discount, unlimited use)`, 135, yPos, { width: doc.page.width - 255 });
      yPos += lineHeight;

      // Studio access
      doc.fontSize(12)
        .fillColor(BRONZE)
        .font('Helvetica-Bold')
        .text('• ', 120, yPos);
      
      doc.fillColor('#e8e8e8')
        .font('Helvetica')
        .text('Priority studio access and exclusive founder events', 135, yPos, { width: doc.page.width - 255 });

      // Footer - Date and signature
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Date
      doc.fontSize(10)
        .fillColor('#999999')
        .font('Helvetica')
        .text(`Issued ${currentDate}`, 60, doc.page.height - 110, { align: 'center', width: doc.page.width - 120 });

      // Signature line
      const sigY = doc.page.height - 80;
      doc.moveTo(doc.page.width - 280, sigY)
        .lineTo(doc.page.width - 60, sigY)
        .lineWidth(1)
        .stroke(BRONZE);

      // Founder signature
      doc.fontSize(14)
        .fillColor(BRONZE)
        .font('Times-Italic')
        .text('David Junor', doc.page.width - 280, sigY + 10, { width: 220, align: 'center' });

      doc.fontSize(9)
        .fillColor('#999999')
        .font('Helvetica')
        .text('Founder, Timeless Organics', doc.page.width - 280, sigY + 30, { width: 220, align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(`/certificates/${fileName}`);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}
