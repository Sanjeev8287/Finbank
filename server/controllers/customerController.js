const pool = require('../db')

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.customer_code,
        c.full_name,
        c.email,
        c.phone,
        c.date_of_birth,
        c.gender,
        c.address,
        c.city,
        c.state,
        c.pincode,
        c.status,
        c.customer_type,
        c.relationship_manager_id,
        rm.full_name AS rm_name
      FROM customers c
      LEFT JOIN relationship_managers rm
        ON c.relationship_manager_id = rm.id
      ORDER BY c.id
    `)

    res.json({
      success: true,
      customers: result.rows,
    })
  } catch (error) {
    console.error('Get customers error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
    })
  }
}

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.customer_code,
        c.full_name,
        c.email,
        c.phone,
        c.date_of_birth,
        c.gender,
        c.address,
        c.city,
        c.state,
        c.pincode,
        c.status,
        c.customer_type,
        c.relationship_manager_id,
        rm.full_name AS rm_name
      FROM customers c
      LEFT JOIN relationship_managers rm
        ON c.relationship_manager_id = rm.id
      WHERE c.id = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
    }

    res.json({
      success: true,
      customer: result.rows[0],
    })
  } catch (error) {
    console.error('Get customer error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
    })
  }
}

const getMyProfile = async (req, res) => {
  try {
    const customerId = req.user.customerId

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer account is not linked',
      })
    }

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.customer_code,
        c.full_name,
        c.email,
        c.phone,
        c.date_of_birth,
        c.gender,
        c.address,
        c.city,
        c.state,
        c.pincode,
        c.status,
        c.customer_type,
        rm.full_name AS rm_name,
        rm.email AS rm_email,
        rm.phone AS rm_phone
      FROM customers c
      LEFT JOIN relationship_managers rm
        ON c.relationship_manager_id = rm.id
      WHERE c.id = $1
      `,
      [customerId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found',
      })
    }

    res.json({
      success: true,
      profile: result.rows[0],
    })
  } catch (error) {
    console.error('Get my profile error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    })
  }
}

const getMyDashboard = async (req, res) => {
  try {
    const customerId = req.user.customerId

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer account is not linked',
      })
    }

    const customerResult = await pool.query(
      `
      SELECT
        c.id,
        c.customer_code,
        c.full_name,
        c.email,
        c.phone,
        c.city,
        c.state,
        c.status,
        c.customer_type,
        rm.full_name AS rm_name
      FROM customers c
      LEFT JOIN relationship_managers rm
        ON c.relationship_manager_id = rm.id
      WHERE c.id = $1
      `,
      [customerId]
    )

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      })
    }

    const accountsResult = await pool.query(
      `
      SELECT
        id,
        account_number,
        account_type,
        branch_name,
        ifsc_code,
        balance,
        currency,
        status,
        opened_at
      FROM accounts
      WHERE customer_id = $1
      ORDER BY id
      `,
      [customerId]
    )

    const cardsResult = await pool.query(
      `
      SELECT
        id,
        card_number,
        card_type,
        card_variant,
        expiry_date,
        credit_limit,
        available_limit,
        status
      FROM cards
      WHERE customer_id = $1
      ORDER BY id
      `,
      [customerId]
    )

    const loansResult = await pool.query(
      `
      SELECT
        id,
        loan_number,
        loan_type,
        principal_amount,
        outstanding_amount,
        interest_rate,
        emi_amount,
        next_emi_date,
        tenure_months,
        status,
        start_date
      FROM loans
      WHERE customer_id = $1
      ORDER BY id
      `,
      [customerId]
    )

    const transactionsResult = await pool.query(
      `
      SELECT
        t.id,
        t.transaction_reference,
        t.transaction_type,
        t.category,
        t.description,
        t.amount,
        t.transaction_date,
        t.status,
        t.account_id
      FROM transactions t
      WHERE t.customer_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 10
      `,
      [customerId]
    )

    const totalsResult = await pool.query(
      `
      SELECT
        COALESCE(
          (SELECT SUM(balance)
           FROM accounts
           WHERE customer_id = $1
           AND status = 'ACTIVE'),
          0
        ) AS total_balance,

        COALESCE(
          (SELECT SUM(outstanding_amount)
           FROM loans
           WHERE customer_id = $1
           AND status = 'ACTIVE'),
          0
        ) AS total_loan_outstanding,

        COALESCE(
          (SELECT SUM(credit_limit - available_limit)
           FROM cards
           WHERE customer_id = $1
           AND status = 'ACTIVE'),
          0
        ) AS total_card_used
      `,
      [customerId]
    )

    res.json({
      success: true,
      customer: customerResult.rows[0],
      summary: totalsResult.rows[0],
      accounts: accountsResult.rows,
      cards: cardsResult.rows,
      loans: loansResult.rows,
      recentTransactions: transactionsResult.rows,
    })
  } catch (error) {
    console.error('Get customer dashboard error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer dashboard',
    })
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  getMyProfile,
  getMyDashboard,
}