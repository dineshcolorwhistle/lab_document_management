const Document = require('../models/Document')
const MachineInstance = require('../models/MachineInstance')
const MachineType = require('../models/MachineType')
const Lab = require('../models/Lab')
const { ROLES } = require('../constants/roles')
const path = require('path')
const fs = require('fs')

/**
 * Get machine instances assigned to the lab technician
 */
exports.getMachineInstancesForTechnician = async (req, res, next) => {
    try {
        const userId = req.user.id

        // Query labs where this user is in the labTechnicians array
        const userLabs = await Lab.find({ labTechnicians: userId }).select('_id')

        if (!userLabs || userLabs.length === 0) {
            return res.json({ success: true, data: [] })
        }

        // Get lab IDs assigned to this technician
        const labIds = userLabs.map((lab) => lab._id)

        // Find machine instances in those labs
        const machineInstances = await MachineInstance.find({
            lab: { $in: labIds },
            status: 'Active',
        })
            .populate('machineType', 'name category')
            .populate('lab', 'name')
            .sort({ nickname: 1, model: 1 })

        res.json({
            success: true,
            data: machineInstances,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get document templates for a specific machine instance
 */
exports.getDocumentTemplatesForMachine = async (req, res, next) => {
    try {
        const { machineInstanceId } = req.params

        const machineInstance = await MachineInstance.findById(machineInstanceId).populate({
            path: 'machineType',
            populate: {
                path: 'requiredDocumentTemplates',
                match: { status: 'ACTIVE' },
                populate: {
                    path: 'documentType',
                    select: 'name',
                },
            },
        })

        if (!machineInstance) {
            return res.status(404).json({ success: false, message: 'Machine instance not found' })
        }

        const templates = machineInstance.machineType.requiredDocumentTemplates || []

        res.json({
            success: true,
            data: templates,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Upload a document
 */
exports.uploadDocument = async (req, res, next) => {
    try {
        const { machineInstanceId, documentTemplateId, name, applicableDate, comments } = req.body
        const userId = req.user.id

        // Validate required fields
        if (!machineInstanceId || !documentTemplateId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Machine instance, document template, and name are required',
            })
        }

        // Validate applicable date is required
        if (!applicableDate) {
            return res.status(400).json({
                success: false,
                message: 'Applicable Date is required',
            })
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            })
        }

        // Get machine instance with lab info
        const machineInstance = await MachineInstance.findById(machineInstanceId).populate('lab')

        if (!machineInstance) {
            return res.status(404).json({ success: false, message: 'Machine instance not found' })
        }

        // Verify the technician has access to this lab via Lab.labTechnicians
        const lab = await Lab.findOne({ _id: machineInstance.lab._id, labTechnicians: userId }).populate('labOwners', 'name email')

        if (!lab) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this machine instance',
            })
        }

        // Create document record
        const document = await Document.create({
            name,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            lab: machineInstance.lab._id,
            machineInstance: machineInstanceId,
            documentTemplate: documentTemplateId,
            uploadedBy: userId,
            applicableDate: applicableDate || null,
            comments: comments || '',
            status: 'PENDING',
            metadata: {
                originalName: req.file.originalname,
                size: req.file.size,
                uploadDate: new Date(),
            },
        })

        // Populate the document with full details
        const populatedDocument = await Document.findById(document._id)
            .populate('lab', 'name')
            .populate('machineInstance', 'nickname model serialNumber')
            .populate('documentTemplate', 'name description')
            .populate('uploadedBy', 'name email')

        // Send notifications to Lab Owners and Admins
        const User = require('../models/User')
        const { createNotification } = require('./notification.controller')

        // Get uploader details
        const uploader = await User.findById(userId).select('name email')

        // Notify Lab Owners
        const labOwners = lab.labOwners || []
        for (const owner of labOwners) {
            await createNotification({
                recipient: owner._id,
                type: 'DOCUMENT_UPLOADED',
                title: 'New Document Uploaded',
                message: `${uploader.name} uploaded a new document: ${document.name}`,
                relatedDocument: document._id,
                relatedUser: userId,
                metadata: {
                    emailData: {
                        recipient: owner,
                        document: populatedDocument,
                        uploader,
                        lab: populatedDocument.lab,
                        machineInstance: populatedDocument.machineInstance,
                    },
                },
                sendEmail: true,
            })
        }

        // Notify Admins and Super Admins
        const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, status: 'ACTIVE' }).select('name email')
        for (const admin of admins) {
            await createNotification({
                recipient: admin._id,
                type: 'DOCUMENT_UPLOADED',
                title: 'New Document Uploaded',
                message: `${uploader.name} uploaded a new document: ${document.name} in ${lab.name}`,
                relatedDocument: document._id,
                relatedUser: userId,
                metadata: {
                    emailData: {
                        recipient: admin,
                        document: populatedDocument,
                        uploader,
                        lab: populatedDocument.lab,
                        machineInstance: populatedDocument.machineInstance,
                    },
                },
                sendEmail: true,
            })
        }

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: populatedDocument,
        })
    } catch (error) {
        // Clean up uploaded file if document creation fails
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err)
            })
        }
        next(error)
    }
}


