const express = require('express')

const {
  getAllTransactions,
  getCustomerTransactions,
  getTransactionById,
  getMyTransactions,
} = require('../controllers/transactionsController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  idParamSchema,
  customerIdParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

// CUSTOMER — sirf apni transactions
router.get(
  '/me',
  authorizeRoles('CUSTOMER'),
  getMyTransactions
)

// RM / SENIOR_RM / ADMIN — allowed customers ki transactions
router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getAllTransactions
)

// RM / SENIOR_RM / ADMIN — specific customer's transactions
router.get(
  '/customer/:customerId',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(customerIdParamSchema),
  getCustomerTransactions
)

// RM / SENIOR_RM / ADMIN — specific transaction
router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(idParamSchema),
  getTransactionById
)

module.exports = router