const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// ========================================
// SECURITY HEADERS
// ========================================

const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
})

// ========================================
// GENERAL API RATE LIMIT
// ========================================

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  limit: 300,

  standardHeaders: 'draft-8',
  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests. Please try again later.',
  },
})

// ========================================
// LOGIN RATE LIMIT
// ========================================

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  limit: 10,

  standardHeaders: 'draft-8',
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message:
      'Too many login attempts. Please try again later.',
  },
})

module.exports = {
  securityHeaders,
  apiRateLimiter,
  loginRateLimiter,
}