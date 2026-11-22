// src/services/bookingApi.js
// Client API Service for Hidden India Hybrid Booking System

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'hidden_india_saved_booking_ids';

export const getSavedBookingIds = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveBookingIdLocally = (id) => {
  try {
    const existing = getSavedBookingIds();
    if (!existing.includes(id)) {
      existing.unshift(id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    }
  } catch (e) {
    console.error('Failed to save booking ID locally:', e);
  }
};

export const fetchSystemHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[BookingAPI] Server health check offline:', err.message);
    return {
      status: 'offline',
      capabilities: { demoBooking: true, realBooking: false, pdfInvoicing: false },
    };
  }
};

export const calculateServerQuote = async (params) => {
  try {
    const res = await fetch(`${API_BASE}/bookings/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to calculate quote');
    }
    return data.pricing;
  } catch (err) {
    console.error('[BookingAPI] calculateServerQuote error:', err);
    throw err;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      const msg = data.errors ? data.errors.join(' ') : (data.error || 'Failed to create booking');
      throw new Error(msg);
    }
    if (data.booking?.id) {
      saveBookingIdLocally(data.booking.id);
    }
    return data;
  } catch (err) {
    console.error('[BookingAPI] createBooking error:', err);
    throw err;
  }
};

export const getBookingDetails = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Booking not found');
    }
    return data.booking;
  } catch (err) {
    console.error('[BookingAPI] getBookingDetails error:', err);
    throw err;
  }
};

export const listBookings = async (email = '') => {
  try {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE}/bookings${query}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }
    return data.bookings || [];
  } catch (err) {
    console.error('[BookingAPI] listBookings error:', err);
    return [];
  }
};

export const createPaymentOrder = async (bookingId) => {
  try {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to initialize payment order');
    }
    return data.order;
  } catch (err) {
    console.error('[BookingAPI] createPaymentOrder error:', err);
    throw err;
  }
};

export const verifyPaymentSignature = async (verificationData) => {
  try {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.verified) {
      throw new Error(data.error || 'Payment verification failed');
    }
    return data;
  } catch (err) {
    console.error('[BookingAPI] verifyPaymentSignature error:', err);
    throw err;
  }
};

export const getInvoiceDownloadUrl = (bookingId) => {
  return `${API_BASE}/invoices/${bookingId}`;
};

/**
 * Dynamically loads Razorpay standard checkout script if not present
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
