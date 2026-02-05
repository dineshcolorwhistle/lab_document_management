const { z } = require('zod')
const { asyncHandler } = require('../utils/asyncHandler')
const { AppError } = require('../utils/AppError')
const MachineInstance = require('../models/MachineInstance')
const { ROLES } = require('../constants/roles')
const Lab = require('../models/Lab')

const machineInstanceSchema = z.object({
    machineType: z.string().min(1, 'Machine type is required'),
    nickname: z.string().trim().optional().default(''),
    model: z.string().trim().min(1, 'Model is required'),
    serialNumber: z.string().trim().min(1, 'Serial number is required'),
    calibrationDueDate: z.string().min(1, 'Calibration due date is required'),
    maintenanceDueDate: z.string().min(1, 'Maintenance due date is required'),
    status: z.enum(['Active', 'Under Maintenance', 'Out of Service']).default('Active'),
    notes: z.string().trim().optional().default(''),
    lab: z.string().min(1, 'Lab is required'),
})

const listMachineInstances = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10))
    const skip = (page - 1) * limit
    const { status, labId } = req.query
    const { role, id: userId } = req.user

    const filter = {}
    if (status) filter.status = status

    // Role-based filtering
    if (role === ROLES.LAB_OWNER) {
        // Lab owner can only see instances in their labs
        const userLabs = await Lab.find({ labOwners: userId }).select('_id')
        const labIds = userLabs.map((l) => l._id)
        filter.lab = { $in: labIds }

        // If they filtered by a specific lab, ensure they own it
        if (labId) {
            if (labIds.map(String).includes(labId)) {
                filter.lab = labId
            } else {
                // If they try to filter by a lab they don't own, return empty
                return res.json({
                    success: true,
                    data: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                })
            }
        }
    } else if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
        if (labId) filter.lab = labId
    }

    const [data, total] = await Promise.all([
        MachineInstance.find(filter)
            .populate({
                path: 'machineType',
                populate: {
                    path: 'requiredDocumentTemplates'
                }
            })
            .populate('lab', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        MachineInstance.countDocuments(filter),
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

const getMachineInstance = asyncHandler(async (req, res) => {
    const { role, id: userId } = req.user
    const item = await MachineInstance.findById(req.params.id)
        .populate({
            path: 'machineType',
            populate: {
                path: 'requiredDocumentTemplates'
            }
        })
        .populate('lab', 'name')
        .lean()

    if (!item) {
        throw new AppError('Machine instance not found', { statusCode: 404 })
    }

    // Permission check for Lab Owner
    if (role === ROLES.LAB_OWNER) {
        const lab = await Lab.findOne({ _id: item.lab._id, labOwners: userId })
        if (!lab) {
            throw new AppError('Access denied', { statusCode: 403 })
        }
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

const createMachineInstance = asyncHandler(async (req, res) => {
    const { role, id: userId } = req.user
    const body = machineInstanceSchema.parse(req.body)

    // Validate lab ownership if Lab Owner
    if (role === ROLES.LAB_OWNER) {
        const lab = await Lab.findOne({ _id: body.lab, labOwners: userId })
        if (!lab) {
            throw new AppError('You do not have permission to add machines to this lab', { statusCode: 403 })
        }
    }

    const item = await MachineInstance.create(body)

    const populated = await MachineInstance.findById(item._id)
        .populate({
            path: 'machineType',
            populate: {
                path: 'requiredDocumentTemplates'
            }
        })
        .populate('lab', 'name')
        .lean()

    res.status(201).json({
        success: true,
        data: {
            id: String(populated._id),
            ...populated,
            _id: undefined,
            __v: undefined,
        },
        message: 'Machine instance created successfully',
    })
})

const updateMachineInstance = asyncHandler(async (req, res) => {
    const { role, id: userId } = req.user
    const body = machineInstanceSchema.parse(req.body)

    const existing = await MachineInstance.findById(req.params.id)
    if (!existing) {
        throw new AppError('Machine instance not found', { statusCode: 404 })
    }

    // Permission check
    if (role === ROLES.LAB_OWNER) {
        const lab = await Lab.findOne({ _id: existing.lab, labOwners: userId })
        if (!lab) {
            throw new AppError('Access denied', { statusCode: 403 })
        }
        // Also check if they are changing it to a lab they own
        const newLab = await Lab.findOne({ _id: body.lab, labOwners: userId })
        if (!newLab) {
            throw new AppError('You do not have permission to move machines to this lab', { statusCode: 403 })
        }
    }

    const item = await MachineInstance.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    })

    const populated = await MachineInstance.findById(item._id)
        .populate({
            path: 'machineType',
            populate: {
                path: 'requiredDocumentTemplates'
            }
        })
        .populate('lab', 'name')
        .lean()

    res.json({
        success: true,
        data: {
            id: String(populated._id),
            ...populated,
            _id: undefined,
            __v: undefined,
        },
        message: 'Machine instance updated successfully',
    })
})

const deleteMachineInstance = asyncHandler(async (req, res) => {
    const { role, id: userId } = req.user
    const item = await MachineInstance.findById(req.params.id)

    if (!item) {
        throw new AppError('Machine instance not found', { statusCode: 404 })
    }

    // Permission check
    if (role === ROLES.LAB_OWNER) {
        const lab = await Lab.findOne({ _id: item.lab, labOwners: userId })
        if (!lab) {
            throw new AppError('Access denied', { statusCode: 403 })
        }
    }

    await MachineInstance.findByIdAndDelete(req.params.id)

    res.json({
        success: true,
        message: 'Machine instance deleted successfully',
    })
})

module.exports = {
    listMachineInstances,
    getMachineInstance,
    createMachineInstance,
    updateMachineInstance,
    deleteMachineInstance,
}
