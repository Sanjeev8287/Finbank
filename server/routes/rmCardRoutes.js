const express = require('express')

const {
  getRMCards,
  getRMCardById
} = require('../controllers/rmCardController')

const authenticateToken = require('../middleware/authMiddleware')
const authorizeRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.use(authenticateToken)
router.use(authorizeRoles('RM', 'SENIOR_RM', 'ADMIN'))

router.get('/', getRMCards)
router.get('/:id', getRMCardById)

module.exports = router