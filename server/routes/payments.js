// server/routes/payments.js
import express from 'express';
import * as db from '../db/index.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  handleWebhookEvent,
} from '../services/paymentService.js';
import {
  confirmSupplierReservation,
  UNCONFIGURED_NOTICE,
} from '../services/supplierService.js';
import { isRazorpayConfigured } from '../config/env.js';

const router = express.Router();

/**
 * POST /api/payments/create-order
 * Initiates Razorpay Order for a real booking
 */
router.post('/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'Booking ID is required.' });
    }

    const booking = await db.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking.booking_mode !== 'real') {
      return res.status(400).json({
        success: false,
        error: 'Payment orders can only be generated for Real Booking mode. Demo bookings do not require payments.',
      });
    }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'This booking has already been paid and verified.',
      });
    }

    if (!isRazorpayConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Razorpay payment gateway keys are not configured on this server. Please use DEMO BOOKING mode, or configure RAZORPAY_KEY_ID in .env.',
        isConfigured: false,
      });
    }

    const orderData = await createRazorpayOrder({
      bookingId: booking.id,
      amountInInr: Number(booking.total_price),
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      destinationName: booking.destination_name,
    });

    // Update booking with the new order ID
    await db.updateBookingPayment(booking.id, {
      order_id: orderData.orderId,
      payment_status: 'pending',
    });

    return res.json({
      success: true,
      order: orderData,
      booking: {
        id: booking.id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        totalPrice: booking.total_price,
      },
    });
  } catch (err) {
    console.error('[Payments Route] create-order Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/payments/verify
 * Server-authoritative signature verification
 */
router.post('/verify', async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required payment verification parameters (bookingId, order_id, payment_id, signature).',
      });
    }

    const booking = await db.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, verified: false, error: 'Booking not found.' });
    }

    // Cryptographic HMAC-SHA256 verification
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.warn(`[Payments Route] SECURITY ALERT: Invalid signature rejected for booking ${bookingId}`);
      await db.createPaymentRecord({
        booking_id: bookingId,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        amount: Number(booking.total_price),
        currency: 'INR',
        status: 'failed',
        error_description: 'Cryptographic signature mismatch on verification.',
      });

      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed: cryptographic signature mismatch.',
      });
    }

    // Payment is authentic & verified!
    // Attempt supplier confirmation (checks if real supplier API is configured)
    const supplierResult = await confirmSupplierReservation({
      bookingId: booking.id,
      destinationId: booking.destination_id,
      startDate: booking.start_date,
      durationDays: booking.duration_days,
      guests: booking.guests,
    });

    const updatedBooking = await db.updateBookingPayment(booking.id, {
      payment_status: 'paid',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      supplier_status: supplierResult.supplierStatus,
      supplier_reference: supplierResult.supplierReference,
    });

    await db.createPaymentRecord({
      booking_id: booking.id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      amount: Number(booking.total_price),
      currency: 'INR',
      status: 'captured',
    });

    console.log(`[Payments Route] Payment VERIFIED for booking ${bookingId}. Supplier status: ${supplierResult.supplierStatus}`);

    return res.json({
      success: true,
      verified: true,
      booking: updatedBooking,
      supplierConfirmation: supplierResult,
      supplierNotice: supplierResult.confirmed ? null : UNCONFIGURED_NOTICE,
      message: supplierResult.confirmed
        ? 'Payment verified and hotel reservation confirmed with local sanctuary.'
        : `Payment successfully captured. ${UNCONFIGURED_NOTICE}`,
    });
  } catch (err) {
    console.error('[Payments Route] verify Error:', err);
    return res.status(500).json({ success: false, verified: false, error: err.message });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay Webhook listener with raw-body signature validation
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody; // Populated by express raw body parser

    const result = await handleWebhookEvent(req.body, rawBody, signature);
    return res.status(result.status).json(result);
  } catch (err) {
    console.error('[Payments Route] Webhook Error:', err);
    return res.status(500).json({ status: 500, error: err.message });
  }
});

export default router;
