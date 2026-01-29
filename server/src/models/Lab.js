const mongoose = require('mongoose')

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    contact: { type: String, trim: true, default: '' },

    labOwners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    labTechnicians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Lab', labSchema)
