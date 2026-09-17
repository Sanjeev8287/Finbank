const pool = require('../db')

const getRMServiceRequests = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId

    const result = await pool.query(`
      SELECT
        sr.*,
        c.customer_code,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM service_requests sr
      INNER JOIN customers c ON c.id = sr.customer_id
      WHERE c.relationship_manager_id = $1
      ORDER BY sr.created_at DESC
    `, [rmId])

    res.json({
      success: true,
      requests: result.rows
    })
  } catch (error) {
    console.error('Get RM service requests error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests'
    })
  }
}

const getRMServiceRequestById = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId
    const requestId = Number(req.params.id)

    const result = await pool.query(`
      SELECT
        sr.*,
        c.customer_code,
        c.full_name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM service_requests sr
      INNER JOIN customers c ON c.id = sr.customer_id
      WHERE sr.id = $1
      AND c.relationship_manager_id = $2
    `, [requestId, rmId])

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      })
    }

    res.json({
      success: true,
      request: result.rows[0]
    })
  } catch (error) {
    console.error('Get RM service request error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service request'
    })
  }
}

module.exports = {
  getRMServiceRequests,
  getRMServiceRequestById
}