const rateLimit = require('express-rate-limit');

// Rate limiter for URL shortening endpoint
const shortenLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Key generator based on IP
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.connection.remoteAddress ||
           req.ip;
  }
});

// General API rate limiter (more lenient)
const apiLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many API requests, please slow down.'
  }
});

module.exports = {
  shortenLimiter,
  apiLimiter
};
