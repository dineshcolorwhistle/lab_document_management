const { z } = require('zod')
const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const { loadEnv } = require('../config/env')
const { sendMail } = require('../services/email.service')
const { ROLES } = require('../constants/roles')

const Lab = require('../models/Lab')
const User = require('../models/User')

const contactSchema = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((val) => !val || /^\d{10}$/.test(val.replace(/\D/g, '').slice(0, 10)), {
    message: 'Contact must be exactly 10 digits (numbers only)',
  })
  .transform((val) => (val ? val.replace(/\D/g, '').slice(0, 10) : ''))

const createLabSchema = z.object({
  name: z.string().trim().min(1, 'Lab name is required'),
  description: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  contact: contactSchema,
  labOwnerIds: z.array(z.string().min(1)).min(1, 'At least one lab owner is required'),
  labTechnicianIds: z.array(z.string().min(1)).min(1, 'At least one lab technician is required'),
})

const updateLabSchema = z.object({
  name: z.string().trim().min(1, 'Lab name is required'),
  description: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  contact: contactSchema,
  labOwnerIds: z.array(z.string().min(1)).min(1, 'At least one lab owner is required'),
  labTechnicianIds: z.array(z.string().min(1)).min(1, 'At least one lab technician is required'),
})

async function sendLabAssignmentEmails(lab, labOwnerUsers, labTechnicianUsers, isNew = true) {
  const env = loadEnv()
  const baseUrl = env.APP_BASE_URL.replace(/\/$/, '')
  const subject = isNew
    ? `Lab assigned – ${lab.name}`
    : `Lab assigned – ${lab.name}`

  const recipients = [
    ...labOwnerUsers.map((u) => ({ email: u.email, name: u.name, role: 'Lab Owner' })),
    ...labTechnicianUsers.map((u) => ({ email: u.email, name: u.name, role: 'Lab Technician' })),
  ]

  const sendPromises = recipients.map(({ email, name, role }) =>
    sendMail({
      to: email,
      subject: `Lab Document Management – ${subject}`,
      text: `Hi ${name},\n\nYou have been assigned as ${role} to the lab "${lab.name}".\n\nLab details:\nName: ${lab.name}\n${lab.description ? `Description: ${lab.description}\n` : ''}${lab.address ? `Address: ${lab.address}\n` : ''}${lab.contact ? `Contact: ${lab.contact}\n` : ''}\nLog in at: ${baseUrl}\n\n– Lab Document Management`,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`[lab] Failed to send assignment email to ${email}:`, err?.message || err)
    }),
  )

  await Promise.all(sendPromises)
}

async function sendLabRemovalEmails(labName, removedOwnerUsers, removedTechnicianUsers) {
  const recipients = [
    ...removedOwnerUsers.map((u) => ({ email: u.email, name: u.name, role: 'Lab Owner' })),
    ...removedTechnicianUsers.map((u) => ({ email: u.email, name: u.name, role: 'Lab Technician' })),
  ]

  const sendPromises = recipients.map(({ email, name, role }) =>
    sendMail({
      to: email,
      subject: `Lab Document Management – Removed from lab "${labName}"`,
      text: `Hi ${name},\n\nYou have been removed as ${role} from the lab "${labName}".\n\n– Lab Document Management`,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`[lab] Failed to send removal email to ${email}:`, err?.message || err)
    }),
  )

  await Promise.all(sendPromises)
}

/**
 * GET /labs?page=1&limit=10
 * List labs with pagination. SUPER_ADMIN and ADMIN.
 */
const listLabs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    Lab.find()
      .populate('labOwners', 'name email')
      .populate('labTechnicians', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lab.countDocuments(),
  ])

  const totalPages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: data.map((lab) => ({
      id: String(lab._id),
      name: lab.name,
      description: lab.description || '',
      address: lab.address || '',
      contact: lab.contact || '',
      status: lab.status,
      labOwners: (lab.labOwners || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      labTechnicians: (lab.labTechnicians || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      createdAt: lab.createdAt,
    })),
    pagination: { page, limit, total, totalPages },
  })
})

/**
 * GET /labs/:id
 * Get one lab. SUPER_ADMIN and ADMIN.
 */
