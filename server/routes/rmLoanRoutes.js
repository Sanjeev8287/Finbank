const express = require('express')

const {
  getRMLoans,
  getRMLoanById
} = require('../controllers/rmLoanController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)
router.use(authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'))

router.get('/', getRMLoans)
router.get('/:id', getRMLoanById)

module.exports = router