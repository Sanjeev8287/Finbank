const pool = require('../db')

const createAuditLog = async ({
  req,
  action,
  resourceType = null,
  resourceId = null,
  description = null,
}) => {
  try {
    const user = req.user || {}

    const userAgent =
      typeof req.get === 'function'
        ? req.get('user-agent')
        : req.headers?.['user-agent'] || null

    const ipAddress =
      req.ip ||
      req.headers?.['x-forwarded-for'] ||
      null

    await pool.query(
      `
      INSERT INTO audit_logs (
        user_id,
        username,
        role,
        action,
        resource_type,
        resource_id,
        description,
        ip_address,
        user_agent
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      `,
      [
        user.userId || null,
        user.username || null,
        user.role || null,
        action,
        resourceType,
        resourceId !== null
          ? String(resourceId)
          : null,
        description,
        ipAddress,
        userAgent,
      ]
    )
  } catch (error) {
    // Audit failure should never break the main API request
    console.error(
      'Audit log error:',
      error.message
    )
  }
}

module.exports = {
  createAuditLog,
}