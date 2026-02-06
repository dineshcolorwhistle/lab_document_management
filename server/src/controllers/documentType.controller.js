const { z } = require('zod')
const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const DocumentType = require('../models/DocumentType')
const DocumentTemplate = require('../models/DocumentTemplate')

const documentTypeSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    code: z.string().trim().min(1, 'Code is required'),
    description: z.string().trim().optional().default(''),
    is_equipment_related: z.boolean().optional().default(false),
    is_personnel_related: z.boolean().optional().default(false),
    is_system_related: z.boolean().optional().default(false),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
})

const listDocumentTypes = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
    const skip = (page - 1) * limit
    const { status } = req.query

    const filter = {}
    if (status) filter.status = status

    const [data, total] = await Promise.all([
        DocumentType.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        DocumentType.countDocuments(filter),
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

const getDocumentType = asyncHandler(async (req, res) => {
    const item = await DocumentType.findById(req.params.id).lean()
    if (!item) {
        throw new AppError('Document type not found', { statusCode: 404 })
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

const createDocumentType = asyncHandler(async (req, res) => {
    const body = documentTypeSchema.parse(req.body)

    // Check if code already exists
    const existing = await DocumentType.findOne({ code: body.code })
    if (existing) {
        throw new AppError('Document type code already exists', { statusCode: 400 })
    }

    const item = await DocumentType.create(body)

    res.status(201).json({
        success: true,
        data: {
            id: String(item._id),
            ...item.toObject(),
            _id: undefined,
            __v: undefined,
        },
        message: 'Document type created successfully',
    })
})

const updateDocumentType = asyncHandler(async (req, res) => {
    const body = documentTypeSchema.parse(req.body)

    // Check if code already exists for another document type
    const existing = await DocumentType.findOne({ code: body.code, _id: { $ne: req.params.id } })
    if (existing) {
        throw new AppError('Document type code already exists', { statusCode: 400 })
    }

    const item = await DocumentType.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })

    if (!item) {
        throw new AppError('Document type not found', { statusCode: 404 })
    }

    res.json({
        success: true,
        data: {
            id: String(item._id),
            ...item.toObject(),
            _id: undefined,
            __v: undefined,
        },
        message: 'Document type updated successfully',
    })
})

const deleteDocumentType = asyncHandler(async (req, res) => {
    // Check if associated with any document template
    const associatedTemplate = await DocumentTemplate.findOne({ documentType: req.params.id })
    if (associatedTemplate) {
        throw new AppError('Cannot delete document type as it is associated with one or more document templates', { statusCode: 400 })
    }

    const item = await DocumentType.findByIdAndDelete(req.params.id)
    if (!item) {
        throw new AppError('Document type not found', { statusCode: 404 })
    }
    res.json({
        success: true,
        message: 'Document type deleted successfully',
    })
})

module.exports = {
    listDocumentTypes,
    getDocumentType,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
}
