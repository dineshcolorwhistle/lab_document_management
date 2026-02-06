const express = require('express')
const router = express.Router()
const documentTypeController = require('../controllers/documentType.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

router.use(requireAuth)

router.get('/', documentTypeController.listDocumentTypes)
router.get('/:id', documentTypeController.getDocumentType)

router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN))

router.post('/', documentTypeController.createDocumentType)
router.patch('/:id', documentTypeController.updateDocumentType)
router.put('/:id', documentTypeController.updateDocumentType)
router.delete('/:id', documentTypeController.deleteDocumentType)

module.exports = { documentTypeRouter: router }
