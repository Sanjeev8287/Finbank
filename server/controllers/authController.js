const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')

const {
  createAuditLog,
} = require('../utils/auditLogger')

// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      })
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.password_hash,
        u.role,
        u.status,
        u.customer_id,
        u.relationship_manager_id
      FROM users u
      WHERE u.username = $1
      `,
      [username.trim()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }

    const user = result.rows[0]

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        customerId: user.customer_id,
        relationshipManagerId:
          user.relationship_manager_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || '8h',
      }
    )

    // ========================================
    // AUDIT SUCCESSFUL LOGIN
    // ========================================

    await createAuditLog({
      req: {
        ...req,
        user: {
          userId: user.id,
          username: user.username,
          role: user.role,
          customerId: user.customer_id,
          relationshipManagerId:
            user.relationship_manager_id,
        },
      },
      action: 'LOGIN_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user.id,
      description:
        `User ${user.username} logged in successfully`,
    })

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        customer_id: user.customer_id,
        relationship_manager_id:
          user.relationship_manager_id,
      },
    })
  } catch (error) {
    console.error(
      'Login error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Login failed',
    })
  }
}

// ========================================
// GET CURRENT USER
// ========================================

const getMe = async (req, res) => {
  try {
    const user = req.user

    res.json({
      success: true,
      user: {
        id: user.userId,
        username: user.username,
        role: user.role,
        customer_id: user.customerId,
        relationship_manager_id:
          user.relationshipManagerId,
      },
    })
  } catch (error) {
    console.error(
      'Get me error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch user information',
    })
  }
}

module.exports = {
  login,
  getMe,
}