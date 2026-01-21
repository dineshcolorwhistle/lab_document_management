const express = require('express')
const { login, me, forgotPassword, resetPassword } = require('../controllers/auth.controller')
const { requireAuth } = require('../middlewares/auth')

const router = express.Router()

router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/me', requireAuth, me)

module.exports = { authRouter: router }
