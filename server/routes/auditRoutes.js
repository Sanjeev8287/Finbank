const express = require('express')

const {
  getAuditLogs,
  getMyAuditActivity,
} = require('../controllers/auditController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)

// ADMIN → all audit logs
router.get(
  '/',
  authorizeRoles('ADMIN'),
  getAuditLogs
)

// RM / SENIOR_RM / ADMIN → own activity
router.get(
  '/me',
  authorizeRoles(
    'RM',
    'SENIOR_RM',
    'ADMIN'
  ),
  getMyAuditActivity
)

module.exports = router