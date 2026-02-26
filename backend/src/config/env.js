const dotenv = require('dotenv');

dotenv.config();

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 5000,
    MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
    REDIS_URL: process.env.REDIS_URL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY,
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    BASE_URL: process.env.BASE_URL || 'http://localhost:5000'
};

const requiredKeys = ['MONGODB_URI', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];

requiredKeys.forEach((key) => {
    if (!env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

module.exports = { env };
