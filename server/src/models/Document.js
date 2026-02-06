const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        filePath: { type: String, required: true },
        fileType: { type: String, required: true },
        lab: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
        machineInstance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MachineInstance',
            required: true,
        },
        documentTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocumentTemplate',
            required: true,
        },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        // New fields for enhanced workflow
        applicableDate: { type: Date, required: false },
        comments: { type: String, trim: true, default: '' },

        // Status and review fields
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
            index: true,
        },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
        reviewedAt: { type: Date, required: false },
        feedback: { type: String, trim: true, default: '' },

        // Version control fields
        version: { type: Number, default: 1, min: 1 },
        parentDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: false },
        isLatestVersion: { type: Boolean, default: true, index: true },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
)

// Index for efficient querying
documentSchema.index({ lab: 1, status: 1 })
documentSchema.index({ uploadedBy: 1, createdAt: -1 })
documentSchema.index({ machineInstance: 1, isLatestVersion: 1 })

module.exports = mongoose.model('Document', documentSchema)
