const express = require('express')

const {
  getRMActivity
} = require('../controllers/rmActivityController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)
router.use(authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'))

router.get('/', getRMActivity)

module.exports = router