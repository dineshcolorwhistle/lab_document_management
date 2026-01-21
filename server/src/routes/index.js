const express = require('express')
const { healthRouter } = require('./health.routes')
const { authRouter } = require('./auth.routes')

const router = express.Router()

router.use('/', healthRouter)
router.use('/auth', authRouter)

module.exports = router
