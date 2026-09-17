const pool = require('../db')

const getRMAccounts = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId

    const result = await pool.query(`
      SELECT
        a.*,
        c.customer_code,
        c.full_name AS customer_name
      FROM accounts a
      INNER JOIN customers c ON c.id = a.customer_id
      WHERE c.relationship_manager_id = $1
      ORDER BY a.id DESC
    `, [rmId])

    res.json({
      success: true,
      accounts: result.rows
    })
  } catch (error) {
    console.error('Get RM accounts error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    })
  }
}

const getRMAccountById = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId
    const accountId = Number(req.params.id)

    const result = await pool.query(`
      SELECT
        a.*,
        c.customer_code,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM accounts a
      INNER JOIN customers c ON c.id = a.customer_id
      WHERE a.id = $1
      AND c.relationship_manager_id = $2
    `, [accountId, rmId])

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      })
    }

    res.json({
      success: true,
      account: result.rows[0]
    })
  } catch (error) {
    console.error('Get RM account error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account'
    })
  }
}

module.exports = {
  getRMAccounts,
  getRMAccountById
}