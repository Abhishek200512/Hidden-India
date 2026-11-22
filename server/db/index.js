import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let usePostgres = false;

// Fallback JSON-based persistent store path
const dataDir = path.resolve(__dirname, '../data');
const storeFilePath = path.join(dataDir, 'bookings_store.json');

const ensureStoreFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(storeFilePath)) {
    const initialData = {
      bookings: [],
      payments: [],
      webhook_events: [],
      suppliers: []
    };
    fs.writeFileSync(storeFilePath, JSON.stringify(initialData, null, 2), 'utf8');
  }
};

const readStore = () => {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(storeFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB Store] Error reading local store:', err);
    return { bookings: [], payments: [], webhook_events: [], suppliers: [] };
  }
};

const writeStore = (data) => {
  ensureStoreFile();
  fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf8');
};

export const initDb = async () => {
  ensureStoreFile();
  
  if (config.databaseUrl) {
    try {
      const testPool = new Pool({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3000,
      });

      // Quick test query
      const res = await testPool.query('SELECT NOW()');
      console.log(`[DB] Connected to PostgreSQL at ${res.rows[0].now}`);

      // Run migration
      const migrationPath = path.join(__dirname, 'migrations/001_initial_schema.sql');
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await testPool.query(sql);
        console.log('[DB] PostgreSQL migration 001_initial_schema executed successfully.');
      }

      pool = testPool;
      usePostgres = true;
      return { type: 'postgresql', status: 'connected' };
    } catch (err) {
      console.warn(`[DB] PostgreSQL connection to ${config.databaseUrl} failed (${err.message}). Seamlessly activating resilient local persistent database.`);
    }
  }

  usePostgres = false;
  console.log('[DB] Operating in Resilient Local Storage mode (file-backed JSON store).');
  return { type: 'local_json', status: 'active' };
};

export const getDbStatus = () => ({
  type: usePostgres ? 'postgresql' : 'local_json',
  connected: true,
});

// Database Abstraction Methods
export const createBooking = async (booking) => {
  const now = new Date().toISOString();
  const record = {
    ...booking,
    created_at: now,
    updated_at: now,
  };

  if (usePostgres) {
    const query = `
      INSERT INTO bookings (
        id, booking_mode, destination_id, destination_name,
        customer_name, customer_email, customer_phone,
        start_date, duration_days, travel_style, budget_tier,
        guests, transport_mode, special_requests,
        package_price, accommodation_price, transport_price, activities_price,
        subtotal, tax_amount, discount_amount, promo_code, total_price,
        currency, payment_status, payment_id, order_id,
        supplier_status, supplier_reference, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      ) RETURNING *;
    `;
    const values = [
      record.id, record.booking_mode, record.destination_id, record.destination_name,
      record.customer_name, record.customer_email, record.customer_phone,
      record.start_date, record.duration_days, record.travel_style, record.budget_tier,
      record.guests, record.transport_mode, record.special_requests || '',
      record.package_price, record.accommodation_price, record.transport_price, record.activities_price,
      record.subtotal, record.tax_amount, record.discount_amount || 0, record.promo_code || null, record.total_price,
      record.currency || 'INR', record.payment_status || 'unpaid', record.payment_id || null, record.order_id || null,
      record.supplier_status || 'unconfirmed', record.supplier_reference || null, record.created_at, record.updated_at
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  } else {
    const store = readStore();
    store.bookings.unshift(record);
    writeStore(store);
    return record;
  }
};

export const getBookingById = async (id) => {
  if (usePostgres) {
    const res = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return res.rows[0] || null;
  } else {
    const store = readStore();
    return store.bookings.find(b => b.id === id) || null;
  }
};

export const listBookings = async (options = {}) => {
  const { email, mode, limit = 50 } = options;
  if (usePostgres) {
    let query = 'SELECT * FROM bookings';
    const values = [];
    const conditions = [];

    if (email) {
      conditions.push(`LOWER(customer_email) = LOWER($${values.length + 1})`);
      values.push(email);
    }
    if (mode) {
      conditions.push(`booking_mode = $${values.length + 1}`);
      values.push(mode);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const res = await pool.query(query, values);
    return res.rows;
  } else {
    const store = readStore();
    let list = [...store.bookings];
    if (email) {
      list = list.filter(b => b.customer_email.toLowerCase() === email.toLowerCase());
    }
    if (mode) {
      list = list.filter(b => b.booking_mode === mode);
    }
    return list.slice(0, limit);
  }
};

export const updateBookingPayment = async (id, updates) => {
  const now = new Date().toISOString();
  if (usePostgres) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
    fields.push(`updated_at = $${idx}`);
    values.push(now);
    idx++;

    values.push(id);
    const query = `UPDATE bookings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *;`;
    const res = await pool.query(query, values);
    return res.rows[0] || null;
  } else {
    const store = readStore();
    const index = store.bookings.findIndex(b => b.id === id);
    if (index === -1) return null;
    store.bookings[index] = {
      ...store.bookings[index],
      ...updates,
      updated_at: now
    };
    writeStore(store);
    return store.bookings[index];
  }
};

export const createPaymentRecord = async (payment) => {
  const record = {
    ...payment,
    created_at: new Date().toISOString(),
  };

  if (usePostgres) {
    const query = `
      INSERT INTO payments (
        booking_id, order_id, payment_id, signature, amount, currency, status, method, error_description, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
    `;
    const values = [
      record.booking_id, record.order_id, record.payment_id || null, record.signature || null,
      record.amount, record.currency || 'INR', record.status, record.method || 'card',
      record.error_description || null, record.created_at
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  } else {
    const store = readStore();
    record.id = store.payments.length + 1;
    store.payments.push(record);
    writeStore(store);
    return record;
  }
};

export const recordWebhookEvent = async (event) => {
  if (usePostgres) {
    const query = `
      INSERT INTO webhook_events (event_id, event_type, payload, processed, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (event_id) DO NOTHING
      RETURNING *;
    `;
    const res = await pool.query(query, [event.event_id, event.event_type, JSON.stringify(event.payload), false]);
    return res.rows[0] || null;
  } else {
    const store = readStore();
    const existing = store.webhook_events.find(e => e.event_id === event.event_id);
    if (existing) {
      return null; // Duplicate event
    }
    const record = {
      ...event,
      processed: false,
      created_at: new Date().toISOString()
    };
    store.webhook_events.push(record);
    writeStore(store);
    return record;
  }
};

export const isWebhookEventProcessed = async (eventId) => {
  if (usePostgres) {
    const res = await pool.query('SELECT processed FROM webhook_events WHERE event_id = $1', [eventId]);
    return res.rows.length > 0 && res.rows[0].processed === true;
  } else {
    const store = readStore();
    const found = store.webhook_events.find(e => e.event_id === eventId);
    return found ? found.processed === true : false;
  }
};

export const markWebhookEventProcessed = async (eventId) => {
  if (usePostgres) {
    await pool.query('UPDATE webhook_events SET processed = TRUE WHERE event_id = $1', [eventId]);
  } else {
    const store = readStore();
    const found = store.webhook_events.find(e => e.event_id === eventId);
    if (found) {
      found.processed = true;
      writeStore(store);
    }
  }
};
