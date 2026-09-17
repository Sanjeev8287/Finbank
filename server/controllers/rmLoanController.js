const pool = require('../db')

const getRMLoans = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId

    const result = await pool.query(`
      SELECT
        l.*,
        c.customer_code,
        c.full_name AS customer_name
      FROM loans l
      INNER JOIN customers c ON c.id = l.customer_id
      WHERE c.relationship_manager_id = $1
      ORDER BY l.id DESC
    `, [rmId])

    res.json({
      success: true,
      loans: result.rows
    })
  } catch (error) {
    console.error('Get RM loans error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans'
    })
  }
}

const getRMLoanById = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId
    const loanId = Number(req.params.id)

    const result = await pool.query(`
      SELECT
        l.*,
        c.customer_code,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM loans l
      INNER JOIN customers c ON c.id = l.customer_id
      WHERE l.id = $1
      AND c.relationship_manager_id = $2
    `, [loanId, rmId])

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      })
    }

    res.json({
      success: true,
      loan: result.rows[0]
    })
  } catch (error) {
    console.error('Get RM loan error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan'
    })
  }
}

module.exports = {
  getRMLoans,
  getRMLoanById
}