const express = require('express')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  askCustomerAI,
  askRMAI,
} = require('../controllers/aiController')

const router = express.Router()


// ========================================
// Authentication required for all AI routes
// ========================================

router.use(authenticateToken)


// ========================================
// Customer AI
// ========================================

router.post(
  '/customer-chat',
  authorizeRoles('CUSTOMER'),
  askCustomerAI
)


// ========================================
// RM AI
// ========================================

router.post(
  '/rm-chat',
  authorizeRoles('RM'),
  askRMAI
)


module.exports = router