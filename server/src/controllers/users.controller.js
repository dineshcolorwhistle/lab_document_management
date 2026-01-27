const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { z } = require('zod')

const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const { loadEnv } = require('../config/env')
const { sendMail } = require('../services/email.service')
const { ROLES } = require('../constants/roles')

const User = require('../models/User')

const createAdminSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email'),
})

const updateAdminSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

/**
 * GET /users?role=ADMIN&page=1&limit=10
 * List admins with pagination. SUPER_ADMIN only.
 */
const listAdmins = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
  const skip = (page - 1) * limit

  const filter = { role: ROLES.ADMIN }
  const [data, total] = await Promise.all([
    User.find(filter)
      .select('name email status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: data.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  })
})

/**
 * POST /users/admins
 * Create admin (name, email), set temp password, send reset link. SUPER_ADMIN only.
 */
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email } = createAdminSchema.parse(req.body)
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    throw new AppError('A user with this email already exists', { statusCode: 409, code: 'EMAIL_IN_USE' })
  }

  const tempPassword = crypto.randomBytes(32).toString('hex')
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = sha256(rawToken)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: ROLES.ADMIN,
    status: 'ACTIVE',
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  })

  const env = loadEnv()
  const baseUrl = env.APP_BASE_URL.replace(/\/$/, '')
  const resetLink = `${baseUrl}/reset-password?token=${rawToken}`

  await sendMail({
    to: user.email,
    subject: 'Set your password – Lab Document Management',
    text: `You've been added as an Admin.\n\nSet your password using this link:\n${resetLink}\n\nThis link expires in 30 minutes. After that, use "Forgot password" on the login page to request a new link.`,
  })

  res.status(201).json({
    success: true,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: 'Admin created. A password-set link has been sent to their email.',
  })
})

/**
 * PATCH /users/admins/:id
 * Update admin name only (email not editable). SUPER_ADMIN only.
 */
const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name } = updateAdminSchema.parse(req.body)

  const user = await User.findOne({ _id: id, role: ROLES.ADMIN })
  if (!user) {
    throw new AppError('Admin not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.name = name.trim()
  await user.save()

  res.json({
    success: true,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
    message: 'Admin updated.',
  })
})

/**
 * PATCH /users/admins/:id/enable
 * Re-enable disabled admin (status = ACTIVE). SUPER_ADMIN only.
 */
const enableAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id, role: ROLES.ADMIN })
  if (!user) {
    throw new AppError('Admin not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.status = 'ACTIVE'
  await user.save()

  res.json({
    success: true,
    message: 'Admin enabled.',
  })
})

/**
 * DELETE /users/admins/:id
 * Soft-delete admin (status = DISABLED). SUPER_ADMIN only.
 */
const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id, role: ROLES.ADMIN })
  if (!user) {
    throw new AppError('Admin not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.status = 'DISABLED'
  await user.save()

  res.json({
    success: true,
    message: 'Admin disabled.',
  })
})

/**
 * DELETE /users/admins/:id/permanent
 * Permanently remove admin from DB. SUPER_ADMIN only.
 */
const deleteAdminPermanent = asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await User.deleteOne({ _id: id, role: ROLES.ADMIN })
  if (result.deletedCount === 0) {
    throw new AppError('Admin not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  res.json({
    success: true,
    message: 'Admin permanently deleted.',
  })
})

module.exports = { listAdmins, createAdmin, updateAdmin, enableAdmin, deleteAdmin, deleteAdminPermanent }
