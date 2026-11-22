import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hidden_india',
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  
  supplier: {
    enabled: process.env.SUPPLIER_API_ENABLED === 'true',
    apiUrl: process.env.SUPPLIER_API_URL || '',
    apiKey: process.env.SUPPLIER_API_KEY || '',
  }
};

export const isRazorpayConfigured = () => {
  const { keyId, keySecret } = config.razorpay;
  return Boolean(
    keyId && 
    keySecret && 
    keyId !== 'rzp_test_placeholder_key' && 
    keySecret !== 'placeholder_secret_key'
  );
};

export const isSupplierConfigured = () => {
  return config.supplier.enabled && Boolean(config.supplier.apiUrl);
};
