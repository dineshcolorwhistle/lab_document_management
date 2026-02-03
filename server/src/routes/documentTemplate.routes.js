const express = require('express')
const {
    listDocumentTemplates,
    getDocumentTemplate,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
} = require('../controllers/documentTemplate.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

const router = express.Router()

router.use(requireAuth)
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN))

router.get('/', listDocumentTemplates)
router.get('/:id', getDocumentTemplate)
router.post('/', createDocumentTemplate)
router.patch('/:id', updateDocumentTemplate)
router.delete('/:id', deleteDocumentTemplate)

module.exports = { documentTemplateRouter: router }
