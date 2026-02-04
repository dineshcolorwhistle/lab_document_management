const mongoose = require('mongoose')

const machineInstanceSchema = new mongoose.Schema(
    {
        machineType: { type: mongoose.Schema.Types.ObjectId, ref: 'MachineType', required: true },
        nickname: { type: String, trim: true, default: '' },
        model: { type: String, required: true, trim: true },
        serialNumber: { type: String, required: true, trim: true },
        calibrationDueDate: { type: Date, required: true },
        maintenanceDueDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['Active', 'Under Maintenance', 'Out of Service'],
            default: 'Active',
        },
        notes: { type: String, trim: true, default: '' },
        lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    },
    { timestamps: true },
)

module.exports = mongoose.model('MachineInstance', machineInstanceSchema)
