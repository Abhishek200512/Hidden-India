// server/index.js
import express from 'express';
import cors from 'cors';
import { config, isRazorpayConfigured, isSupplierConfigured } from './config/env.js';
import { initDb, getDbStatus } from './db/index.js';
import bookingsRouter from './routes/bookings.js';
import paymentsRouter from './routes/payments.js';
import invoicesRouter from './routes/invoices.js';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature'],
}));

// Preserve raw request body for Razorpay Webhook HMAC-SHA256 verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf-8');
  },
  limit: '10mb',
}));

app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware (Sanitized - never logs secrets or card data)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/health')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health & System Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  return res.json({
    status: 'healthy',
    system: 'Hidden India Hybrid Booking Engine',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    integrations: {
      razorpayTestConfigured: isRazorpayConfigured(),
      supplierConfigured: isSupplierConfigured(),
    },
    capabilities: {
      demoBooking: true,
      realBooking: isRazorpayConfigured(),
      pdfInvoicing: true,
      serverAuthoritativePricing: true,
    },
  });
});

// Register Modular API Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/invoices', invoicesRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await initDb();
    app.listen(config.port, () => {
      console.log(`
╔═════════════════════════════════════════════════════════════════╗
║         HIDDEN INDIA — HYBRID BOOKING BACKEND ACTIVE           ║
╠═════════════════════════════════════════════════════════════════╣
║  Port:              ${config.port}                                       ║
║  API Base:          http://localhost:${config.port}/api                    ║
║  Razorpay Status:   ${isRazorpayConfigured() ? 'TEST Credentials Configured  ' : 'Unconfigured (Demo Mode Ready)'} ║
║  Supplier Status:   ${isSupplierConfigured() ? 'Upstream API Active        ' : 'Unconfigured (Notice Active) '} ║
║  PDF Invoicing:     Ready (A4 Stream Engine)                   ║
╚═════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Fatal error starting Hidden India backend server:', err);
    process.exit(1);
  }
};

startServer();
