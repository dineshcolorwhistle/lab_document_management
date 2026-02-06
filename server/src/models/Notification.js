const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['DOCUMENT_UPLOADED', 'DOCUMENT_APPROVED', 'DOCUMENT_REJECTED'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        relatedDocument: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: false,
        },
        relatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
            required: false,
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
        emailSentAt: {
            type: Date,
            required: false,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
)

// Compound index for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
