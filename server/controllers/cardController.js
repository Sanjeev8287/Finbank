const pool = require('../db')

// ========================================
// HELPERS
// ========================================

const getAuthenticatedCustomerId = (req) => {
  const customerId = Number(req.user?.customerId)

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return null
  }

  return customerId
}

const getAuthenticatedRMId = (req) => {
  const rmId = Number(req.user?.relationshipManagerId)

  if (!Number.isInteger(rmId) || rmId <= 0) {
    return null
  }

  return rmId
}

const isStaffRole = (role) => {
  return ['RM', 'SENIOR_RM', 'ADMIN'].includes(role)
}

const maskCardNumber = (cardNumber) => {
  if (!cardNumber) {
    return cardNumber
  }

  const value = String(cardNumber)

  return `XXXX XXXX XXXX ${value.slice(-4)}`
}

// ========================================
// GET ALL CARDS
// RM / SENIOR_RM / ADMIN
// ========================================

const getCards = async (req, res) => {
  try {
    if (!isStaffRole(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access cards',
      })
    }

    const rmId = getAuthenticatedRMId(req)

    let result

    // ADMIN → all cards
    if (req.user.role === 'ADMIN') {
      result = await pool.query(`
        SELECT
          c.id,
          c.customer_id,
          cu.full_name AS customer_name,
          cu.customer_code,
          c.card_number,
          c.card_type,
          c.card_variant,
          c.expiry_date,
          c.credit_limit,
          c.available_limit,
          c.status,
          c.issued_at,
          c.created_at
        FROM cards c
        LEFT JOIN customers cu
          ON c.customer_id = cu.id
        ORDER BY c.id
      `)
    } else {
      // RM / SENIOR_RM → assigned customers only
      if (!rmId) {
        return res.status(400).json({
          success: false,
          message: 'Relationship manager account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          c.id,
          c.customer_id,
          cu.full_name AS customer_name,
          cu.customer_code,
          c.card_number,
          c.card_type,
          c.card_variant,
          c.expiry_date,
          c.credit_limit,
          c.available_limit,
          c.status,
          c.issued_at,
          c.created_at
        FROM cards c
        INNER JOIN customers cu
          ON c.customer_id = cu.id
        WHERE cu.relationship_manager_id = $1
        ORDER BY c.id
        `,
        [rmId]
      )
    }

    const cards = result.rows.map((card) => ({
      ...card,
      card_number: maskCardNumber(card.card_number),
    }))

    res.json({
      success: true,
      cards,
    })
  } catch (error) {
    console.error(
      'Get cards error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch cards',
    })
  }
}

// ========================================
// GET CARD BY ID
// CUSTOMER → own card only
// RM → assigned customer card only
// ADMIN → any card
// ========================================

const getCardById = async (req, res) => {
  try {
    const cardId = Number(req.params.id)

    if (!Number.isInteger(cardId) || cardId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card ID',
      })
    }

    const role = req.user?.role

    let result

    // CUSTOMER
    if (role === 'CUSTOMER') {
      const customerId = getAuthenticatedCustomerId(req)

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          c.id,
          c.customer_id,
          cu.full_name AS customer_name,
          cu.customer_code,
          c.card_number,
          c.card_type,
          c.card_variant,
          c.expiry_date,
          c.credit_limit,
          c.available_limit,
          c.status,
          c.issued_at,
          c.created_at
        FROM cards c
        INNER JOIN customers cu
          ON c.customer_id = cu.id
        WHERE c.id = $1
        AND c.customer_id = $2
        `,
        [cardId, customerId]
      )
    }

    // RM / SENIOR_RM
    else if (
      ['RM', 'SENIOR_RM'].includes(role)
    ) {
      const rmId = getAuthenticatedRMId(req)

      if (!rmId) {
        return res.status(400).json({
          success: false,
          message: 'Relationship manager account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          c.id,
          c.customer_id,
          cu.full_name AS customer_name,
          cu.customer_code,
          c.card_number,
          c.card_type,
          c.card_variant,
          c.expiry_date,
          c.credit_limit,
          c.available_limit,
          c.status,
          c.issued_at,
          c.created_at
        FROM cards c
        INNER JOIN customers cu
          ON c.customer_id = cu.id
        WHERE c.id = $1
        AND cu.relationship_manager_id = $2
        `,
        [cardId, rmId]
      )
    }

    // ADMIN
    else if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          c.id,
          c.customer_id,
          cu.full_name AS customer_name,
          cu.customer_code,
          c.card_number,
          c.card_type,
          c.card_variant,
          c.expiry_date,
          c.credit_limit,
          c.available_limit,
          c.status,
          c.issued_at,
          c.created_at
        FROM cards c
        LEFT JOIN customers cu
          ON c.customer_id = cu.id
        WHERE c.id = $1
        `,
        [cardId]
      )
    }

    // UNKNOWN ROLE
    else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this card',
      })
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      })
    }

    const card = {
      ...result.rows[0],
      card_number: maskCardNumber(
        result.rows[0].card_number
      ),
    }

    res.json({
      success: true,
      card,
    })
  } catch (error) {
    console.error(
      'Get card error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch card',
    })
  }
}

