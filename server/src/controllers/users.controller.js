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

  try {
    await sendMail({
      to: normalizedEmail,
      subject: 'Set your password – Lab Document Management',
      text: `You've been added as an Admin.\n\nSet your password using this link:\n${resetLink}\n\nThis link expires in 30 minutes. After that, use "Forgot password" on the login page to request a new link.`,
    })
  } catch (emailErr) {
    await User.deleteOne({ _id: user._id })
    throw emailErr
  }

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

/**
 * GET /users/lab-owners?page=1&limit=10
 * List lab owners with pagination. ADMIN and SUPER_ADMIN.
 */
const listLabOwners = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
  const skip = (page - 1) * limit

  const filter = { role: ROLES.LAB_OWNER }
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

const createLabOwnerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email'),
})

const updateLabOwnerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

/**
 * POST /users/lab-owners
 * Create lab owner (name, email), set temp password, send reset link. ADMIN and SUPER_ADMIN.
 */
const createLabOwner = asyncHandler(async (req, res) => {
  const { name, email } = createLabOwnerSchema.parse(req.body)
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
    role: ROLES.LAB_OWNER,
    status: 'ACTIVE',
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  })

  const env = loadEnv()
  const baseUrl = env.APP_BASE_URL.replace(/\/$/, '')
  const resetLink = `${baseUrl}/reset-password?token=${rawToken}`
  const emailToSend = normalizedEmail

  try {
    // eslint-disable-next-line no-console
    console.log('[lab-owner] Sending welcome email to:', emailToSend)
    await sendMail({
      to: emailToSend,
      subject: 'Set your password – Lab Document Management',
      text: `You've been added as a Lab Owner.\n\nSet your password using this link:\n${resetLink}\n\nThis link expires in 30 minutes. After that, use "Forgot password" on the login page to request a new link.`,
    })
    // eslint-disable-next-line no-console
    console.log('[lab-owner] Welcome email sent successfully to:', emailToSend)
  } catch (emailErr) {
    // eslint-disable-next-line no-console
    console.error('[lab-owner] Failed to send welcome email to', emailToSend, emailErr?.message || emailErr)
    await User.deleteOne({ _id: user._id })
    throw emailErr
  }

  res.status(201).json({
    success: true,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: 'Lab owner created. A password-set link has been sent to their email.',
  })
})

/**
 * PATCH /users/lab-owners/:id
 * Update lab owner name only. ADMIN and SUPER_ADMIN.
 */
const updateLabOwner = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name } = updateLabOwnerSchema.parse(req.body)

  const user = await User.findOne({ _id: id, role: ROLES.LAB_OWNER })
  if (!user) {
    throw new AppError('Lab owner not found', { statusCode: 404, code: 'NOT_FOUND' })
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
    message: 'Lab owner updated.',
  })
})

/**
 * PATCH /users/lab-owners/:id/enable
 * Re-enable disabled lab owner. ADMIN and SUPER_ADMIN.
 */
const enableLabOwner = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id, role: ROLES.LAB_OWNER })
  if (!user) {
    throw new AppError('Lab owner not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.status = 'ACTIVE'
  await user.save()

  res.json({
    success: true,
    message: 'Lab owner enabled.',
  })
})

/**
 * DELETE /users/lab-owners/:id
 * Soft-delete lab owner (status = DISABLED). ADMIN and SUPER_ADMIN.
 */
const deleteLabOwner = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id, role: ROLES.LAB_OWNER })
  if (!user) {
    throw new AppError('Lab owner not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.status = 'DISABLED'
  await user.save()

  res.json({
    success: true,
    message: 'Lab owner disabled.',
  })
})

/**
 * DELETE /users/lab-owners/:id/permanent
 * Permanently remove lab owner from DB. ADMIN and SUPER_ADMIN.
 */
const deleteLabOwnerPermanent = asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await User.deleteOne({ _id: id, role: ROLES.LAB_OWNER })
  if (result.deletedCount === 0) {
    throw new AppError('Lab owner not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  res.json({
    success: true,
    message: 'Lab owner permanently deleted.',
  })
})

// ——— Lab technicians ———

