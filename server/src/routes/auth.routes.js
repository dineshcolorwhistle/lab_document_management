const express = require('express')
const { login, me, forgotPassword, resetPassword, updateProfile, updatePassword } = require('../controllers/auth.controller')
const { requireAuth } = require('../middlewares/auth')
const { uploadProfileImage } = require('../middlewares/upload')

const router = express.Router()

router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/me', requireAuth, me)
router.patch('/me/profile', requireAuth, uploadProfileImage, updateProfile)
router.patch('/me/password', requireAuth, updatePassword)

module.exports = { authRouter: router }