/**
 * Get all documents uploaded by the technician
 */
exports.getMyDocuments = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { page = 1, limit = 10, machineInstanceId, documentTemplateId } = req.query

        const query = { uploadedBy: userId }

        if (machineInstanceId) {
            query.machineInstance = machineInstanceId
        }

        if (documentTemplateId) {
            query.documentTemplate = documentTemplateId
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const [documents, total] = await Promise.all([
            Document.find(query)
                .populate('lab', 'name')
                .populate('machineInstance', 'nickname model serialNumber')
                .populate('documentTemplate', 'name description')
                .populate('uploadedBy', 'name email')
                .populate('reviewedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Document.countDocuments(query),
        ])

        res.json({
            success: true,
            data: documents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get a single document by ID
 */
exports.getDocumentById = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const document = await Document.findById(id)
            .populate('lab', 'name')
            .populate('machineInstance', 'nickname model serialNumber')
            .populate('documentTemplate', 'name description')
            .populate('uploadedBy', 'name email')

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        // Verify access
        if (document.uploadedBy._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this document',
            })
        }

        res.json({
            success: true,
            data: document,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Delete a document
 */
exports.deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const document = await Document.findById(id)

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        // Verify access
        if (document.uploadedBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to delete this document',
            })
        }

        // Delete file from filesystem
        let filePath = document.filePath

        // Migration Fix: Handle path mismatch
        if (!fs.existsSync(filePath)) {
            const fileName = filePath.replace(/^.*[\\\/]/, '')
            const uploadsDir = path.join(__dirname, '../../uploads/documents')
            const potentialPath = path.join(uploadsDir, fileName)
            if (fs.existsSync(potentialPath)) {
                filePath = potentialPath
            }
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        await Document.findByIdAndDelete(id)

        res.json({
            success: true,
            message: 'Document deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Download/View a document file
 * Accessible by: Lab Technician (own docs), Lab Owner (owned labs), Admin/Super Admin (all)
 */
exports.downloadDocument = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const userRole = req.user.role

        const document = await Document.findById(id)
            .populate('lab', 'labOwners')
            .populate('uploadedBy', '_id')

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        // Check access permissions based on role
        let hasAccess = false

        if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) {
            // Admins can access all documents
            hasAccess = true
        } else if (userRole === ROLES.LAB_OWNER) {
            // Lab owners can access documents from their labs
            const labOwnerIds = document.lab.labOwners.map(id => id.toString())
            hasAccess = labOwnerIds.includes(userId.toString())
        } else if (userRole === ROLES.LAB_TECHNICIAN) {
            // Lab technicians can only access their own documents
            hasAccess = document.uploadedBy._id.toString() === userId.toString()
        }

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this document',
            })
        }

        let filePath = document.filePath

        // Migration Fix: Handle path mismatch (e.g. Windows path on Linux)
        if (!fs.existsSync(filePath)) {
            // Extract filename from the stored path (handles both \ and / separators)
            const fileName = filePath.replace(/^.*[\\\/]/, '')
            const uploadsDir = path.join(__dirname, '../../uploads/documents')
            const potentialPath = path.join(uploadsDir, fileName)

            if (fs.existsSync(potentialPath)) {
                filePath = potentialPath
            }
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server',
            })
        }

        // Set appropriate headers for file download/viewing
        const fileName = document.metadata?.originalName || document.name
        res.setHeader('Content-Type', document.fileType)
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)

        // Stream the file
        const fileStream = fs.createReadStream(filePath)
        fileStream.pipe(res)
    } catch (error) {
        next(error)
    }
}

/**
 * Get documents for Lab Owner (filtered by owned labs)
 */
