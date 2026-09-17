const express = require('express')

const {
  getRMAccounts,
  getRMAccountById
} = require('../controllers/rmAccountController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)
router.use(authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'))

router.get('/', getRMAccounts)
router.get('/:id', getRMAccountById)

module.exports = router