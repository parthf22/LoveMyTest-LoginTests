/**
 * PDF Report Generator
 * Uses Playwright (already installed) to print the HTML dashboard to PDF.
 * Produces a professional, print-ready PDF with full styling preserved.
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  const htmlPath = path.resolve(__dirname, 'test-report.html');
  const pdfPath = path.resolve(__dirname, 'test-report.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('❌  test-report.html not found. Run: node reports/generate-report.js first.');
    process.exit(1);
  }

  console.log('');
  console.log('🖨️  Launching Chromium to render PDF...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load the local HTML file
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle',
  });

  // Wait for fonts (Google Fonts) and animations to settle
  await page.waitForTimeout(3000);

  // Inject print-friendly overrides so the dark theme renders well in PDF
  await page.addStyleTag({
    content: `
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
      /* Force backgrounds to render in PDF */
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .topbar { position: relative !important; }
      .tl-bar::after { display: none !important; }
    `,
  });

  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,           // Wide enough for the full table
    printBackground: true,     // Preserve dark background & colors
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '10mm',
      right: '10mm',
    },
  });

  await browser.close();

  const sizeMB = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2);

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║    📄 PDF Test Report Generated Successfully!    ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  File  : reports/test-report.pdf                 ║`);
  console.log(`║  Size  : ${sizeMB} MB${' '.repeat(Math.max(0, 38 - sizeMB.length))}║`);
  console.log(`║  Format: A4 Landscape · Full Color               ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📂 Open: ${pdfPath}`);
  console.log('');
}

generatePDF().catch((err) => {
  console.error('❌ PDF generation failed:', err.message);
  process.exit(1);
});
