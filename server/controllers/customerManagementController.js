const pool = require('../db')

const {
  createAuditLog,
} = require('../utils/auditLogger')

// ========================================
// HELPERS
// ========================================

const getAuthenticatedRMId = (req) => {
  const rmId = Number(
    req.user?.relationshipManagerId
  )

  if (!Number.isInteger(rmId) || rmId <= 0) {
    return null
  }

  return rmId
}

const isStaffRole = (role) => {
  return ['RM', 'SENIOR_RM', 'ADMIN'].includes(role)
}

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return accountNumber
  }

  const value = String(accountNumber)

  if (value.length <= 4) {
    return `XXXX ${value}`
  }

  return `XXXX XXXX ${value.slice(-4)}`
}

const maskCardNumber = (cardNumber) => {
  if (!cardNumber) {
    return cardNumber
  }

  const value = String(cardNumber)

  if (value.length <= 4) {
    return `XXXX ${value}`
  }

  return `XXXX XXXX XXXX ${value.slice(-4)}`
}

// ========================================
// GET RM CUSTOMERS
// RM / SENIOR_RM / ADMIN
// ========================================

const getRMCustomers = async (req, res) => {
  try {
    const role = req.user?.role

    if (!isStaffRole(role)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access customer management',
      })
    }

    let result

    // ========================================
    // ADMIN → ALL CUSTOMERS
    // ========================================

    if (role === 'ADMIN') {
      result = await pool.query(`
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
          c.created_at,
          c.relationship_manager_id,

          COALESCE(a.account_count, 0) AS account_count,
          COALESCE(cd.card_count, 0) AS card_count,
          COALESCE(l.loan_count, 0) AS loan_count,
          COALESCE(sr.request_count, 0) AS request_count

        FROM customers c

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS account_count
          FROM accounts
          GROUP BY customer_id
        ) a
          ON a.customer_id = c.id

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS card_count
          FROM cards
          GROUP BY customer_id
        ) cd
          ON cd.customer_id = c.id

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS loan_count
          FROM loans
          GROUP BY customer_id
        ) l
          ON l.customer_id = c.id

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS request_count
          FROM service_requests
          GROUP BY customer_id
        ) sr
          ON sr.customer_id = c.id

        ORDER BY c.id
      `)
    }

    // ========================================
    // RM / SENIOR_RM → ASSIGNED CUSTOMERS
    // ========================================

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
          c.created_at,
          c.relationship_manager_id,

          COALESCE(a.account_count, 0) AS account_count,
          COALESCE(cd.card_count, 0) AS card_count,
          COALESCE(l.loan_count, 0) AS loan_count,
          COALESCE(sr.request_count, 0) AS request_count

        FROM customers c

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS account_count
          FROM accounts
          GROUP BY customer_id
        ) a
          ON a.customer_id = c.id

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS card_count
          FROM cards
          GROUP BY customer_id
        ) cd
          ON cd.customer_id = c.id

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS loan_count
          FROM loans
          GROUP BY customer_id
        ) l
          ON l.customer_id = c.id

        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*) AS request_count
          FROM service_requests
          GROUP BY customer_id
        ) sr
          ON sr.customer_id = c.id

        WHERE c.relationship_manager_id = $1

        ORDER BY c.id
        `,
        [rmId]
      )
    }

    // ========================================
    // AUDIT CUSTOMER LIST ACCESS
    // ========================================

    await createAuditLog({
      req,
      action: 'VIEW_CUSTOMER_LIST',
      resourceType: 'CUSTOMER',
      resourceId: null,
      description:
        `${role} accessed customer management list`,
    })

    res.json({
      success: true,
      count: result.rows.length,
      customers: result.rows,
    })
  } catch (error) {
    console.error(
      'Get RM customers error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch RM customers',
    })
  }
}

// ========================================
// GET CUSTOMER 360
// RM / SENIOR_RM / ADMIN
// ========================================

const getRMCustomer360 = async (req, res) => {
  try {
    const role = req.user?.role

    if (!isStaffRole(role)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access customer 360',
      })
    }

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

    let customerResult

    // ========================================
    // ADMIN → ANY CUSTOMER
    // ========================================

    if (role === 'ADMIN') {
      customerResult = await pool.query(
        `
        SELECT
          c.*,
          rm.full_name AS rm_name,
          rm.employee_code AS rm_employee_code
        FROM customers c
        LEFT JOIN relationship_managers rm
          ON rm.id = c.relationship_manager_id
        WHERE c.id = $1
        `,
        [customerId]
      )
    }

    // ========================================
    // RM / SENIOR_RM → ASSIGNED CUSTOMER ONLY
    // ========================================

    else {
      const rmId = getAuthenticatedRMId(req)

      if (!rmId) {
        return res.status(400).json({
          success: false,
          message:
            'Relationship manager account is not linked',
        })
      }

      customerResult = await pool.query(
        `
        SELECT
          c.*,
          rm.full_name AS rm_name,
          rm.employee_code AS rm_employee_code
        FROM customers c
        LEFT JOIN relationship_managers rm
          ON rm.id = c.relationship_manager_id
        WHERE c.id = $1
        AND c.relationship_manager_id = $2
        `,
        [customerId, rmId]
      )
    }

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'Customer not found or you do not have access',
      })
    }

    // ========================================
    // ACCOUNTS
    // ========================================

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
        opened_at,
        created_at
      FROM accounts
      WHERE customer_id = $1
      ORDER BY id DESC
      `,
      [customerId]
    )

    const accounts = accountsResult.rows.map(
      (account) => ({
        ...account,
        account_number: maskAccountNumber(
          account.account_number
        ),
      })
    )

    // ========================================
    // CARDS
    // ========================================

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
        status,
        issued_at,
        created_at
      FROM cards
      WHERE customer_id = $1
      ORDER BY id DESC
      `,
      [customerId]
    )

    const cards = cardsResult.rows.map(
      (card) => ({
        ...card,
        card_number: maskCardNumber(
          card.card_number
        ),
      })
    )

    // ========================================
    // LOANS
    // ========================================

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
        start_date,
        created_at
      FROM loans
      WHERE customer_id = $1
      ORDER BY id DESC
      `,
      [customerId]
    )

    // ========================================
    // TRANSACTIONS
    // ========================================

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
        t.account_id,
        a.account_number
      FROM transactions t
      LEFT JOIN accounts a
        ON a.id = t.account_id
      WHERE t.customer_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 20
      `,
      [customerId]
    )

    const transactions =
      transactionsResult.rows.map(
        (transaction) => ({
          ...transaction,
          account_number:
            maskAccountNumber(
              transaction.account_number
            ),
        })
      )

    // ========================================
    // SERVICE REQUESTS
    // ========================================

    const serviceRequestsResult =
      await pool.query(
        `
        SELECT
          id,
          request_number,
          request_type,
          subject,
          description,
          priority,
          status,
          created_at,
          updated_at
        FROM service_requests
        WHERE customer_id = $1
        ORDER BY created_at DESC
        `,
        [customerId]
      )

    // ========================================
    // CUSTOMER FINANCIAL SUMMARY
    // ========================================

    const summaryResult = await pool.query(
      `
      SELECT
        COALESCE(
          (
            SELECT SUM(balance)
            FROM accounts
            WHERE customer_id = $1
            AND status = 'ACTIVE'
          ),
          0
        ) AS total_balance,

        COALESCE(
          (
            SELECT SUM(outstanding_amount)
            FROM loans
            WHERE customer_id = $1
            AND status = 'ACTIVE'
          ),
          0
        ) AS total_loan_outstanding,

        COALESCE(
          (
            SELECT SUM(
              credit_limit - available_limit
            )
            FROM cards
            WHERE customer_id = $1
            AND status = 'ACTIVE'
          ),
          0
        ) AS total_card_used,

        COALESCE(
          (
            SELECT SUM(credit_limit)
            FROM cards
            WHERE customer_id = $1
            AND status = 'ACTIVE'
          ),
          0
        ) AS total_credit_limit
      `,
      [customerId]
    )

    // ========================================
    // AUDIT CUSTOMER 360 ACCESS
    // ========================================

    await createAuditLog({
      req,
      action: 'VIEW_CUSTOMER_360',
      resourceType: 'CUSTOMER',
      resourceId: customerId,
      description:
        `${role} viewed Customer 360 for customer ID ${customerId}`,
    })

    // ========================================
    // RESPONSE
    // ========================================

    res.json({
      success: true,
      customer: customerResult.rows[0],
      summary: summaryResult.rows[0],
      accounts,
      cards,
      loans: loansResult.rows,
      transactions,
      serviceRequests:
        serviceRequestsResult.rows,
    })
  } catch (error) {
    console.error(
      'Get customer 360 error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer 360',
    })
  }
}

module.exports = {
  getRMCustomers,
  getRMCustomer360,
}