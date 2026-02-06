const mongoose = require('mongoose')

const documentTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true, default: '' },
        is_equipment_related: { type: Boolean, default: false },
        is_personnel_related: { type: Boolean, default: false },
        is_system_related: { type: Boolean, default: false },
        status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    },
    { timestamps: true },
)

module.exports = mongoose.model('DocumentType', documentTypeSchema)
