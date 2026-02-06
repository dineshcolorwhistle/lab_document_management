const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')
const {
    getMachineInstancesForTechnician,
    getDocumentTemplatesForMachine,
    uploadDocument,
    getMyDocuments,
    getDocumentById,
    deleteDocument,
    downloadDocument,
    getDocumentsForLabOwner,
    getAllDocuments,
    reviewDocument,
    getDocumentVersionHistory,
} = require('../controllers/document.controller')

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../../uploads/documents')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    },
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg']

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file type. Only PDF, DOCX, and JPG files are allowed.'), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
})

// All routes require authentication
router.use(requireAuth)

// ===== LAB TECHNICIAN ROUTES =====
// Get machine instances for the logged-in technician
router.get('/machine-instances', authorizeRoles(ROLES.LAB_TECHNICIAN), getMachineInstancesForTechnician)

// Get document templates for a specific machine instance
router.get('/machine-instances/:machineInstanceId/templates', authorizeRoles(ROLES.LAB_TECHNICIAN), getDocumentTemplatesForMachine)

// Upload a document (Lab Technician only)
router.post('/upload', authorizeRoles(ROLES.LAB_TECHNICIAN), upload.single('file'), uploadDocument)

// Get all documents uploaded by the technician
router.get('/my-documents', authorizeRoles(ROLES.LAB_TECHNICIAN), getMyDocuments)

// ===== LAB OWNER ROUTES =====
// Get documents for labs owned by the user
router.get('/lab-owner/documents', authorizeRoles(ROLES.LAB_OWNER), getDocumentsForLabOwner)

// ===== ADMIN/SUPER_ADMIN ROUTES =====
// Get all documents (Admin/Super Admin)
router.get('/admin/documents', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAllDocuments)

// Review a document (Approve/Reject)
router.patch('/admin/documents/:id/review', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), reviewDocument)

// ===== SHARED ROUTES (with role-specific access control in controller) =====
// Download/View a document file
router.get('/:id/download', downloadDocument)

// Get version history of a document
router.get('/:id/versions', getDocumentVersionHistory)

// Get a single document by ID
router.get('/:id', getDocumentById)

// Delete a document
router.delete('/:id', deleteDocument)

module.exports = { documentRouter: router }

