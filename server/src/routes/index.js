const express = require('express')
const { healthRouter } = require('./health.routes')
const { authRouter } = require('./auth.routes')
const { usersRouter } = require('./users.routes')
const { labRouter } = require('./lab.routes')
const { documentTemplateRouter } = require('./documentTemplate.routes')
const { machineTypeRouter } = require('./machineType.routes')
const { machineInstanceRouter } = require('./machineInstance.routes')
const { documentTypeRouter } = require('./documentType.routes')
const { documentRouter } = require('./document.routes')
const notificationRouter = require('./notification.routes')

const router = express.Router()

router.use('/', healthRouter)
router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/labs', labRouter)
router.use('/document-templates', documentTemplateRouter)
router.use('/machine-types', machineTypeRouter)
router.use('/machine-instances', machineInstanceRouter)
router.use('/document-types', documentTypeRouter)
router.use('/documents', documentRouter)
router.use('/notifications', notificationRouter)

module.exports = router

