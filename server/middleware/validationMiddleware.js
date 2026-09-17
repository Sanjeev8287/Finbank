const { z } = require('zod')

// ========================================
// COMMON SCHEMAS
// ========================================

const positiveIdSchema = z.coerce
  .number()
  .int()
  .positive()

// ========================================
// LOGIN VALIDATION
// ========================================

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .max(100, 'Username is too long'),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(200, 'Password is too long'),
})

// ========================================
// ID PARAMETER VALIDATION
// ========================================

const idParamSchema = z.object({
  id: positiveIdSchema,
})

const customerIdParamSchema = z.object({
  customerId: positiveIdSchema,
})

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    req.body = result.data

    next()
  }
}

const validateParams = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    req.params = result.data

    next()
  }
}

module.exports = {
  loginSchema,
  idParamSchema,
  customerIdParamSchema,
  validateBody,
  validateParams,
}