const mongoose = require('mongoose')

const documentTemplateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        frequency: {
            type: String,
            enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'],
            required: true,
        },
        allowedFileTypes: {
            type: [String],
            enum: ['pdf', 'docx', 'jpg'],
            default: ['pdf'],
        },
        nablClauseMapping: { type: String, trim: true, default: '' },
        helpContentType: {
            type: String,
            enum: ['TEXT', 'VIDEO', 'PDF', 'NONE'],
            default: 'NONE',
        },
        helpContentValue: { type: String, trim: true, default: '' },
        documentType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocumentType',
            required: true,
        },
        status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    },
    { timestamps: true },
)

module.exports = mongoose.model('DocumentTemplate', documentTemplateSchema)
