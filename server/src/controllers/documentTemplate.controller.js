const { z } = require('zod')
const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const DocumentTemplate = require('../models/DocumentTemplate')

const documentTemplateSchema = z.object({
    name: z.string().trim().min(1, 'Document name is required'),
    description: z.string().trim().optional().default(''),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']),
    allowedFileTypes: z.array(z.enum(['pdf', 'docx', 'jpg'])).min(1, 'At least one file type is required'),
    nablClauseMapping: z.string().trim().optional().default(''),
    helpContentType: z.enum(['TEXT', 'VIDEO', 'PDF', 'NONE']).optional().default('NONE'),
    helpContentValue: z.string().trim().optional().default(''),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
})

const listDocumentTemplates = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
    const skip = (page - 1) * limit
    const { status } = req.query

    const filter = {}
    if (status) filter.status = status

    const [data, total] = await Promise.all([
        DocumentTemplate.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        DocumentTemplate.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)

    res.json({
        success: true,
        data: data.map((item) => ({
            id: String(item._id),
            ...item,
            _id: undefined,
            __v: undefined,
        })),
        pagination: { page, limit, total, totalPages },
    })
})

const getDocumentTemplate = asyncHandler(async (req, res) => {
    const item = await DocumentTemplate.findById(req.params.id).lean()
    if (!item) {
        throw new AppError('Document template not found', { statusCode: 404 })
    }
    res.json({
        success: true,
        data: {
            id: String(item._id),
            ...item,
            _id: undefined,
            __v: undefined,
        },
    })
})

const createDocumentTemplate = asyncHandler(async (req, res) => {
    const body = documentTemplateSchema.parse(req.body)
    const item = await DocumentTemplate.create(body)

    res.status(201).json({
        success: true,
        data: {
            id: String(item._id),
            ...item.toObject(),
            _id: undefined,
            __v: undefined,
        },
        message: 'Document template created successfully',
    })
})

const updateDocumentTemplate = asyncHandler(async (req, res) => {
    const body = documentTemplateSchema.parse(req.body)
    const item = await DocumentTemplate.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })

    if (!item) {
        throw new AppError('Document template not found', { statusCode: 404 })
    }

    res.json({
        success: true,
        data: {
            id: String(item._id),
            ...item.toObject(),
            _id: undefined,
            __v: undefined,
        },
        message: 'Document template updated successfully',
    })
})

const deleteDocumentTemplate = asyncHandler(async (req, res) => {
    const item = await DocumentTemplate.findByIdAndDelete(req.params.id)
    if (!item) {
        throw new AppError('Document template not found', { statusCode: 404 })
    }
    res.json({
        success: true,
        message: 'Document template deleted successfully',
    })
})

module.exports = {
    listDocumentTemplates,
    getDocumentTemplate,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
}
