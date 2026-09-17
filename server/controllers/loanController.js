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
// GET ALL LOANS
// RM / SENIOR_RM / ADMIN
// ========================================

const getLoans = async (req, res) => {
  try {
    const role = req.user?.role

    if (!isStaffRole(role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access loans',
      })
    }

    let result

    // ADMIN → all loans
    if (role === 'ADMIN') {
      result = await pool.query(`
        SELECT
          l.id,
          l.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          l.loan_number,
          l.loan_type,
          l.principal_amount,
          l.outstanding_amount,
          l.interest_rate,
          l.emi_amount,
          l.next_emi_date,
          l.tenure_months,
          l.status,
          l.start_date,
          l.created_at
        FROM loans l
        LEFT JOIN customers c
          ON l.customer_id = c.id
        ORDER BY l.id
      `)
    }

    // RM / SENIOR_RM → assigned customers only
    else {
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
          l.id,
          l.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          l.loan_number,
          l.loan_type,
          l.principal_amount,
          l.outstanding_amount,
          l.interest_rate,
          l.emi_amount,
          l.next_emi_date,
          l.tenure_months,
          l.status,
          l.start_date,
          l.created_at
        FROM loans l
        INNER JOIN customers c
          ON l.customer_id = c.id
        WHERE c.relationship_manager_id = $1
        ORDER BY l.id
        `,
        [rmId]
      )
    }

    res.json({
      success: true,
      loans: result.rows,
    })
  } catch (error) {
    console.error(
      'Get loans error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans',
    })
  }
}

// ========================================
// GET LOAN BY ID
// CUSTOMER → own loan only
// RM → assigned customer loan only
// ADMIN → any loan
// ========================================

const getLoanById = async (req, res) => {
  try {
    const loanId = Number(req.params.id)

    if (!Number.isInteger(loanId) || loanId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan ID',
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
          l.id,
          l.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          l.loan_number,
          l.loan_type,
          l.principal_amount,
          l.outstanding_amount,
          l.interest_rate,
          l.emi_amount,
          l.next_emi_date,
          l.tenure_months,
          l.status,
          l.start_date,
          l.created_at
        FROM loans l
        INNER JOIN customers c
          ON l.customer_id = c.id
        WHERE l.id = $1
        AND l.customer_id = $2
        `,
        [loanId, customerId]
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
          l.id,
          l.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          l.loan_number,
          l.loan_type,
          l.principal_amount,
          l.outstanding_amount,
          l.interest_rate,
          l.emi_amount,
          l.next_emi_date,
          l.tenure_months,
          l.status,
          l.start_date,
          l.created_at
        FROM loans l
        INNER JOIN customers c
          ON l.customer_id = c.id
        WHERE l.id = $1
        AND c.relationship_manager_id = $2
        `,
        [loanId, rmId]
      )
    }

    // ADMIN
    else if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          l.id,
          l.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          l.loan_number,
          l.loan_type,
          l.principal_amount,
          l.outstanding_amount,
          l.interest_rate,
          l.emi_amount,
          l.next_emi_date,
          l.tenure_months,
          l.status,
          l.start_date,
          l.created_at
        FROM loans l
        LEFT JOIN customers c
          ON l.customer_id = c.id
        WHERE l.id = $1
        `,
        [loanId]
      )
    }

    // UNKNOWN ROLE
    else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this loan',
      })
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found',
      })
    }

    res.json({
      success: true,
      loan: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Get loan error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan',
    })
  }
}

// ========================================
// GET CUSTOMER LOANS
// RM / SENIOR_RM / ADMIN
// ========================================

const getCustomerLoans = async (req, res) => {
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
          'You do not have permission to access customer loans',
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
          loan_number,
          loan_type,
          principal_amount,
          outstanding_amount,
          interest_rate,
          emi_amount,
          next_emi_date,
          tenure_months,
          status,
          start_date,
          created_at
        FROM loans
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
          l.id,
          l.customer_id,
          l.loan_number,
          l.loan_type,
          l.principal_amount,
          l.outstanding_amount,
          l.interest_rate,
          l.emi_amount,
          l.next_emi_date,
          l.tenure_months,
          l.status,
          l.start_date,
          l.created_at
        FROM loans l
        INNER JOIN customers c
          ON l.customer_id = c.id
        WHERE l.customer_id = $1
        AND c.relationship_manager_id = $2
        ORDER BY l.id
        `,
        [customerId, rmId]
      )
    }

    res.json({
      success: true,
      loans: result.rows,
    })
  } catch (error) {
    console.error(
      'Get customer loans error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer loans',
    })
  }
}

// ========================================
// MY LOANS
// CUSTOMER ONLY
// ========================================

const getMyLoans = async (req, res) => {
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
        loan_number,
        loan_type,
        principal_amount,
        outstanding_amount,
        interest_rate,
        emi_amount,
        next_emi_date,
        tenure_months,
        status,
        start_date,
        created_at
      FROM loans
      WHERE customer_id = $1
      ORDER BY id
      `,
      [customerId]
    )

    res.json({
      success: true,
      loans: result.rows,
    })
  } catch (error) {
    console.error(
      'Get my loans error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your loans',
    })
  }
}

module.exports = {
  getLoans,
  getLoanById,
  getCustomerLoans,
  getMyLoans,
}