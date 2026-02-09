const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.controller')
const { requireAuth } = require('../middlewares/auth')

// All routes require authentication
router.use(requireAuth)

// Get user's notifications
router.get('/', notificationController.getMyNotifications)

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount)

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead)

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead)

// Bulk delete notifications
router.post('/bulk-delete', notificationController.deleteNotifications)

// Delete notification
router.delete('/:id', notificationController.deleteNotification)

module.exports = router
