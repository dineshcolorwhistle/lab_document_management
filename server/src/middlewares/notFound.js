const { AppError } = require('../utils/AppError')

function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, { statusCode: 404 }))
}

module.exports = { notFound }
