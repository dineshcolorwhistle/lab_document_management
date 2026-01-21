const { AppError } = require('../utils/AppError')

/**
 * Restrict access to certain roles.
 * Usage: authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
 */
function authorizeRoles(...allowedRoles) {
  const allowed = new Set(allowedRoles.flat().filter(Boolean))

  return function authorize(req, _res, next) {
    const role = req.user?.role
    if (!role) {
      return next(new AppError('Unauthorized', { statusCode: 401, code: 'AUTH_MISSING' }))
    }
    if (!allowed.has(role)) {
      return next(new AppError('Forbidden', { statusCode: 403, code: 'FORBIDDEN' }))
    }
    return next()
  }
}

module.exports = { authorizeRoles }
