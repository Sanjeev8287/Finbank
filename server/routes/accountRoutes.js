const express = require('express')

const {
  getAccounts,
  getAccountById,
  getCustomerAccounts,
  getMyAccounts,
} = require('../controllers/accountController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  idParamSchema,
  customerIdParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

// CUSTOMER — sirf apne accounts
router.get(
  '/me',
  authorizeRoles('CUSTOMER'),
  getMyAccounts
)

// RM / SENIOR_RM / ADMIN — all accounts
router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getAccounts
)

// RM / SENIOR_RM / ADMIN — specific customer's accounts
router.get(
  '/customer/:customerId',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(customerIdParamSchema),
  getCustomerAccounts
)

// RM / SENIOR_RM / ADMIN — specific account
router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(idParamSchema),
  getAccountById
)

module.exports = router