const { z } = require('zod')
const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const MachineType = require('../models/MachineType')

const machineTypeSchema = z.object({
    name: z.string().trim().min(1, 'Machine type name is required'),
    category: z.string().trim().optional().default(''),
    defaultCalibrationFrequency: z.string().trim().optional().default(''),
    defaultMaintenanceFrequency: z.string().trim().optional().default(''),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
    notes: z.string().trim().optional().default(''),
    requiredDocumentTemplates: z.array(z.string()).optional().default([]),
})

const listMachineTypes = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
    const skip = (page - 1) * limit
    const { status } = req.query

    const filter = {}
    if (status) filter.status = status

    const [data, total] = await Promise.all([
        MachineType.find(filter)
            .populate('requiredDocumentTemplates', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        MachineType.countDocuments(filter),
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

const getMachineType = asyncHandler(async (req, res) => {
    const item = await MachineType.findById(req.params.id)
        .populate('requiredDocumentTemplates', 'name')
        .lean()
    if (!item) {
        throw new AppError('Machine type not found', { statusCode: 404 })
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

const createMachineType = asyncHandler(async (req, res) => {
    const body = machineTypeSchema.parse(req.body)
    const item = await MachineType.create(body)

    const populated = await MachineType.findById(item._id)
        .populate('requiredDocumentTemplates', 'name')
        .lean()

    res.status(201).json({
        success: true,
        data: {
            id: String(populated._id),
            ...populated,
            _id: undefined,
            __v: undefined,
        },
        message: 'Machine type created successfully',
    })
})

const updateMachineType = asyncHandler(async (req, res) => {
    const body = machineTypeSchema.parse(req.body)
    const item = await MachineType.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })

    if (!item) {
        throw new AppError('Machine type not found', { statusCode: 404 })
    }

    const populated = await MachineType.findById(item._id)
        .populate('requiredDocumentTemplates', 'name')
        .lean()

    res.json({
        success: true,
        data: {
            id: String(populated._id),
            ...populated,
            _id: undefined,
            __v: undefined,
        },
        message: 'Machine type updated successfully',
    })
})

const deleteMachineType = asyncHandler(async (req, res) => {
    const item = await MachineType.findByIdAndDelete(req.params.id)
    if (!item) {
        throw new AppError('Machine type not found', { statusCode: 404 })
    }
    res.json({
        success: true,
        message: 'Machine type deleted successfully',
    })
})

module.exports = {
    listMachineTypes,
    getMachineType,
    createMachineType,
    updateMachineType,
    deleteMachineType,
}
