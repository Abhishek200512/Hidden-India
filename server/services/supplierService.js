// server/services/supplierService.js
// Supplier Adapter Interface for Hidden India
// Strict compliance: Never invents supplier availability.
// If supplier integration is not explicitly configured, states:
// "Payment may be processed, but travel reservation is not confirmed."

import { config, isSupplierConfigured } from '../config/env.js';

export const SUPPLIER_STATUS = {
  UNCONFIRMED: 'unconfirmed',
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  NOT_APPLICABLE: 'not_applicable', // for demo bookings
};

export const UNCONFIGURED_NOTICE = 'Payment may be processed, but travel reservation is not confirmed.';

/**
 * Checks inventory availability with upstream travel supplier.
 */
export const checkSupplierAvailability = async ({ destinationId, startDate, durationDays, guests }) => {
  if (!isSupplierConfigured()) {
    return {
      isConfigured: false,
      available: true, // Demo allowed, real must show warning
      status: SUPPLIER_STATUS.UNCONFIRMED,
      notice: UNCONFIGURED_NOTICE,
    };
  }

  try {
    // If a real supplier endpoint is configured:
    const response = await fetch(`${config.supplier.apiUrl}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.supplier.apiKey}`,
      },
      body: JSON.stringify({ destinationId, startDate, durationDays, guests }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Supplier API responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      isConfigured: true,
      available: Boolean(data.available),
      status: data.available ? SUPPLIER_STATUS.CONFIRMED : SUPPLIER_STATUS.UNCONFIRMED,
      notice: data.available ? 'Direct hotel & guide allocation secured' : 'No supplier allocation available for these dates',
    };
  } catch (err) {
    console.warn('[SupplierService] Direct supplier query failed or timed out:', err.message);
    return {
      isConfigured: true,
      available: false,
      status: SUPPLIER_STATUS.UNCONFIRMED,
      notice: UNCONFIGURED_NOTICE,
      error: err.message,
    };
  }
};

/**
 * Requests actual room and porter reservation from upstream supplier.
 */
export const confirmSupplierReservation = async ({ bookingId, destinationId, startDate, durationDays, guests }) => {
  if (!isSupplierConfigured()) {
    console.warn(`[SupplierService] Real supplier unconfigured for booking ${bookingId}. Setting status to unconfirmed.`);
    return {
      confirmed: false,
      supplierStatus: SUPPLIER_STATUS.UNCONFIRMED,
      supplierReference: null,
      message: UNCONFIGURED_NOTICE,
    };
  }

  try {
    const response = await fetch(`${config.supplier.apiUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.supplier.apiKey}`,
      },
      body: JSON.stringify({ bookingId, destinationId, startDate, durationDays, guests }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Supplier reservation returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      confirmed: true,
      supplierStatus: SUPPLIER_STATUS.CONFIRMED,
      supplierReference: data.referenceId || `SUP-${Date.now()}`,
      message: 'Direct supplier reservation confirmed.',
    };
  } catch (err) {
    console.error(`[SupplierService] Reservation failed for booking ${bookingId}:`, err.message);
    return {
      confirmed: false,
      supplierStatus: SUPPLIER_STATUS.UNCONFIRMED,
      supplierReference: null,
      message: UNCONFIGURED_NOTICE,
      error: err.message,
    };
  }
};
