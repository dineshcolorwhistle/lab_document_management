const bcrypt = require('bcryptjs')
const { z } = require('zod')
const crypto = require('crypto')

const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const { signJwt } = require('../utils/jwt')
const { loadEnv } = require('../config/env')
const { sendMail } = require('../services/email.service')

const User = require('../models/User')

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8),
})

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)

  const normalizedEmail = email.toLowerCase()

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
  if (!user) {
    throw new AppError('Invalid email or password', { statusCode: 401, code: 'AUTH_INVALID' })
  }
  if (user.status !== 'ACTIVE') {
    throw new AppError('Account is disabled', { statusCode: 403, code: 'AUTH_DISABLED' })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    throw new AppError('Invalid email or password', { statusCode: 401, code: 'AUTH_INVALID' })
  }

  const env = loadEnv()
  const token = signJwt(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    { secret: env.JWT_SECRET, expiresIn: env.JWT_EXPIRES_IN },
  )

  res.json({
    success: true,
    token,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body)
  const normalizedEmail = email.toLowerCase()

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetTokenHash +passwordResetExpiresAt')

  // Always respond success to avoid email enumeration.
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = sha256(rawToken)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

  user.passwordResetTokenHash = tokenHash
  user.passwordResetExpiresAt = expiresAt
  await user.save()

  const env = loadEnv()
  const resetLink = `${env.APP_BASE_URL.replace(/\/$/, '')}/reset-password?token=${rawToken}`

  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    text: `A password reset was requested for your account.\n\nReset link: ${resetLink}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
  })

  return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
})

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body)

  const tokenHash = sha256(token)
  const now = new Date()

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: now },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt')

  if (!user) {
    throw new AppError('Invalid or expired reset token', { statusCode: 400, code: 'RESET_INVALID' })
  }

  user.passwordHash = await bcrypt.hash(password, 10)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  await user.save()

  res.json({ success: true, message: 'Password reset successful' })
})

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    throw new AppError('User not found', { statusCode: 404 })
  }
  res.json({
    success: true,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
})

module.exports = { login, me, forgotPassword, resetPassword }
