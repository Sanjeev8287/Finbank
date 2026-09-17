const pool = require('../db')

const getCustomerId = (req, res) => {
  const customerId = Number(req.user?.customerId)

  if (!Number.isInteger(customerId) || customerId <= 0) {
    res.status(400).json({
      success: false,
      message: 'Customer account is not properly linked',
    })

    return null
  }

  return customerId
}

// ===============================
// MY ACCOUNTS
// ===============================
const getMyAccounts = async (req, res) => {
  try {
    const customerId = getCustomerId(req, res)

    if (!customerId) return

    const result = await pool.query(
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

    const accounts = result.rows.map((account) => ({
      ...account,
      account_number: account.account_number
        ? `XXXX XXXX ${String(account.account_number).slice(-4)}`
        : account.account_number,
    }))

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
      message: 'Failed to fetch accounts',
    })
  }
}

// ===============================
// MY CARDS
// ===============================
const getMyCards = async (req, res) => {
  try {
    const customerId = getCustomerId(req, res)

    if (!customerId) return

    const result = await pool.query(
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

    const cards = result.rows.map((card) => ({
      ...card,
      card_number: card.card_number
        ? `XXXX XXXX XXXX ${String(card.card_number).slice(-4)}`
        : card.card_number,
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
      message: 'Failed to fetch cards',
    })
  }
}

// ===============================
// MY LOANS
// ===============================
const getMyLoans = async (req, res) => {
  try {
    const customerId = getCustomerId(req, res)

    if (!customerId) return

    const result = await pool.query(
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
      message: 'Failed to fetch loans',
    })
  }
}

// ===============================
// MY TRANSACTIONS
// ===============================
const getMyTransactions = async (req, res) => {
  try {
    const customerId = getCustomerId(req, res)

    if (!customerId) return

    const result = await pool.query(
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
      LIMIT 50
      `,
      [customerId]
    )

    const transactions = result.rows.map(
      (transaction) => ({
        ...transaction,
        account_number:
          transaction.account_number
            ? `XXXX XXXX ${String(
                transaction.account_number
              ).slice(-4)}`
            : transaction.account_number,
      })
    )

    res.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error(
      'Get my transactions error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    })
  }
}

// ===============================
// MY SERVICE REQUESTS
// ===============================
const getMyServiceRequests = async (req, res) => {
  try {
    const customerId = getCustomerId(req, res)

    if (!customerId) return

    const result = await pool.query(
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

    res.json({
      success: true,
      requests: result.rows,
    })
  } catch (error) {
    console.error(
      'Get my service requests error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
    })
  }
}

module.exports = {
  getMyAccounts,
  getMyCards,
  getMyLoans,
  getMyTransactions,
  getMyServiceRequests,
}