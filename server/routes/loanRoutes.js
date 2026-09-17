const express = require('express')

const {
  getLoans,
  getLoanById,
  getCustomerLoans,
  getMyLoans,
} = require('../controllers/loanController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  idParamSchema,
  customerIdParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

// CUSTOMER — sirf apne loans
router.get(
  '/me',
  authorizeRoles('CUSTOMER'),
  getMyLoans
)

// RM / SENIOR_RM / ADMIN — allowed customers ke loans
router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getLoans
)

// RM / SENIOR_RM / ADMIN — specific customer's loans
router.get(
  '/customer/:customerId',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(customerIdParamSchema),
  getCustomerLoans
)

// RM / SENIOR_RM / ADMIN — specific loan
router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(idParamSchema),
  getLoanById
)

module.exports = router