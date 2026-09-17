const express = require('express')

const {
  getAllServiceRequests,
  getCustomerServiceRequests,
  getServiceRequestById,
  getMyServiceRequests,
} = require('../controllers/serviceRequestController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const {
  idParamSchema,
  customerIdParamSchema,
  validateParams,
} = require('../middleware/validationMiddleware')

const router = express.Router()

router.use(authenticateToken)

// CUSTOMER — sirf apne service requests
router.get(
  '/me',
  authorizeRoles('CUSTOMER'),
  getMyServiceRequests
)

// RM / SENIOR_RM / ADMIN — allowed customers ke requests
router.get(
  '/',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  getAllServiceRequests
)

// RM / SENIOR_RM / ADMIN — specific customer's requests
router.get(
  '/customer/:customerId',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(customerIdParamSchema),
  getCustomerServiceRequests
)

// RM / SENIOR_RM / ADMIN — specific service request
router.get(
  '/:id',
  authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'),
  validateParams(idParamSchema),
  getServiceRequestById
)

module.exports = router