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

// ========================================
// GET ALL TRANSACTIONS
// RM / SENIOR_RM / ADMIN
// ========================================

const getAllTransactions = async (req, res) => {
  try {
    const role = req.user?.role

    if (!isStaffRole(role)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access transactions',
      })
    }

    let result

    // ADMIN → all transactions
    if (role === 'ADMIN') {
      result = await pool.query(`
        SELECT
          t.id,
          t.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.category,
          t.description,
          t.amount,
          t.transaction_date,
          t.status
        FROM transactions t
        LEFT JOIN customers c
          ON t.customer_id = c.id
        ORDER BY t.transaction_date DESC
      `)
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
          t.id,
          t.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.category,
          t.description,
          t.amount,
          t.transaction_date,
          t.status
        FROM transactions t
        INNER JOIN customers c
          ON t.customer_id = c.id
        WHERE c.relationship_manager_id = $1
        ORDER BY t.transaction_date DESC
        `,
        [rmId]
      )
    }

    res.json({
      success: true,
      transactions: result.rows,
    })
  } catch (error) {
    console.error(
      'Get transactions error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    })
  }
}

// ========================================
// GET CUSTOMER TRANSACTIONS
// RM / SENIOR_RM / ADMIN
// ========================================

const getCustomerTransactions = async (req, res) => {
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
          'You do not have permission to access customer transactions',
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
          account_id,
          transaction_reference,
          transaction_type,
          category,
          description,
          amount,
          transaction_date,
          status
        FROM transactions
        WHERE customer_id = $1
        ORDER BY transaction_date DESC
        `,
        [customerId]
      )
    }

    // RM / SENIOR_RM → assigned customer only
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
          t.id,
          t.customer_id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.category,
          t.description,
          t.amount,
          t.transaction_date,
          t.status
        FROM transactions t
        INNER JOIN customers c
          ON t.customer_id = c.id
        WHERE t.customer_id = $1
        AND c.relationship_manager_id = $2
        ORDER BY t.transaction_date DESC
        `,
        [customerId, rmId]
      )
    }

    res.json({
      success: true,
      transactions: result.rows,
    })
  } catch (error) {
    console.error(
      'Get customer transactions error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer transactions',
    })
  }
}

// ========================================
// GET TRANSACTION BY ID
// CUSTOMER → own transaction only
// RM → assigned customer transaction only
// ADMIN → any transaction
// ========================================

const getTransactionById = async (req, res) => {
  try {
    const transactionId = Number(
      req.params.id
    )

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID',
      })
    }

    const role = req.user?.role

    let result

    // CUSTOMER
    if (role === 'CUSTOMER') {
      const customerId =
        getAuthenticatedCustomerId(req)

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          t.id,
          t.customer_id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.category,
          t.description,
          t.amount,
          t.transaction_date,
          t.status
        FROM transactions t
        WHERE t.id = $1
        AND t.customer_id = $2
        `,
        [transactionId, customerId]
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
          message:
            'Relationship manager account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          t.id,
          t.customer_id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.category,
          t.description,
          t.amount,
          t.transaction_date,
          t.status
        FROM transactions t
        INNER JOIN customers c
          ON t.customer_id = c.id
        WHERE t.id = $1
        AND c.relationship_manager_id = $2
        `,
        [transactionId, rmId]
      )
    }

    // ADMIN
    else if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          t.id,
          t.customer_id,
          t.account_id,
          t.transaction_reference,
          t.transaction_type,
          t.category,
          t.description,
          t.amount,
          t.transaction_date,
          t.status
        FROM transactions t
        WHERE t.id = $1
        `,
        [transactionId]
      )
    }

    // UNKNOWN ROLE
    else {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access this transaction',
      })
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }

    res.json({
      success: true,
      transaction: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Get transaction error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
    })
  }
}

// ========================================
// MY TRANSACTIONS
// CUSTOMER ONLY
// ========================================

const getMyTransactions = async (req, res) => {
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
        account_id,
        transaction_reference,
        transaction_type,
        category,
        description,
        amount,
        transaction_date,
        status
      FROM transactions
      WHERE customer_id = $1
      ORDER BY transaction_date DESC
      LIMIT 50
      `,
      [customerId]
    )

    res.json({
      success: true,
      transactions: result.rows,
    })
  } catch (error) {
    console.error(
      'Get my transactions error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your transactions',
    })
  }
}

module.exports = {
  getAllTransactions,
  getCustomerTransactions,
  getTransactionById,
  getMyTransactions,
}