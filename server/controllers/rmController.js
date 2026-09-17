const pool = require('../db')

const getRMDashboard = async (req, res) => {
  try {
    const rmId = req.user.relationshipManagerId

    if (!rmId) {
      return res.status(400).json({
        success: false,
        message: 'Relationship manager account is not linked',
      })
    }

    const rmResult = await pool.query(
      `
      SELECT
        id,
        employee_code,
        full_name,
        email,
        phone,
        role,
        status
      FROM relationship_managers
      WHERE id = $1
      `,
      [rmId]
    )

    if (rmResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relationship manager not found',
      })
    }

    const customersResult = await pool.query(
      `
      SELECT
        id,
        customer_code,
        full_name,
        email,
        phone,
        status,
        customer_type
      FROM customers
      WHERE relationship_manager_id = $1
      ORDER BY id
      `,
      [rmId]
    )

    const statsResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_customers,

        COUNT(*) FILTER (
          WHERE status = 'ACTIVE'
        ) AS active_customers,

        COUNT(*) FILTER (
          WHERE status <> 'ACTIVE'
        ) AS inactive_customers
      FROM customers
      WHERE relationship_manager_id = $1
      `,
      [rmId]
    )

    const loansResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_loans,
        COALESCE(SUM(l.outstanding_amount), 0) AS total_outstanding
      FROM loans l
      INNER JOIN customers c
        ON l.customer_id = c.id
      WHERE c.relationship_manager_id = $1
      AND l.status = 'ACTIVE'
      `,
      [rmId]
    )

    const requestsResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (
          WHERE sr.status NOT IN ('CLOSED', 'RESOLVED')
        ) AS open_requests
      FROM service_requests sr
      INNER JOIN customers c
        ON sr.customer_id = c.id
      WHERE c.relationship_manager_id = $1
      `,
      [rmId]
    )

    res.json({
      success: true,
      relationshipManager: rmResult.rows[0],
      stats: {
        ...statsResult.rows[0],
        ...loansResult.rows[0],
        ...requestsResult.rows[0],
      },
      customers: customersResult.rows,
    })
  } catch (error) {
    console.error('Get RM dashboard error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch RM dashboard',
    })
  }
}

module.exports = {
  getRMDashboard,
}