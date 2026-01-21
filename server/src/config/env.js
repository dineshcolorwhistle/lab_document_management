const { AppError } = require('../utils/AppError')

function getEnv(key, { required = true, defaultValue } = {}) {
  const value = process.env[key]
  if (value === undefined || value === '') {
    if (required && defaultValue === undefined) {
      throw new AppError(`Missing required environment variable: ${key}`, { statusCode: 500 })
    }
    return defaultValue
  }
  return value
}

function getCorsOrigins(raw) {
  if (!raw) return ['http://localhost:5173']
  if (raw === '*') return ['*']
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function loadEnv() {
  const PORT = Number(getEnv('PORT', { required: false, defaultValue: '5000' }))

  const MONGODB_URI = getEnv('MONGODB_URI', { required: false, defaultValue: '' })
  const JWT_SECRET = getEnv('JWT_SECRET', { required: false, defaultValue: 'dev-secret-change-me' })
  const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', { required: false, defaultValue: '24h' })
  const CORS_ORIGIN = getEnv('CORS_ORIGIN', { required: false, defaultValue: 'http://localhost:5173' })

  // Used to build reset-password links
  const APP_BASE_URL = getEnv('APP_BASE_URL', { required: false, defaultValue: 'http://localhost:5173' })

  // SMTP (optional in dev)
  const SMTP_HOST = getEnv('SMTP_HOST', { required: false, defaultValue: '' })
  const SMTP_PORT = Number(getEnv('SMTP_PORT', { required: false, defaultValue: '587' }))
  const SMTP_SECURE = String(getEnv('SMTP_SECURE', { required: false, defaultValue: 'false' })).toLowerCase() === 'true'
  const SMTP_USER = getEnv('SMTP_USER', { required: false, defaultValue: '' })
  const SMTP_PASS = getEnv('SMTP_PASS', { required: false, defaultValue: '' })
  const SMTP_FROM = getEnv('SMTP_FROM', { required: false, defaultValue: 'no-reply@lab-document-management.local' })

  return {
    NODE_ENV: getEnv('NODE_ENV', { required: false, defaultValue: 'development' }),
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CORS_ORIGIN,
    corsOrigins: getCorsOrigins(CORS_ORIGIN),
    APP_BASE_URL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  }
}

module.exports = { loadEnv }
