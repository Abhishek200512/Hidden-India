-- 001_initial_schema.sql
-- Production schema for Hidden India Hybrid Booking System

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_mode VARCHAR(16) NOT NULL CHECK (booking_mode IN ('demo', 'real')),
    destination_id VARCHAR(64) NOT NULL,
    destination_name VARCHAR(128) NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_email VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    travel_style VARCHAR(32) NOT NULL,
    budget_tier VARCHAR(32) NOT NULL,
    guests INT NOT NULL DEFAULT 1 CHECK (guests > 0),
    transport_mode VARCHAR(64) DEFAULT 'standard',
    special_requests TEXT,
    package_price NUMERIC(12, 2) NOT NULL,
    accommodation_price NUMERIC(12, 2) NOT NULL,
    transport_price NUMERIC(12, 2) NOT NULL,
    activities_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    promo_code VARCHAR(32),
    total_price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid',
    payment_id VARCHAR(128),
    order_id VARCHAR(128),
    supplier_status VARCHAR(32) NOT NULL DEFAULT 'unconfirmed',
    supplier_reference VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_mode ON bookings(booking_mode);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
    order_id VARCHAR(128) NOT NULL,
    payment_id VARCHAR(128),
    signature VARCHAR(256),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL,
    method VARCHAR(32),
    error_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

CREATE TABLE IF NOT EXISTS webhook_events (
    event_id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    endpoint VARCHAR(256),
    is_active BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
