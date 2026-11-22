// server/routes/invoices.js
import express from 'express';
import * as db from '../db/index.js';
import { generateInvoicePdf } from '../services/invoiceService.js';

const router = express.Router();

/**
 * GET /api/invoices/:bookingId
 * Streams A4 PDF Invoice generated server-side
 */
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await db.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found for invoice generation.' });
    }

    const filename = `Hidden_India_Invoice_${booking.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    generateInvoicePdf(booking, res);
  } catch (err) {
    console.error('[Invoices Route] Error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
});

export default router;
