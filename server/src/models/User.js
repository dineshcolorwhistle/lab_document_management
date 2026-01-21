const mongoose = require('mongoose')
const { ROLES } = require('../constants/roles')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    // Never store plaintext passwords
    passwordHash: { type: String, required: true, select: false },

    // Forgot-password flow (store only a hash; never store the raw token)
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },

    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      default: ROLES.LAB_TECHNICIAN,
    },

    status: { type: String, enum: ['ACTIVE', 'DISABLED'], default: 'ACTIVE' },

    // Future: restrict by assigned labs and/or ownership
    assignedLabs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lab', default: [] }],

    // Optional app-scope field (useful for multi-tenant in the future)
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: false, index: true },
  },
  { timestamps: true },
)

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash
    return ret
  },
})

module.exports = mongoose.model('User', userSchema)
