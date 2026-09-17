const express = require('express')

const {
  login,
  getMe,
} = require('../controllers/authController')

const authenticateToken = require('../middleware/authMiddleware')

const {
  loginRateLimiter,
} = require('../middleware/securityMiddleware')

const {
  loginSchema,
  validateBody,
} = require('../middleware/validationMiddleware')

const router = express.Router()

// ========================================
// LOGIN
// Rate Limit + Input Validation
// ========================================

router.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  login
)

// ========================================
// CURRENT USER
// Authentication Required
// ========================================

router.get(
  '/me',
  authenticateToken,
  getMe
)

module.exports = router