exports.getDocumentsForLabOwner = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { page = 1, limit = 10, labId, status, machineInstanceId } = req.query

        // Get labs owned by this user
        const ownedLabs = await Lab.find({ labOwners: userId }).select('_id')

        if (!ownedLabs || ownedLabs.length === 0) {
            return res.json({
                success: true,
                data: [],
                pagination: { total: 0, page: 1, limit: parseInt(limit), pages: 0 },
            })
        }

        const labIds = ownedLabs.map((lab) => lab._id)

        // Build query
        const query = { lab: { $in: labIds }, isLatestVersion: true }

        if (labId && labIds.some(id => id.toString() === labId)) {
            query.lab = labId
        }

        if (status) {
            query.status = status
        }

        if (machineInstanceId) {
            query.machineInstance = machineInstanceId
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const [documents, total] = await Promise.all([
            Document.find(query)
                .populate('lab', 'name')
                .populate('machineInstance', 'nickname model serialNumber')
                .populate('documentTemplate', 'name description')
                .populate({
                    path: 'documentTemplate',
                    populate: { path: 'documentType', select: 'name' },
                })
                .populate('uploadedBy', 'name email')
                .populate('reviewedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Document.countDocuments(query),
        ])

        res.json({
            success: true,
            data: documents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get all documents for Admin/Super Admin
 */
exports.getAllDocuments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, labId, status, machineInstanceId, documentType, uploadedBy } = req.query

        // Build query
        const query = { isLatestVersion: true }

        if (labId) {
            query.lab = labId
        }

        if (status) {
            query.status = status
        }

        if (machineInstanceId) {
            query.machineInstance = machineInstanceId
        }

        if (uploadedBy) {
            query.uploadedBy = uploadedBy
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const [documents, total] = await Promise.all([
            Document.find(query)
                .populate('lab', 'name')
                .populate('machineInstance', 'nickname model serialNumber')
                .populate('documentTemplate', 'name description')
                .populate({
                    path: 'documentTemplate',
                    populate: { path: 'documentType', select: 'name' },
                })
                .populate('uploadedBy', 'name email')
                .populate('reviewedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Document.countDocuments(query),
        ])

        res.json({
            success: true,
            data: documents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Review a document (Approve or Reject)
 */
exports.reviewDocument = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status, feedback } = req.body
        const userId = req.user.id
        const userRole = req.user.role

        // Validate status
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be APPROVED or REJECTED',
            })
        }

        // Only ADMIN and SUPER_ADMIN can review documents
        if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to review documents',
            })
        }

        const document = await Document.findById(id)
            .populate('lab', 'name labOwners')
            .populate('machineInstance', 'nickname model serialNumber')
            .populate('uploadedBy', 'name email')

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        // Update document
        document.status = status
        document.feedback = feedback || ''
        document.reviewedBy = userId
        document.reviewedAt = new Date()
        await document.save()

        // Populate reviewer details
        const User = require('../models/User')
        const reviewer = await User.findById(userId).select('name email')
        const { createNotification } = require('./notification.controller')

        // Notify Lab Owner
        const labOwners = document.lab.labOwners || []
        for (const ownerId of labOwners) {
            await createNotification({
                recipient: ownerId,
                type: status === 'APPROVED' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
                title: `Document ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                message: `Your document "${document.name}" has been ${status.toLowerCase()} by ${reviewer.name}`,
                relatedDocument: document._id,
                relatedUser: userId,
                metadata: {
                    emailData: {
                        recipient: await User.findById(ownerId).select('name email'),
                        document,
                        reviewer,
                        status,
                        feedback: feedback || '',
                    },
                },
                sendEmail: true,
            })
        }

        // Notify the uploader (Lab Technician)
        await createNotification({
            recipient: document.uploadedBy._id,
            type: status === 'APPROVED' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
            title: `Document ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
            message: `Your document "${document.name}" has been ${status.toLowerCase()}`,
            relatedDocument: document._id,
            relatedUser: userId,
            metadata: {
                emailData: {
                    recipient: document.uploadedBy,
                    document,
                    reviewer,
                    status,
                    feedback: feedback || '',
                },
            },
            sendEmail: true,
        })

        // Populate full document details for response
        const updatedDocument = await Document.findById(id)
            .populate('lab', 'name')
            .populate('machineInstance', 'nickname model serialNumber')
            .populate('documentTemplate', 'name description')
            .populate('uploadedBy', 'name email')
            .populate('reviewedBy', 'name email')

        res.json({
            success: true,
            message: `Document ${status.toLowerCase()} successfully`,
            data: updatedDocument,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get version history of a document
 */
exports.getDocumentVersionHistory = async (req, res, next) => {
    try {
        const { id } = req.params

        const document = await Document.findById(id)

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        // Find all versions (documents with same parentDocument or this document as parent)
        const versions = await Document.find({
            $or: [
                { _id: id },
                { parentDocument: id },
                { parentDocument: document.parentDocument },
            ],
        })
            .populate('uploadedBy', 'name email')
            .populate('reviewedBy', 'name email')
            .sort({ version: -1 })

        res.json({
            success: true,
            data: versions,
        })
    } catch (error) {
        next(error)
    }
}

