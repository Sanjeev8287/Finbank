const express = require('express')

const {
  getRMCustomers,
  getRMCustomer360,
} = require('../controllers/customerManagementController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  customerIdParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.use(
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN')
)

// RM / SENIOR_RM / ADMIN — customer list
router.get(
  '/',
  getRMCustomers
)

// RM / SENIOR_RM / ADMIN — Customer 360
router.get(
  '/:customerId/360',
  validateParams(customerIdParamSchema),
  getRMCustomer360
)

module.exports = router