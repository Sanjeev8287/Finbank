const pool = require('../db')

const getRMActivity = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId

    const transactionsResult = await pool.query(`
      SELECT
        'TRANSACTION' AS activity_type,
        t.id,
        t.transaction_reference AS reference,
        t.description,
        t.amount,
        t.transaction_date AS activity_date,
        t.status,
        c.customer_code,
        c.full_name AS customer_name
      FROM transactions t
      INNER JOIN customers c ON c.id = t.customer_id
      WHERE c.relationship_manager_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 30
    `, [rmId])

    const requestsResult = await pool.query(`
      SELECT
        'SERVICE_REQUEST' AS activity_type,
        sr.id,
        sr.request_number AS reference,
        sr.subject AS description,
        NULL AS amount,
        sr.created_at AS activity_date,
        sr.status,
        c.customer_code,
        c.full_name AS customer_name
      FROM service_requests sr
      INNER JOIN customers c ON c.id = sr.customer_id
      WHERE c.relationship_manager_id = $1
      ORDER BY sr.created_at DESC
      LIMIT 30
    `, [rmId])

    const activity = [
      ...transactionsResult.rows,
      ...requestsResult.rows
    ].sort(
      (a, b) =>
        new Date(b.activity_date) -
        new Date(a.activity_date)
    )

    res.json({
      success: true,
      count: activity.length,
      activity: activity.slice(0, 50)
    })
  } catch (error) {
    console.error('Get RM activity error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RM activity'
    })
  }
}

module.exports = {
  getRMActivity
}