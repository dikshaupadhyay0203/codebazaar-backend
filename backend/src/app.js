const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const { swaggerSpec } = require('./config/swagger');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();
const primaryUploadDir = path.resolve(__dirname, '../', env.UPLOAD_DIR);
const legacyUploadDir = path.join(process.cwd(), env.UPLOAD_DIR);

const baseOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = new Set(baseOrigins);

baseOrigins.forEach((origin) => {
    try {
        const url = new URL(origin);
        if (url.hostname === 'localhost') {
            url.hostname = '127.0.0.1';
            allowedOrigins.add(url.toString().replace(/\/$/, ''));
        }
        if (url.hostname === '127.0.0.1') {
            url.hostname = 'localhost';
            allowedOrigins.add(url.toString().replace(/\/$/, ''));
        }
        allowedOrigins.add(origin.replace(/\/$/, ''));
    } catch {
        allowedOrigins.add(origin.replace(/\/$/, ''));
    }
});

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            if (allowedOrigins.has(origin.replace(/\/$/, ''))) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(compression());
app.use(hpp());
app.use(mongoSanitize());
app.use(xssClean());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
    '/api',
    rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX,
        standardHeaders: true,
        legacyHeaders: false
    })
);

app.use('/uploads', express.static(primaryUploadDir));
if (legacyUploadDir !== primaryUploadDir) {
    app.use('/uploads', express.static(legacyUploadDir));
}

app.get('/', (req, res) => {
    res.send('CodeBazaar Backend is Running 🚀');
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
