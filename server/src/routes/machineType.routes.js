const express = require('express')
const {
    listMachineTypes,
    getMachineType,
    createMachineType,
    updateMachineType,
    deleteMachineType,
} = require('../controllers/machineType.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

const router = express.Router()

router.use(requireAuth)
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN))

router.get('/', listMachineTypes)
router.get('/:id', getMachineType)
router.post('/', createMachineType)
router.patch('/:id', updateMachineType)
router.delete('/:id', deleteMachineType)

module.exports = { machineTypeRouter: router }
