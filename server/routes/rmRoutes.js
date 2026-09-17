const express = require('express')

const {
  getRMDashboard,
} = require('../controllers/rmController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)

router.get(
  '/dashboard',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getRMDashboard
)

module.exports = router