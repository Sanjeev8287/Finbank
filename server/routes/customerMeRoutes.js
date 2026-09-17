const express = require('express')

const {
  getCustomers,
  getCustomerById,
  getMyProfile,
  getMyDashboard,
} = require('../controllers/customerController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  idParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

// CUSTOMER — apni profile
router.get(
  '/me/profile',
  authorizeRoles('CUSTOMER'),
  getMyProfile
)

// CUSTOMER — apna dashboard
router.get(
  '/me/dashboard',
  authorizeRoles('CUSTOMER'),
  getMyDashboard
)

// RM / SENIOR_RM / ADMIN — customer list
router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getCustomers
)

// RM / SENIOR_RM / ADMIN — specific customer
router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(idParamSchema),
  getCustomerById
)

module.exports = router