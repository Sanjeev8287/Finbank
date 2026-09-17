const express = require('express')

const {
  getCustomers,
  getCustomerById,
  getMyProfile,
  getMyDashboard,
} = require('../controllers/customerController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get(
  '/me/profile',
  authorizeRoles('CUSTOMER'),
  getMyProfile
)

router.get(
  '/me/dashboard',
  authorizeRoles('CUSTOMER'),
  getMyDashboard
)

router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getCustomers
)

router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getCustomerById
)

module.exports = router