/**
 * GET /users/lab-technicians?page=1&limit=10
 * List lab technicians. ADMIN and LAB_OWNER.
 */
const listLabTechnicians = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
  const skip = (page - 1) * limit

  const filter = { role: ROLES.LAB_TECHNICIAN }
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

const createLabTechnicianSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email'),
})

const updateLabTechnicianSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
})

/**
 * POST /users/lab-technicians
 * Create lab technician (name, email), set temp password, send reset link. ADMIN only.
 */
const createLabTechnician = asyncHandler(async (req, res) => {
  const { name, email } = createLabTechnicianSchema.parse(req.body)
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
    role: ROLES.LAB_TECHNICIAN,
    status: 'ACTIVE',
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  })

  const env = loadEnv()
  const baseUrl = env.APP_BASE_URL.replace(/\/$/, '')
  const resetLink = `${baseUrl}/reset-password?token=${rawToken}`
  const emailToSend = normalizedEmail

  try {
    // eslint-disable-next-line no-console
    console.log('[lab-technician] Sending welcome email to:', emailToSend)
    await sendMail({
      to: emailToSend,
      subject: 'Set your password – Lab Document Management',
      text: `You've been added as a Lab Technician.\n\nSet your password using this link:\n${resetLink}\n\nThis link expires in 30 minutes. After that, use "Forgot password" on the login page to request a new link.`,
    })
    // eslint-disable-next-line no-console
    console.log('[lab-technician] Welcome email sent successfully to:', emailToSend)
  } catch (emailErr) {
    // eslint-disable-next-line no-console
    console.error('[lab-technician] Failed to send welcome email to', emailToSend, emailErr?.message || emailErr)
    await User.deleteOne({ _id: user._id })
    throw emailErr
  }

  res.status(201).json({
    success: true,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: 'Lab technician created. A password-set link has been sent to their email.',
  })
})

/**
 * PATCH /users/lab-technicians/:id
 * Update lab technician name only. ADMIN only.
 */
const updateLabTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name } = updateLabTechnicianSchema.parse(req.body)

  const user = await User.findOne({ _id: id, role: ROLES.LAB_TECHNICIAN })
  if (!user) {
    throw new AppError('Lab technician not found', { statusCode: 404, code: 'NOT_FOUND' })
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
    message: 'Lab technician updated.',
  })
})

/**
 * PATCH /users/lab-technicians/:id/enable
 * Re-enable disabled lab technician. ADMIN only.
 */
const enableLabTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id, role: ROLES.LAB_TECHNICIAN })
  if (!user) {
    throw new AppError('Lab technician not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.status = 'ACTIVE'
  await user.save()

  res.json({
    success: true,
    message: 'Lab technician enabled.',
  })
})

/**
 * DELETE /users/lab-technicians/:id
 * Soft-delete lab technician (status = DISABLED). ADMIN only.
 */
const deleteLabTechnician = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id, role: ROLES.LAB_TECHNICIAN })
  if (!user) {
    throw new AppError('Lab technician not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  user.status = 'DISABLED'
  await user.save()

  res.json({
    success: true,
    message: 'Lab technician disabled.',
  })
})

/**
 * DELETE /users/lab-technicians/:id/permanent
 * Permanently remove lab technician from DB. ADMIN only.
 */
const deleteLabTechnicianPermanent = asyncHandler(async (req, res) => {
  const { id } = req.params

  const result = await User.deleteOne({ _id: id, role: ROLES.LAB_TECHNICIAN })
  if (result.deletedCount === 0) {
    throw new AppError('Lab technician not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  res.json({
    success: true,
    message: 'Lab technician permanently deleted.',
  })
})

module.exports = {
  listAdmins,
  createAdmin,
  updateAdmin,
  enableAdmin,
  deleteAdmin,
  deleteAdminPermanent,
  listLabOwners,
  createLabOwner,
  updateLabOwner,
  enableLabOwner,
  deleteLabOwner,
  deleteLabOwnerPermanent,
  listLabTechnicians,
  createLabTechnician,
  updateLabTechnician,
  enableLabTechnician,
  deleteLabTechnician,
  deleteLabTechnicianPermanent,
}
