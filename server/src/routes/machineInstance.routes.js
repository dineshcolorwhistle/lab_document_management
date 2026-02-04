const express = require('express')
const {
    listMachineInstances,
    getMachineInstance,
    createMachineInstance,
    updateMachineInstance,
    deleteMachineInstance,
} = require('../controllers/machineInstance.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

const router = express.Router()

router.use(requireAuth)

router.get('/', listMachineInstances)
router.get('/:id', getMachineInstance)

router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER))

router.post('/', createMachineInstance)
router.patch('/:id', updateMachineInstance)
router.delete('/:id', deleteMachineInstance)

module.exports = { machineInstanceRouter: router }
