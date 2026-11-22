// server/services/invoiceService.js
// Professional A4 PDF Invoice Generator for Hidden India

import fs from 'fs';
import PDFDocument from 'pdfkit';

const hasArial = fs.existsSync('C:/Windows/Fonts/arial.ttf') && fs.existsSync('C:/Windows/Fonts/arialbd.ttf');

const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const generateInvoicePdf = (booking, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `Hidden India Invoice - ${booking.id}`,
      Author: 'Hidden India Concierge',
      Subject: `Travel Expedition Invoice for ${booking.destination_name}`,
    },
  });

  const regularFont = hasArial ? 'Arial' : 'Helvetica';
  const boldFont = hasArial ? 'Arial-Bold' : 'Helvetica-Bold';

  if (hasArial) {
    doc.registerFont('Arial', 'C:/Windows/Fonts/arial.ttf');
    doc.registerFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf');
  }

  // Stream PDF directly to HTTP response
  doc.pipe(res);

  const isDemo = booking.booking_mode === 'demo';
  const invoiceNum = `INV-${new Date(booking.created_at || Date.now()).getFullYear()}-${booking.id.replace('HI-', '')}`;

  // 1. Dark Header Band
  doc.rect(0, 0, 595.28, 110).fill('#080d16');

  // Gold Brand Mark
  doc.fillColor('#d4af37').fontSize(22).font(boldFont)
     .text('HIDDEN INDIA', 40, 32);
  doc.fillColor('#94a3b8').fontSize(9).font(regularFont)
     .text('BEYOND THE ORDINARY. INTO THE EXTRAORDINARY.', 40, 60);

  // Invoice Title on Top Right
  doc.fillColor('#ffffff').fontSize(18).font(boldFont)
     .text('TAX INVOICE', 380, 32, { align: 'right', width: 175 });
  doc.fillColor('#d4af37').fontSize(10).font(boldFont)
     .text(invoiceNum, 380, 56, { align: 'right', width: 175 });
  doc.fillColor('#94a3b8').fontSize(8).font(regularFont)
     .text(`Date: ${new Date(booking.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 380, 70, { align: 'right', width: 175 });

  let y = 125;

  // 2. Mode Warning / Confirmation Banner
  if (isDemo) {
    // Red/Orange Banner for Demo Mode
    doc.roundedRect(40, y, 515.28, 38, 4).fillAndStroke('#fff7ed', '#f97316');
    doc.fillColor('#c2410c').fontSize(10).font(boldFont)
       .text('DEMO BOOKING — NOT A REAL RESERVATION', 52, y + 8);
    doc.fillColor('#7c2d12').fontSize(7.5).font(regularFont)
       .text('This is an illustrative demonstration invoice. No monetary charge was captured and no hotel or transit reservation was issued.', 52, y + 22);
    y += 50;
  } else {
    // Verified or Supplier Unconfirmed Banner for Real Mode
    const isSupplierConfirmed = booking.supplier_status === 'confirmed';
    const bannerBg = isSupplierConfirmed ? '#f0fdf4' : '#fefce8';
    const bannerBorder = isSupplierConfirmed ? '#22c55e' : '#eab308';
    const textColor = isSupplierConfirmed ? '#15803d' : '#854d0e';

    doc.roundedRect(40, y, 515.28, 38, 4).fillAndStroke(bannerBg, bannerBorder);
    doc.fillColor(textColor).fontSize(9.5).font(boldFont)
       .text(isSupplierConfirmed ? 'OFFICIAL RESERVATION — SUPPLIER CONFIRMED' : 'REAL BOOKING — SUPPLIER ALLOCATION PENDING', 52, y + 8);
    doc.fillColor('#475569').fontSize(7.5).font(regularFont)
       .text(isSupplierConfirmed ? 'Your travel inventory is confirmed directly with the local sanctuary lodge.' : 'Notice: Payment may be processed, but travel reservation is not confirmed with suppliers.', 52, y + 22);
    y += 50;
  }

  // 3. Two-Column Metadata Box
  doc.roundedRect(40, y, 515.28, 90, 4).fillAndStroke('#f8fafc', '#e2e8f0');

  // Left Column: Customer & Sanctuary Info
  doc.fillColor('#64748b').fontSize(8).font(boldFont).text('EXPEDITION SANCTUARY', 52, y + 10);
  doc.fillColor('#0f172a').fontSize(11).font(boldFont).text(booking.destination_name, 52, y + 22);
  doc.fillColor('#475569').fontSize(8.5).font(regularFont)
     .text(`Style: ${booking.travel_style.toUpperCase()} | Tier: ${booking.budget_tier.toUpperCase()}`, 52, y + 36)
     .text(`Start Date: ${booking.start_date} (${booking.duration_days} Days)`, 52, y + 49)
     .text(`Guests: ${booking.guests} Traveller(s)`, 52, y + 62);

  // Right Column: Guest & Billing Info
  doc.fillColor('#64748b').fontSize(8).font(boldFont).text('BILLED TO GUEST', 320, y + 10);
  doc.fillColor('#0f172a').fontSize(11).font(boldFont).text(booking.customer_name, 320, y + 22);
  doc.fillColor('#475569').fontSize(8.5).font(regularFont)
     .text(`Email: ${booking.customer_email}`, 320, y + 36)
     .text(`Phone: ${booking.customer_phone}`, 320, y + 49)
     .text(`Booking Ref: ${booking.id}`, 320, y + 62);

  y += 105;

  // 4. Itemized Charges Table
  // Table Header
  doc.rect(40, y, 515.28, 22).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(8.5).font(boldFont)
     .text('DESCRIPTION', 52, y + 6)
     .text('DAYS / GUESTS', 310, y + 6, { width: 90, align: 'center' })
     .text('AMOUNT (INR)', 420, y + 6, { width: 120, align: 'right' });

  y += 22;

  const items = [
    {
      desc: `Base Expedition Package (${booking.destination_name} Logistics & Forest Permits)`,
      meta: `${booking.duration_days}d × ${booking.guests}p`,
      amount: booking.package_price,
    },
    {
      desc: `Accommodation Tier (${booking.budget_tier.toUpperCase()} Lodge / Heritage Homestay)`,
      meta: `${booking.duration_days}d × ${booking.guests}p`,
      amount: booking.accommodation_price,
    },
    {
      desc: `Regional Transit (${(booking.transport_mode || 'standard').replace('_', ' ').toUpperCase()})`,
      meta: `${booking.duration_days} Days`,
      amount: booking.transport_price,
    },
    {
      desc: `Custom Activities & Certified Guides (${booking.travel_style.toUpperCase()} Lore)`,
      meta: `${booking.duration_days}d × ${booking.guests}p`,
      amount: booking.activities_price,
    },
  ];

  items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(40, y, 515.28, 24).fill(rowBg);
    doc.fillColor('#1e293b').fontSize(8.5).font(regularFont)
       .text(item.desc, 52, y + 7, { width: 250 })
       .text(item.meta, 310, y + 7, { width: 90, align: 'center' })
       .text(formatPrice(item.amount), 420, y + 7, { width: 120, align: 'right' });
    y += 24;
  });

  // Thin separator
  doc.moveTo(40, y).lineTo(555.28, y).strokeColor('#cbd5e1').stroke();
  y += 8;

  // 5. Financial Summary (Subtotal, Discount, Tax, Total)
  const drawSummaryLine = (label, valueStr, isBold = false, isHighlight = false) => {
    doc.font(isBold ? boldFont : regularFont)
       .fontSize(isHighlight ? 11 : 9)
       .fillColor(isHighlight ? '#0f172a' : '#475569')
       .text(label, 300, y, { width: 120, align: 'right' });
    doc.font(isBold ? boldFont : regularFont)
       .fontSize(isHighlight ? 12 : 9.5)
       .fillColor(isHighlight ? '#b45309' : '#0f172a')
       .text(valueStr, 425, y, { width: 115, align: 'right' });
    y += isHighlight ? 20 : 15;
  };

  drawSummaryLine('Itemized Subtotal:', formatPrice(booking.subtotal));

  if (booking.discount_amount && Number(booking.discount_amount) > 0) {
    drawSummaryLine(`Promo Discount (${booking.promo_code || 'SPECIAL'}):`, `- ${formatPrice(booking.discount_amount)}`);
  }

  drawSummaryLine('Goods & Services Tax (GST 18%):', formatPrice(booking.tax_amount));

  // Highlight Box for Final Total
  y += 4;
  doc.rect(300, y - 4, 255.28, 28).fill('#fef3c7');
  drawSummaryLine('Total Payable Amount:', formatPrice(booking.total_price), true, true);

  y += 15;

  // 6. Payment & Status Indicators
  doc.roundedRect(40, y, 515.28, 54, 4).fillAndStroke('#f1f5f9', '#cbd5e1');
  doc.fillColor('#334155').fontSize(8.5).font(boldFont).text('TRANSACTION AUDIT TRAIL', 52, y + 8);

  const paymentStatusText = isDemo
    ? 'DEMO CONFIRMED (SIMULATED TRANSACTION)'
    : `${(booking.payment_status || 'UNPAID').toUpperCase()} ${booking.payment_id ? `(ID: ${booking.payment_id})` : ''}`;

  const supplierStatusText = isDemo
    ? 'NOT APPLICABLE (DEMO SIMULATION)'
    : `${(booking.supplier_status || 'UNCONFIRMED').toUpperCase()} ${booking.supplier_reference ? `(REF: ${booking.supplier_reference})` : '— Awaiting manual operator review'}`;

  doc.fillColor('#475569').fontSize(8).font(regularFont)
     .text(`Payment Gateway Status: `, 52, y + 22, { continued: true })
     .font(boldFont).text(paymentStatusText)
     .font(regularFont).text(`Supplier Inventory Status: `, 52, y + 36, { continued: true })
     .font(boldFont).text(supplierStatusText);

  y += 75;

  // 7. Footer & Environmental Oath
  doc.moveTo(40, y).lineTo(555.28, y).strokeColor('#e2e8f0').stroke();
  y += 10;
  doc.fillColor('#64748b').fontSize(7.5).font(regularFont)
     .text('Hidden India Expedition Concierge — Zero Environmental Impact Protocol.', 40, y, { align: 'center', width: 515.28 })
     .text('Questions or custom route modifications? Reach our tribal liaison at concierge@hiddenindia.org', 40, y + 12, { align: 'center', width: 515.28 });

  doc.end();
};
