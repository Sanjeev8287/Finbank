const pool = require('../db')

// ========================================
// GET AUDIT LOGS
// ADMIN ONLY
// ========================================

const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        username,
        role,
        action,
        resource_type,
        resource_id,
        description,
        ip_address,
        user_agent,
        created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 200
    `)

    res.json({
      success: true,
      count: result.rows.length,
      auditLogs: result.rows,
    })
  } catch (error) {
    console.error(
      'Get audit logs error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
    })
  }
}

// ========================================
// GET MY AUDIT ACTIVITY
// ADMIN / RM / SENIOR_RM
// ========================================

const getMyAuditActivity = async (req, res) => {
  try {
    const userId = Number(req.user?.userId)

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid authenticated user',
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        role,
        action,
        resource_type,
        resource_id,
        description,
        created_at
      FROM audit_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
      `,
      [userId]
    )

    res.json({
      success: true,
      count: result.rows.length,
      auditLogs: result.rows,
    })
  } catch (error) {
    console.error(
      'Get my audit activity error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit activity',
    })
  }
}

module.exports = {
  getAuditLogs,
  getMyAuditActivity,
}