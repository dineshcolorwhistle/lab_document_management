const mongoose = require('mongoose')

const machineTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, trim: true, default: '' },
        defaultCalibrationFrequency: { type: String, trim: true, default: '' },
        defaultMaintenanceFrequency: { type: String, trim: true, default: '' },
        status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
        notes: { type: String, trim: true, default: '' },
        requiredDocumentTemplates: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentTemplate', default: [] },
        ],
    },
    { timestamps: true },
)

module.exports = mongoose.model('MachineType', machineTypeSchema)
