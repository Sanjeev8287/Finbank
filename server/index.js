const express = require('express')
const cors = require('cors')
require('dotenv').config()

const pool = require('./db')

// ========================================
// SECURITY
// ========================================

const {
  securityHeaders,
  apiRateLimiter,
} = require('./middleware/securityMiddleware')

// ========================================
// AUTHENTICATION
// ========================================

const authRoutes = require('./routes/authRoutes')

// ========================================
// CUSTOMER APIs
// ========================================

const customerRoutes = require('./routes/customerRoutes')
const accountRoutes = require('./routes/accountRoutes')
const cardRoutes = require('./routes/cardRoutes')
const loanRoutes = require('./routes/loanRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const serviceRequestRoutes = require('./routes/serviceRequestRoutes')

// ========================================
// RM APIs
// ========================================

const rmRoutes = require('./routes/rmRoutes')
const customerManagementRoutes = require('./routes/customerManagementRoutes')
const rmAccountRoutes = require('./routes/rmAccountRoutes')
const rmCardRoutes = require('./routes/rmCardRoutes')
const rmLoanRoutes = require('./routes/rmLoanRoutes')
const rmServiceRequestRoutes = require('./routes/rmServiceRequestRoutes')
const rmActivityRoutes = require('./routes/rmActivityRoutes')

// ========================================
// AUDIT APIs
// ========================================

const auditRoutes = require('./routes/auditRoutes')

// ========================================
// AI APIs
// ========================================

const aiRoutes = require('./routes/aiRoutes')

// ========================================
// APP
// ========================================

const app = express()

const PORT = process.env.PORT || 5000

// ========================================
// SECURITY MIDDLEWARE
// ========================================

app.use(securityHeaders)

// ========================================
// CORS
// Local Development + Vercel Production
// ========================================

const allowedOrigins = [
  'http://localhost:5173',
  'https://finbank-8a2a.vercel.app',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as server-to-server or health-check requests
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(
        new Error('Not allowed by CORS')
      )
    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],

    credentials: false,
  })
)

app.use(
  express.json({
    limit: '1mb',
  })
)

// ========================================
// GLOBAL API RATE LIMITER
// ========================================

app.use(
  '/api',
  apiRateLimiter
)

// ========================================
// ROOT HEALTH CHECK
// ========================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FinBank API is running',
  })
})

// ========================================
// DATABASE TEST
// ========================================

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW()'
    )

    res.json({
      success: true,
      message:
        'Database connected successfully',
      time: result.rows[0].now,
    })
  } catch (error) {
    console.error(
      'Database test error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message:
        'Database connection failed',
    })
  }
})

// ========================================
// AUTHENTICATION
// ========================================

app.use(
  '/api/auth',
  authRoutes
)

// ========================================
// CUSTOMER APIs
// ========================================

app.use(
  '/api/customers',
  customerRoutes
)

app.use(
  '/api/accounts',
  accountRoutes
)

app.use(
  '/api/cards',
  cardRoutes
)

app.use(
  '/api/loans',
  loanRoutes
)

app.use(
  '/api/transactions',
  transactionRoutes
)

app.use(
  '/api/service-requests',
  serviceRequestRoutes
)

// ========================================
// RM APIs
// ========================================

app.use(
  '/api/rm',
  rmRoutes
)

app.use(
  '/api/rm/customers',
  customerManagementRoutes
)

app.use(
  '/api/rm/accounts',
  rmAccountRoutes
)

app.use(
  '/api/rm/cards',
  rmCardRoutes
)

app.use(
  '/api/rm/loans',
  rmLoanRoutes
)

app.use(
  '/api/rm/service-requests',
  rmServiceRequestRoutes
)

app.use(
  '/api/rm/activity',
  rmActivityRoutes
)

// ========================================
// AUDIT APIs
// ========================================

app.use(
  '/api/audit',
  auditRoutes
)


// AI APIs


app.use(
  '/api/ai',
  aiRoutes
)


// 404 HANDLER


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  })
})


// GLOBAL ERROR HANDLER


app.use(
  (error, req, res, next) => {
    console.error(
      'Unhandled server error:',
      error.message
    )

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
)


// START SERVER


app.listen(PORT, () => {
  console.log(
    `FinBank server running on http://localhost:${PORT}`
  )
})