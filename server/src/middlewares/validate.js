const { ZodError } = require('zod')
const { AppError } = require('../utils/AppError')

/**
 * Zod-based request validation middleware.
 * @param {{ body?: any, params?: any, query?: any }} schemas
 */
function validate(schemas) {
  return function validateRequest(req, _res, next) {
    try {
      if (schemas?.body) req.body = schemas.body.parse(req.body)
      if (schemas?.params) req.params = schemas.params.parse(req.params)
      if (schemas?.query) req.query = schemas.query.parse(req.query)
      return next()
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError('Validation error', {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details: err.issues,
          }),
        )
      }
      return next(err)
    }
  }
}

module.exports = { validate }
