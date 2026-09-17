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
// GET ALL ACCOUNTS
// RM / SENIOR_RM / ADMIN
// ========================================

const getAccounts = async (req, res) => {
  try {
    if (!isStaffRole(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access accounts',
      })
    }

    const rmId = getAuthenticatedRMId(req)

    /*
      RM / SENIOR_RM:
      Only accounts belonging to their assigned customers.

      ADMIN:
      Can access all accounts.
    */

    let result

    if (req.user.role === 'ADMIN') {
      result = await pool.query(`
        SELECT
          a.id,
          a.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          a.account_number,
          a.account_type,
          a.branch_name,
          a.ifsc_code,
          a.balance,
          a.currency,
          a.status,
          a.opened_at,
          a.created_at
        FROM accounts a
        LEFT JOIN customers c
          ON a.customer_id = c.id
        ORDER BY a.id
      `)
    } else {
      if (!rmId) {
        return res.status(400).json({
          success: false,
          message: 'Relationship manager account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          a.id,
          a.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          a.account_number,
          a.account_type,
          a.branch_name,
          a.ifsc_code,
          a.balance,
          a.currency,
          a.status,
          a.opened_at,
          a.created_at
        FROM accounts a
        INNER JOIN customers c
          ON a.customer_id = c.id
        WHERE c.relationship_manager_id = $1
        ORDER BY a.id
        `,
        [rmId]
      )
    }

    res.json({
      success: true,
      accounts: result.rows,
    })
  } catch (error) {
    console.error(
      'Get accounts error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts',
    })
  }
}

// ========================================
// GET ACCOUNT BY ID
// CUSTOMER → own account only
// RM → assigned customer account only
// ADMIN → any account
// ========================================

const getAccountById = async (req, res) => {
  try {
    const accountId = Number(req.params.id)

    if (!Number.isInteger(accountId) || accountId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account ID',
      })
    }

    const role = req.user?.role

    let result

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
          a.id,
          a.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          a.account_number,
          a.account_type,
          a.branch_name,
          a.ifsc_code,
          a.balance,
          a.currency,
          a.status,
          a.opened_at,
          a.created_at
        FROM accounts a
        INNER JOIN customers c
          ON a.customer_id = c.id
        WHERE a.id = $1
        AND a.customer_id = $2
        `,
        [accountId, customerId]
      )
    } else if (
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
          a.id,
          a.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          a.account_number,
          a.account_type,
          a.branch_name,
          a.ifsc_code,
          a.balance,
          a.currency,
          a.status,
          a.opened_at,
          a.created_at
        FROM accounts a
        INNER JOIN customers c
          ON a.customer_id = c.id
        WHERE a.id = $1
        AND c.relationship_manager_id = $2
        `,
        [accountId, rmId]
      )
    } else if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          a.id,
          a.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          a.account_number,
          a.account_type,
          a.branch_name,
          a.ifsc_code,
          a.balance,
          a.currency,
          a.status,
          a.opened_at,
          a.created_at
        FROM accounts a
        LEFT JOIN customers c
          ON a.customer_id = c.id
        WHERE a.id = $1
        `,
        [accountId]
      )
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this account',
      })
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      })
    }

    res.json({
      success: true,
      account: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Get account error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch account',
    })
  }
}

// ========================================
// GET CUSTOMER ACCOUNTS
// RM / SENIOR_RM / ADMIN
// ========================================

const getCustomerAccounts = async (req, res) => {
  try {
    const customerId = Number(req.params.customerId)

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
        message: 'You do not have permission to access customer accounts',
      })
    }

    let result

    if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          id,
          customer_id,
          account_number,
          account_type,
          branch_name,
          ifsc_code,
          balance,
          currency,
          status,
          opened_at,
          created_at
        FROM accounts
        WHERE customer_id = $1
        ORDER BY id
        `,
        [customerId]
      )
    } else {
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
          a.id,
          a.customer_id,
          a.account_number,
          a.account_type,
          a.branch_name,
          a.ifsc_code,
          a.balance,
          a.currency,
          a.status,
          a.opened_at,
          a.created_at
        FROM accounts a
        INNER JOIN customers c
          ON a.customer_id = c.id
        WHERE a.customer_id = $1
        AND c.relationship_manager_id = $2
        ORDER BY a.id
        `,
        [customerId, rmId]
      )
    }

    res.json({
      success: true,
      accounts: result.rows,
    })
  } catch (error) {
    console.error(
      'Get customer accounts error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer accounts',
    })
  }
}

// ========================================
// MY ACCOUNTS
// CUSTOMER ONLY
// ========================================

const getMyAccounts = async (req, res) => {
  try {
    const customerId = getAuthenticatedCustomerId(req)

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
        account_number,
        account_type,
        branch_name,
        ifsc_code,
        balance,
        currency,
        status,
        opened_at,
        created_at
      FROM accounts
      WHERE customer_id = $1
      ORDER BY id
      `,
      [customerId]
    )

    const accounts = result.rows.map(
      (account) => ({
        ...account,
        account_number:
          account.account_number
            ? `XXXX XXXX ${String(
                account.account_number
              ).slice(-4)}`
            : account.account_number,
      })
    )

    res.json({
      success: true,
      accounts,
    })
  } catch (error) {
    console.error(
      'Get my accounts error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your accounts',
    })
  }
}

module.exports = {
  getAccounts,
  getAccountById,
  getCustomerAccounts,
  getMyAccounts,
}