// ========================================
// GET CUSTOMER CARDS
// RM / SENIOR_RM / ADMIN
// ========================================

const getCustomerCards = async (req, res) => {
  try {
    const customerId = Number(
      req.params.customerId
    )

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID',
      })
    }

    const role = req.user?.role

    if (
      !['RM', 'SENIOR_RM', 'ADMIN'].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access customer cards',
      })
    }

    let result

    // ADMIN → any customer
    if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          id,
          customer_id,
          card_number,
          card_type,
          card_variant,
          expiry_date,
          credit_limit,
          available_limit,
          status,
          issued_at,
          created_at
        FROM cards
        WHERE customer_id = $1
        ORDER BY id
        `,
        [customerId]
      )
    }

    // RM / SENIOR_RM → assigned customers only
    else {
      const rmId = getAuthenticatedRMId(req)

      if (!rmId) {
        return res.status(400).json({
          success: false,
          message:
            'Relationship manager account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          c.id,
          c.customer_id,
          c.card_number,
          c.card_type,
          c.card_variant,
          c.expiry_date,
          c.credit_limit,
          c.available_limit,
          c.status,
          c.issued_at,
          c.created_at
        FROM cards c
        INNER JOIN customers cu
          ON c.customer_id = cu.id
        WHERE c.customer_id = $1
        AND cu.relationship_manager_id = $2
        ORDER BY c.id
        `,
        [customerId, rmId]
      )
    }

    const cards = result.rows.map((card) => ({
      ...card,
      card_number: maskCardNumber(
        card.card_number
      ),
    }))

    res.json({
      success: true,
      cards,
    })
  } catch (error) {
    console.error(
      'Get customer cards error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer cards',
    })
  }
}

// ========================================
// MY CARDS
// CUSTOMER ONLY
// ========================================

const getMyCards = async (req, res) => {
  try {
    const customerId =
      getAuthenticatedCustomerId(req)

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer account is not linked',
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        customer_id,
        card_number,
        card_type,
        card_variant,
        expiry_date,
        credit_limit,
        available_limit,
        status,
        issued_at,
        created_at
      FROM cards
      WHERE customer_id = $1
      ORDER BY id
      `,
      [customerId]
    )

    const cards = result.rows.map((card) => ({
      ...card,
      card_number: maskCardNumber(
        card.card_number
      ),
    }))

    res.json({
      success: true,
      cards,
    })
  } catch (error) {
    console.error(
      'Get my cards error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your cards',
    })
  }
}

module.exports = {
  getCards,
  getCardById,
  getCustomerCards,
  getMyCards,
}