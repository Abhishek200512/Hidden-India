// server/routes/bookings.js
import express from 'express';
import * as db from '../db/index.js';
import { calculateServerPrice } from '../services/pricingService.js';
import { SUPPLIER_STATUS, UNCONFIGURED_NOTICE } from '../services/supplierService.js';

const router = express.Router();

// Email validation helper regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/bookings/calculate
 * Calculate server-authoritative quotation without booking creation
 */
router.post('/calculate', (req, res) => {
  try {
    const { durationDays, guests, travelStyle, budgetTier, transportMode, promoCode } = req.body;
    const calculation = calculateServerPrice({
      durationDays,
      guests,
      travelStyle,
      budgetTier,
      transportMode,
      promoCode,
    });
    return res.json({ success: true, pricing: calculation });
  } catch (err) {
    console.error('[Bookings Route] Calculation error:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/bookings
 * Create new Demo or Real booking
 */
router.post('/', async (req, res) => {
  try {
    const {
      bookingMode = 'demo',
      destinationId,
      destinationName,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      durationDays = 3,
      travelStyle = 'cultural',
      budgetTier = 'boutique',
      guests = 1,
      transportMode = 'standard',
      specialRequests = '',
      promoCode = '',
    } = req.body;

    // Strict Input Validation
    const errors = [];
    if (!destinationId || typeof destinationId !== 'string') errors.push('Destination ID is required.');
    if (!destinationName || typeof destinationName !== 'string') errors.push('Destination name is required.');
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      errors.push('Customer full name must be at least 2 characters.');
    }
    if (!customerEmail || !EMAIL_REGEX.test(customerEmail.trim())) {
      errors.push('Valid customer email address is required.');
    }
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
      errors.push('Valid phone number (at least 10 digits) is required.');
    }
    if (!startDate) {
      errors.push('Expedition departure start date is required.');
    } else {
      const parsedDate = new Date(startDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Departure date must be a valid date.');
      }
    }

    const safeDuration = parseInt(durationDays, 10);
    if (isNaN(safeDuration) || safeDuration < 1 || safeDuration > 30) {
      errors.push('Duration must be between 1 and 30 days.');
    }

    const safeGuests = parseInt(guests, 10);
    if (isNaN(safeGuests) || safeGuests < 1 || safeGuests > 20) {
      errors.push('Guests count must be between 1 and 20.');
    }

    const isDemo = bookingMode === 'demo';
    const isReal = bookingMode === 'real';

    if (!isDemo && !isReal) {
      errors.push("Booking mode must be either 'demo' or 'real'.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors, message: errors.join(' ') });
    }

    // Server-Authoritative Price Calculation
    const pricing = calculateServerPrice({
      durationDays: safeDuration,
      guests: safeGuests,
      travelStyle,
      budgetTier,
      transportMode,
      promoCode,
    });

    // Generate Unique Booking Reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateCode = Date.now().toString(36).toUpperCase().slice(-5);
    const bookingId = isDemo
      ? `HI-DEMO-${dateCode}-${randomSuffix}`
      : `HI-REAL-${dateCode}-${randomSuffix}`;

    const bookingPayload = {
      id: bookingId,
      booking_mode: isDemo ? 'demo' : 'real',
      destination_id: destinationId,
      destination_name: destinationName,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      customer_phone: customerPhone.trim(),
      start_date: startDate,
      duration_days: safeDuration,
      travel_style: travelStyle,
      budget_tier: budgetTier,
      guests: safeGuests,
      transport_mode: transportMode,
      special_requests: specialRequests ? specialRequests.trim() : '',
      package_price: pricing.itemized.packagePrice,
      accommodation_price: pricing.itemized.accommodationPrice,
      transport_price: pricing.itemized.transportPrice,
      activities_price: pricing.itemized.activitiesPrice,
      subtotal: pricing.subtotal,
      tax_amount: pricing.taxAmount,
      discount_amount: pricing.discountAmount,
      promo_code: pricing.promoApplied ? pricing.promoApplied.code : null,
      total_price: pricing.totalPrice,
      currency: 'INR',
      payment_status: isDemo ? 'demo_confirmed' : 'unpaid',
      payment_id: isDemo ? `SIM_PAY_${Date.now()}` : null,
      order_id: null,
      supplier_status: isDemo ? SUPPLIER_STATUS.NOT_APPLICABLE : SUPPLIER_STATUS.UNCONFIRMED,
      supplier_reference: isDemo ? 'DEMO_NO_RESERVATION' : null,
    };

    const savedBooking = await db.createBooking(bookingPayload);
    console.log(`[Bookings Route] Created ${bookingPayload.booking_mode.toUpperCase()} booking: ${bookingId} for ${customerName}`);

    return res.status(201).json({
      success: true,
      booking: savedBooking,
      pricing,
      supplierNotice: isReal ? UNCONFIGURED_NOTICE : null,
      message: isDemo
        ? 'DEMO BOOKING — NOT A REAL RESERVATION. Generated successfully.'
        : 'Real booking registered. Awaiting payment order creation.',
    });
  } catch (err) {
    console.error('[Bookings Route] POST Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/bookings/:id
 * Retrieve individual booking details
 */
router.get('/:id', async (req, res) => {
  try {
    const booking = await db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    return res.json({ success: true, booking });
  } catch (err) {
    console.error('[Bookings Route] GET /:id Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/bookings
 * List user bookings (e.g. by customer email)
 */
router.get('/', async (req, res) => {
  try {
    const { email, mode, limit } = req.query;
    const bookings = await db.listBookings({
      email,
      mode,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('[Bookings Route] GET / Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
