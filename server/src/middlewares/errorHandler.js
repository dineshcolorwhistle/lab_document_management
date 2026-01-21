const { AppError } = require('../utils/AppError')

function errorHandler(err, _req, res, _next) {
  // Normalize known error types
  let normalized = err

  // Mongoose cast errors (bad ObjectId, etc.)
  if (err?.name === 'CastError') {
    normalized = new AppError('Invalid identifier', { statusCode: 400, code: 'CAST_ERROR' })
  }

  const statusCode =
    typeof normalized?.statusCode === 'number' ? normalized.statusCode : normalized ? 500 : 500

  const payload = {
    success: false,
    message: normalized?.message || 'Internal Server Error',
  }

  if (normalized instanceof AppError && normalized.code) payload.code = normalized.code
  if (normalized instanceof AppError && normalized.details) payload.details = normalized.details

  // Avoid leaking stack traces in production
  if (process.env.NODE_ENV !== 'production' && normalized?.stack) {
    payload.stack = normalized.stack
  }

  res.status(statusCode).json(payload)
}

module.exports = { errorHandler }
