const { AppError } = require('../utils/AppError')
const { verifyJwt } = require('../utils/jwt')
const { loadEnv } = require('../config/env')

function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization
  if (!header || typeof header !== 'string') return null
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

/**
 * Verifies JWT and attaches `req.user` (id/role) and `req.auth` (raw payload).
 * Expects token payload to include `sub` or `userId`, and `role`.
 */
function requireAuth(req, _res, next) {
  try {
    const token = getBearerToken(req)
    if (!token) {
      throw new AppError('Unauthorized', { statusCode: 401, code: 'AUTH_MISSING' })
    }

    const env = loadEnv()
    const payload = verifyJwt(token, { secret: env.JWT_SECRET })

    const id = payload?.sub || payload?.userId
    const role = payload?.role

    if (!id || !role) {
      throw new AppError('Invalid token', { statusCode: 401, code: 'AUTH_INVALID' })
    }

    req.auth = payload
    req.user = { id, role }
    next()
  } catch (err) {
    // jwt.verify throws for expired/invalid tokens
    next(
      err instanceof AppError
        ? err
        : new AppError('Unauthorized', { statusCode: 401, code: 'AUTH_INVALID' }),
    )
  }
}

module.exports = { requireAuth }
