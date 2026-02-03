const express = require('express')
const { healthRouter } = require('./health.routes')
const { authRouter } = require('./auth.routes')
const { usersRouter } = require('./users.routes')
const { labRouter } = require('./lab.routes')
const { documentTemplateRouter } = require('./documentTemplate.routes')
const { machineTypeRouter } = require('./machineType.routes')

const router = express.Router()

router.use('/', healthRouter)
router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/labs', labRouter)
router.use('/document-templates', documentTemplateRouter)
router.use('/machine-types', machineTypeRouter)

module.exports = router
