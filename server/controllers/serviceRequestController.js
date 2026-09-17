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
// GET ALL SERVICE REQUESTS
// RM / SENIOR_RM / ADMIN
// ========================================

const getAllServiceRequests = async (req, res) => {
  try {
    const role = req.user?.role

    if (!isStaffRole(role)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access service requests',
      })
    }

    let result

    // ADMIN → all service requests
    if (role === 'ADMIN') {
      result = await pool.query(`
        SELECT
          sr.id,
          sr.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          sr.request_number,
          sr.request_type,
          sr.subject,
          sr.description,
          sr.priority,
          sr.status,
          sr.created_at,
          sr.updated_at
        FROM service_requests sr
        LEFT JOIN customers c
          ON sr.customer_id = c.id
        ORDER BY sr.created_at DESC
      `)
    }

    // RM / SENIOR_RM → assigned customers only
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
          sr.id,
          sr.customer_id,
          c.full_name AS customer_name,
          c.customer_code,
          sr.request_number,
          sr.request_type,
          sr.subject,
          sr.description,
          sr.priority,
          sr.status,
          sr.created_at,
          sr.updated_at
        FROM service_requests sr
        INNER JOIN customers c
          ON sr.customer_id = c.id
        WHERE c.relationship_manager_id = $1
        ORDER BY sr.created_at DESC
        `,
        [rmId]
      )
    }

    res.json({
      success: true,
      serviceRequests: result.rows,
    })
  } catch (error) {
    console.error(
      'Get service requests error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
    })
  }
}

// ========================================
// GET CUSTOMER SERVICE REQUESTS
// RM / SENIOR_RM / ADMIN
// ========================================

const getCustomerServiceRequests = async (req, res) => {
  try {
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

    const role = req.user?.role

    if (!isStaffRole(role)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access customer service requests',
      })
    }

    let result

    // ADMIN → any customer
    if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          id,
          customer_id,
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
    }

    // RM / SENIOR_RM → assigned customer only
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
          sr.id,
          sr.customer_id,
          sr.request_number,
          sr.request_type,
          sr.subject,
          sr.description,
          sr.priority,
          sr.status,
          sr.created_at,
          sr.updated_at
        FROM service_requests sr
        INNER JOIN customers c
          ON sr.customer_id = c.id
        WHERE sr.customer_id = $1
        AND c.relationship_manager_id = $2
        ORDER BY sr.created_at DESC
        `,
        [customerId, rmId]
      )
    }

    res.json({
      success: true,
      serviceRequests: result.rows,
    })
  } catch (error) {
    console.error(
      'Get customer service requests error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer service requests',
    })
  }
}

// ========================================
// GET SERVICE REQUEST BY ID
// CUSTOMER → own request only
// RM → assigned customer request only
// ADMIN → any request
// ========================================

const getServiceRequestById = async (req, res) => {
  try {
    const requestId = Number(req.params.id)

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service request ID',
      })
    }

    const role = req.user?.role

    let result

    // CUSTOMER
    if (role === 'CUSTOMER') {
      const customerId =
        getAuthenticatedCustomerId(req)

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer account is not linked',
        })
      }

      result = await pool.query(
        `
        SELECT
          id,
          customer_id,
          request_number,
          request_type,
          subject,
          description,
          priority,
          status,
          created_at,
          updated_at
        FROM service_requests
        WHERE id = $1
        AND customer_id = $2
        `,
        [requestId, customerId]
      )
    }

    // RM / SENIOR_RM
    else if (
      ['RM', 'SENIOR_RM'].includes(role)
    ) {
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
          sr.id,
          sr.customer_id,
          sr.request_number,
          sr.request_type,
          sr.subject,
          sr.description,
          sr.priority,
          sr.status,
          sr.created_at,
          sr.updated_at
        FROM service_requests sr
        INNER JOIN customers c
          ON sr.customer_id = c.id
        WHERE sr.id = $1
        AND c.relationship_manager_id = $2
        `,
        [requestId, rmId]
      )
    }

    // ADMIN
    else if (role === 'ADMIN') {
      result = await pool.query(
        `
        SELECT
          id,
          customer_id,
          request_number,
          request_type,
          subject,
          description,
          priority,
          status,
          created_at,
          updated_at
        FROM service_requests
        WHERE id = $1
        `,
        [requestId]
      )
    }

    // UNKNOWN ROLE
    else {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access this service request',
      })
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      })
    }

    res.json({
      success: true,
      serviceRequest: result.rows[0],
    })
  } catch (error) {
    console.error(
      'Get service request error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch service request',
    })
  }
}

// ========================================
// MY SERVICE REQUESTS
// CUSTOMER ONLY
// ========================================

const getMyServiceRequests = async (req, res) => {
  try {
    const customerId =
      getAuthenticatedCustomerId(req)

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
      serviceRequests: result.rows,
    })
  } catch (error) {
    console.error(
      'Get my service requests error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch your service requests',
    })
  }
}

module.exports = {
  getAllServiceRequests,
  getCustomerServiceRequests,
  getServiceRequestById,
  getMyServiceRequests,
}