const getLab = asyncHandler(async (req, res) => {
  const lab = await Lab.findById(req.params.id)
    .populate('labOwners', 'name email')
    .populate('labTechnicians', 'name email')
    .lean()

  if (!lab) {
    throw new AppError('Lab not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  res.json({
    success: true,
    lab: {
      id: String(lab._id),
      name: lab.name,
      description: lab.description || '',
      address: lab.address || '',
      contact: lab.contact || '',
      status: lab.status,
      labOwners: (lab.labOwners || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      labTechnicians: (lab.labTechnicians || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      createdAt: lab.createdAt,
      updatedAt: lab.updatedAt,
    },
  })
})

/**
 * POST /labs
 * Create lab. SUPER_ADMIN and ADMIN. Sends email to selected lab owners and technicians.
 */
const createLab = asyncHandler(async (req, res) => {
  const body = createLabSchema.parse(req.body)
  const { name, description, address, contact, labOwnerIds, labTechnicianIds } = body

  const labOwnerUsers = await User.find({
    _id: { $in: labOwnerIds },
    role: ROLES.LAB_OWNER,
    status: 'ACTIVE',
  }).lean()

  const labTechnicianUsers = await User.find({
    _id: { $in: labTechnicianIds },
    role: ROLES.LAB_TECHNICIAN,
    status: 'ACTIVE',
  }).lean()

  if (labOwnerUsers.length !== labOwnerIds.length) {
    throw new AppError('One or more lab owner IDs are invalid or not active lab owners', { statusCode: 400, code: 'VALIDATION_ERROR' })
  }
  if (labTechnicianUsers.length !== labTechnicianIds.length) {
    throw new AppError('One or more lab technician IDs are invalid or not active lab technicians', { statusCode: 400, code: 'VALIDATION_ERROR' })
  }

  const lab = await Lab.create({
    name: name.trim(),
    description: (description || '').trim(),
    address: (address || '').trim(),
    contact: (contact || '').trim(),
    labOwners: labOwnerIds,
    labTechnicians: labTechnicianIds,
  })

  await sendLabAssignmentEmails(
    { name: lab.name, description: lab.description, address: lab.address, contact: lab.contact },
    labOwnerUsers,
    labTechnicianUsers,
    true,
  )

  const populated = await Lab.findById(lab._id)
    .populate('labOwners', 'name email')
    .populate('labTechnicians', 'name email')
    .lean()

  res.status(201).json({
    success: true,
    lab: {
      id: String(populated._id),
      name: populated.name,
      description: populated.description || '',
      address: populated.address || '',
      contact: populated.contact || '',
      status: populated.status,
      labOwners: (populated.labOwners || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      labTechnicians: (populated.labTechnicians || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      createdAt: populated.createdAt,
    },
    message: 'Lab created. Assignment emails have been sent to selected lab owners and technicians.',
  })
})

/**
 * PATCH /labs/:id
 * Update lab. SUPER_ADMIN and ADMIN. Sends email only to newly added and removed lab owners/technicians.
 */
const updateLab = asyncHandler(async (req, res) => {
  const { id } = req.params
  const body = updateLabSchema.parse(req.body)
  const { name, description, address, contact, labOwnerIds, labTechnicianIds } = body

  const lab = await Lab.findById(id)
  if (!lab) {
    throw new AppError('Lab not found', { statusCode: 404, code: 'NOT_FOUND' })
  }

  const previousOwnerIds = (lab.labOwners || []).map((oid) => String(oid))
  const previousTechIds = (lab.labTechnicians || []).map((oid) => String(oid))

  const addedOwnerIds = labOwnerIds.filter((uid) => !previousOwnerIds.includes(uid))
  const addedTechIds = labTechnicianIds.filter((uid) => !previousTechIds.includes(uid))
  const removedOwnerIds = previousOwnerIds.filter((uid) => !labOwnerIds.includes(uid))
  const removedTechIds = previousTechIds.filter((uid) => !labTechnicianIds.includes(uid))

  const labOwnerUsers = await User.find({
    _id: { $in: labOwnerIds },
    role: ROLES.LAB_OWNER,
    status: 'ACTIVE',
  }).lean()

  const labTechnicianUsers = await User.find({
    _id: { $in: labTechnicianIds },
    role: ROLES.LAB_TECHNICIAN,
    status: 'ACTIVE',
  }).lean()

  if (labOwnerUsers.length !== labOwnerIds.length) {
    throw new AppError('One or more lab owner IDs are invalid or not active lab owners', { statusCode: 400, code: 'VALIDATION_ERROR' })
  }
  if (labTechnicianUsers.length !== labTechnicianIds.length) {
    throw new AppError('One or more lab technician IDs are invalid or not active lab technicians', { statusCode: 400, code: 'VALIDATION_ERROR' })
  }

  lab.name = name.trim()
  lab.description = (description || '').trim()
  lab.address = (address || '').trim()
  lab.contact = (contact || '').trim()
  lab.labOwners = labOwnerIds
  lab.labTechnicians = labTechnicianIds
  await lab.save()

  const labDetails = { name: lab.name, description: lab.description, address: lab.address, contact: lab.contact }

  if (addedOwnerIds.length > 0 || addedTechIds.length > 0) {
    const addedOwnerUsers = labOwnerUsers.filter((u) => addedOwnerIds.includes(String(u._id)))
    const addedTechUsers = labTechnicianUsers.filter((u) => addedTechIds.includes(String(u._id)))
    await sendLabAssignmentEmails(labDetails, addedOwnerUsers, addedTechUsers, false)
  }

  if (removedOwnerIds.length > 0 || removedTechIds.length > 0) {
    const [removedOwnerUsers, removedTechUsers] = await Promise.all([
      User.find({ _id: { $in: removedOwnerIds } }).select('name email').lean(),
      User.find({ _id: { $in: removedTechIds } }).select('name email').lean(),
    ])
    await sendLabRemovalEmails(lab.name, removedOwnerUsers, removedTechUsers)
  }

  const populated = await Lab.findById(lab._id)
    .populate('labOwners', 'name email')
    .populate('labTechnicians', 'name email')
    .lean()

  res.json({
    success: true,
    lab: {
      id: String(populated._id),
      name: populated.name,
      description: populated.description || '',
      address: populated.address || '',
      contact: populated.contact || '',
      status: populated.status,
      labOwners: (populated.labOwners || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      labTechnicians: (populated.labTechnicians || []).map((u) => ({ id: String(u._id), name: u.name, email: u.email })),
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    },
    message: 'Lab updated. Emails sent to newly added and removed lab owners/technicians only.',
  })
})

/**
 * DELETE /labs/:id
 * Delete lab. SUPER_ADMIN and ADMIN.
 */
const deleteLab = asyncHandler(async (req, res) => {
  const result = await Lab.deleteOne({ _id: req.params.id })
  if (result.deletedCount === 0) {
    throw new AppError('Lab not found', { statusCode: 404, code: 'NOT_FOUND' })
  }
  res.json({ success: true, message: 'Lab deleted.' })
})

module.exports = {
  listLabs,
  getLab,
  createLab,
  updateLab,
  deleteLab,
}
