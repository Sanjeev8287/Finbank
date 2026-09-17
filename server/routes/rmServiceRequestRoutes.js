const express = require('express')

const {
  getRMServiceRequests,
  getRMServiceRequestById
} = require('../controllers/rmServiceRequestController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)
router.use(authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'))

router.get('/', getRMServiceRequests)
router.get('/:id', getRMServiceRequestById)

module.exports = router