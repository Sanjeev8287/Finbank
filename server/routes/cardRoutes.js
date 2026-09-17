const express = require('express')

const {
  getCards,
  getCardById,
  getCustomerCards,
  getMyCards,
} = require('../controllers/cardController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  idParamSchema,
  customerIdParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

// CUSTOMER — sirf apne cards
router.get(
  '/me',
  authorizeRoles('CUSTOMER'),
  getMyCards
)

// RM / SENIOR_RM / ADMIN — allowed customers ke cards
router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getCards
)

// RM / SENIOR_RM / ADMIN — specific customer's cards
router.get(
  '/customer/:customerId',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(customerIdParamSchema),
  getCustomerCards
)

// RM / SENIOR_RM / ADMIN — specific card
router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(idParamSchema),
  getCardById
)

module.exports = router