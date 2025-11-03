import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { Purchase, Code } from "@shared/schema";

export async function generateCodeSlips(
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

      const fileName = `code-slips-${purchase.id}.pdf`;
      const filePath = path.join(certDir, fileName);

      // Create PDF document (smaller size for gift cards)
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 30, bottom: 30, left: 30, right: 30 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Site colors
      const BRONZE = '#a67c52';
      const PATINA = '#6f8f79';
      const ACCENT_GOLD = '#d8c3a5';
      const DARK_BG = '#0a0a0a';
      const CARD_BG = '#1a1a1a';

      // Page background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK_BG);

      // Header
      doc.fontSize(32)
        .fillColor(ACCENT_GOLD)
        .font('Times-Bold')
        .text('TIMELESS ORGANICS', 50, 50, { align: 'center', width: doc.page.width - 100 });

      doc.fontSize(14)
        .fillColor(PATINA)
        .font('Times-Roman')
        .text('Founding 100 — Workshop Access Codes', 50, 95, { align: 'center', width: doc.page.width - 100 });

      // Decorative line
      doc.moveTo(50, 130)
        .lineTo(doc.page.width - 50, 130)
        .lineWidth(1)
        .stroke(BRONZE);

      // Instructions
      doc.fontSize(11)
        .fillColor('#999999')
        .font('Helvetica')
        .text(
          'These codes are your lifetime workshop access benefits. Each code can be gifted to friends and family.',
          50, 150, { align: 'center', width: doc.page.width - 100 }
        );

      doc.text(
        'Print and cut along the dotted lines to create beautiful gift vouchers.',
        50, 175, { align: 'center', width: doc.page.width - 100 }
        );

      let yPos = 220;
      const cardHeight = 180;
      const cardMargin = 20;

      // Workshop Voucher Card
      const workshopCode = codes.find((c) => c.type === 'workshop_voucher');
      if (workshopCode) {
        // Card background
        doc.rect(70, yPos, doc.page.width - 140, cardHeight)
          .fillAndStroke('rgba(26, 26, 26, 0.9)', BRONZE);

        // Dotted cut line above
        doc.save();
        doc.dash(5, { space: 5 });
        doc.moveTo(50, yPos - 10)
          .lineTo(doc.page.width - 50, yPos - 10)
          .lineWidth(0.5)
          .stroke('#555555');
        doc.restore();

        // Card title
        doc.fontSize(18)
          .fillColor(BRONZE)
          .font('Times-Bold')
          .text('WORKSHOP EXPERIENCE', 90, yPos + 25, { width: doc.page.width - 180 });

        doc.fontSize(13)
          .fillColor(PATINA)
          .font('Helvetica')
          .text(`${workshopCode.discount}% Discount • One-Time Use`, 90, yPos + 52, { width: doc.page.width - 180 });

        // Code display box
        const codeBoxY = yPos + 85;
        doc.rect(90, codeBoxY, doc.page.width - 180, 45)
          .fillAndStroke('rgba(10, 10, 10, 0.6)', ACCENT_GOLD);

        doc.fontSize(20)
          .fillColor(ACCENT_GOLD)
          .font('Courier-Bold')
          .text(workshopCode.code, 90, codeBoxY + 12, { align: 'center', width: doc.page.width - 180 });

        // Bottom info
        doc.fontSize(9)
          .fillColor('#999999')
          .font('Helvetica-Oblique')
          .text('Transferable • Gift to friends & family', 90, yPos + 145, { align: 'center', width: doc.page.width - 180 });

        yPos += cardHeight + cardMargin;
      }

      // Lifetime Workshop Card
      const lifetimeCode = codes.find((c) => c.type === 'lifetime_workshop');
      if (lifetimeCode) {
        // Dotted cut line above
        doc.save();
        doc.dash(5, { space: 5 });
        doc.moveTo(50, yPos - 10)
          .lineTo(doc.page.width - 50, yPos - 10)
          .lineWidth(0.5)
          .stroke('#555555');
        doc.restore();

        // Card background
        doc.rect(70, yPos, doc.page.width - 140, cardHeight)
          .fillAndStroke('rgba(26, 26, 26, 0.9)', PATINA);

        // Card title
        doc.fontSize(18)
          .fillColor(ACCENT_GOLD)
          .font('Times-Bold')
          .text('LIFETIME WORKSHOP ACCESS', 90, yPos + 25, { width: doc.page.width - 180 });

        doc.fontSize(13)
          .fillColor(BRONZE)
          .font('Helvetica')
          .text(`${lifetimeCode.discount}% Discount • Unlimited Use`, 90, yPos + 52, { width: doc.page.width - 180 });

        // Code display box
        const codeBoxY = yPos + 85;
        doc.rect(90, codeBoxY, doc.page.width - 180, 45)
          .fillAndStroke('rgba(10, 10, 10, 0.6)', ACCENT_GOLD);

        doc.fontSize(20)
          .fillColor(ACCENT_GOLD)
          .font('Courier-Bold')
          .text(lifetimeCode.code, 90, codeBoxY + 12, { align: 'center', width: doc.page.width - 180 });

        // Bottom info
        doc.fontSize(9)
          .fillColor('#999999')
          .font('Helvetica-Oblique')
          .text('Personal • Valid for life', 90, yPos + 145, { align: 'center', width: doc.page.width - 180 });

        yPos += cardHeight + cardMargin;

        // Final dotted cut line
        doc.save();
        doc.dash(5, { space: 5 });
        doc.moveTo(50, yPos - 10)
          .lineTo(doc.page.width - 50, yPos - 10)
          .lineWidth(0.5)
          .stroke('#555555');
        doc.restore();
      }

      // Footer
      doc.fontSize(10)
        .fillColor('#666666')
        .font('Helvetica')
        .text(
          `Issued to ${userName} • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          50, doc.page.height - 60, { align: 'center', width: doc.page.width - 100 }
        );

      doc.fontSize(9)
        .fillColor('#555555')
        .text('timeless.organic', 50, doc.page.height - 40, { align: 'center', width: doc.page.width - 100 });

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
