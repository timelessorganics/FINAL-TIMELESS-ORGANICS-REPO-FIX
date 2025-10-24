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
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Dark background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1f1f1f');

      // Gold border
      doc.rect(15, 15, doc.page.width - 30, doc.page.height - 30)
        .lineWidth(15)
        .stroke('#e0c8a9');

      // Try to add background image (aloe)
      const bgImagePath = path.join(process.cwd(), 'attached_assets', 'Gemini_Generated_Image_9rrlvn9rrlvn9rrl (1)_1761271985174.png');
      if (fs.existsSync(bgImagePath)) {
        doc.image(bgImagePath, 150, 200, {
          width: 300,
          opacity: 0.15
        });
      }

      // Title
      doc.fontSize(48)
        .fillColor('#e0c8a9')
        .font('Helvetica-Bold')
        .text('TIMELESS ORGANICS', 40, 80, { align: 'center' });

      // Subtitle
      doc.fontSize(24)
        .fillColor('#6f8f79')
        .font('Helvetica-Bold')
        .text('OFFICIAL CERTIFICATE OF PATRONAGE', 40, 150, { align: 'center' });

      // Recognition text
      doc.fontSize(14)
        .fillColor('#999')
        .font('Helvetica')
        .text('This document formally recognizes and certifies the status of:', 40, 220, { align: 'center' });

      // Investor name
      doc.fontSize(40)
        .fillColor('#f5f5f5')
        .font('Helvetica-Bold')
        .text(userName.toUpperCase(), 40, 260, { align: 'center' });

      // Status description
      const seatName = purchase.seatType === 'founder' ? 'FOUNDER' : 'PATRON';
      doc.fontSize(16)
        .fillColor('#ccc')
        .font('Helvetica')
        .text(
          `as a founding member of the Timeless Organics initiative, having secured a prestigious ${seatName} status.`,
          40, 330, { align: 'center', width: doc.page.width - 80 }
      );

      // Codes section box
      doc.rect(80, 400, doc.page.width - 160, 200)
        .lineWidth(1)
        .stroke('#555')
        .fillColor('rgba(0, 0, 0, 0.3)');

      // Codes section title
      doc.fontSize(16)
        .fillColor('#ccc')
        .font('Helvetica-Bold')
        .text('INVESTMENT PERKS & LIFETIME CODES', 100, 415);

      // Draw horizontal line
      doc.moveTo(100, 440).lineTo(doc.page.width - 100, 440).stroke('#555');

      // Codes content
      let yPos = 455;

      // Founding Status
      doc.fontSize(11)
        .fillColor('#6f8f79')
        .font('Helvetica-Bold')
        .text('FOUNDING STATUS:', 100, yPos);
      doc.fillColor('#fff')
        .font('Helvetica')
        .text(
          `${seatName} PASS (R${(purchase.amount / 100).toFixed(0)})`,
          300, yPos
        );

      yPos += 25;

      // Each code
      codes.forEach((code) => {
        const label = code.type === 'bronze_claim' 
          ? 'GUARANTEED BRONZE CLAIM:'
          : code.type === 'workshop_voucher'
          ? `WORKSHOP VOUCHER CODE (${code.discount}% OFF):`
          : 'LIFETIME REFERRAL CODE:';

        doc.fontSize(11)
          .fillColor('#6f8f79')
          .font('Helvetica-Bold')
          .text(label, 100, yPos);

        doc.fillColor('#e0c8a9')
          .font('Courier-Bold')
          .text(code.code, 300, yPos);

        yPos += 20;
      });

      // Footer
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      doc.fontSize(10)
        .fillColor('#999')
        .font('Helvetica')
        .text(`Date Issued: ${currentDate}`, 40, doc.page.height - 120, { align: 'right' });

      // Signature line
      doc.moveTo(doc.page.width - 290, doc.page.height - 90)
        .lineTo(doc.page.width - 40, doc.page.height - 90)
        .lineWidth(2)
        .stroke('#a67c52');

      doc.fontSize(14)
        .fillColor('#fff')
        .font('Helvetica-Bold')
        .text('David Junor, Founder', 40, doc.page.height - 75, { align: 'right' });

      doc.fontSize(10)
        .fillColor('#999')
        .font('Helvetica')
        .text('Timeless Organics, Kommetjie, Cape Town', 40, doc.page.height - 55, { align: 'right' });

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
