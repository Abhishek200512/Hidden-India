// server/services/paymentService.js
// Razorpay Payment Integration & Signature Verification Service

import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config, isRazorpayConfigured } from '../config/env.js';
import * as db from '../db/index.js';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
};

/**
 * Creates a server-side Razorpay order.
 * Amount is passed in INR and converted to Paise (amount * 100).
 */
export const createRazorpayOrder = async ({ bookingId, amountInInr, customerEmail, customerPhone, destinationName }) => {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured on the server. Please use DEMO BOOKING mode or supply RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.');
  }

  const rzp = getRazorpayInstance();
  const amountInPaise = Math.round(amountInInr * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: bookingId.slice(0, 40), // Razorpay receipt max 40 chars
    notes: {
      bookingId,
      destination: destinationName || 'Hidden Sanctuary',
      customerEmail: customerEmail || '',
      system: 'Hidden India Hybrid Booking',
    },
  };

  try {
    const order = await rzp.orders.create(options);
    console.log(`[PaymentService] Created Razorpay order ${order.id} for booking ${bookingId} (₹${amountInInr})`);

    // Record payment intent in DB
    await db.createPaymentRecord({
      booking_id: bookingId,
      order_id: order.id,
      payment_id: null,
      signature: null,
      amount: amountInInr,
      currency: 'INR',
      status: 'created',
      method: null,
      error_description: null,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpay.keyId, // Safe to send public Key ID to client checkout
    };
  } catch (err) {
    console.error('[PaymentService] Failed to create Razorpay order:', err);
    throw new Error(`Razorpay Order Creation Failed: ${err.message}`);
  }
};

/**
 * Cryptographically verifies Razorpay payment signature.
 * Formula: HMAC-SHA256(order_id + "|" + payment_id, key_secret) === signature
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!isRazorpayConfigured()) {
    console.warn('[PaymentService] Signature verification failed: Razorpay secret is not configured.');
    return false;
  }
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body.toString())
      .digest('hex');

    // Both must be valid 64-char hex strings for timingSafeEqual
    if (expectedSignature.length !== signature.length) {
      return false;
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );

    return isValid;
  } catch (err) {
    console.error('[PaymentService] Error verifying signature:', err.message);
    return false;
  }
};

/**
 * Verifies webhook signature using the RAW request body.
 * Formula: HMAC-SHA256(rawBody, webhookSecret) === receivedSignature
 */
export const verifyWebhookSignature = (rawBody, receivedSignature) => {
  if (!config.razorpay.webhookSecret) {
    console.warn('[PaymentService] RAZORPAY_WEBHOOK_SECRET is not set.');
    return false;
  }
  if (!rawBody || !receivedSignature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(receivedSignature, 'utf-8')
    );
  } catch (err) {
    console.error('[PaymentService] Webhook signature verification error:', err.message);
    return false;
  }
};

/**
 * Processes incoming webhook event idempotently.
 */
export const handleWebhookEvent = async (event, rawBody, signature) => {
  // 1. Verify signature
  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[PaymentService] Webhook rejected: Invalid signature.');
    return { status: 400, message: 'Invalid webhook signature' };
  }

  const eventId = event.event_id || event.id || `evt_${Date.now()}`;
  const eventType = event.event;

  // 2. Idempotency Check: Don't process twice
  const alreadyProcessed = await db.isWebhookEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`[PaymentService] Duplicate webhook event ${eventId} ignored.`);
    return { status: 200, message: 'Duplicate event ignored' };
  }

  // 3. Record event in store
  await db.recordWebhookEvent({
    event_id: eventId,
    event_type: eventType,
    payload: event,
  });

  // 4. Handle specific event types
  if (eventType === 'payment.captured') {
    const paymentEntity = event.payload?.payment?.entity;
    if (paymentEntity) {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;
      const bookingId = paymentEntity.notes?.bookingId;

      console.log(`[PaymentService] Webhook: Payment captured for Order ${orderId}, Booking ${bookingId}`);

      if (bookingId) {
        await db.updateBookingPayment(bookingId, {
          payment_status: 'paid',
          payment_id: paymentId,
          order_id: orderId,
        });

        await db.createPaymentRecord({
          booking_id: bookingId,
          order_id: orderId,
          payment_id: paymentId,
          signature: null,
          amount,
          currency: 'INR',
          status: 'captured',
          method: paymentEntity.method,
        });
      }
    }
  } else if (eventType === 'payment.failed') {
    const paymentEntity = event.payload?.payment?.entity;
    if (paymentEntity) {
      const bookingId = paymentEntity.notes?.bookingId;
      if (bookingId) {
        await db.updateBookingPayment(bookingId, {
          payment_status: 'failed',
        });
      }
    }
  }

  // Mark event as processed
  await db.markWebhookEventProcessed(eventId);
  return { status: 200, message: 'Webhook processed successfully' };
};
