const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    optionsSuccessStatus: 200,
    credentials: true
};

// Rate Limiting Configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

const setupSecurity = (app) => {
    // 1. Helmet for security headers
    app.use(helmet());

    // 2. CORS setup
    app.use(cors(corsOptions));

    // 3. Rate limiting for all routes
    app.use(limiter);

    // 4. Data sanitization (JSON parsing max limit)
    const express = require('express');
    app.use(express.json({ limit: '10kb' }));
};

module.exports = { setupSecurity };
