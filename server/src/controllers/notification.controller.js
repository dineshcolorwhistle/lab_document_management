const Notification = require('../models/Notification')
const { sendDocumentUploadedEmail, sendDocumentReviewedEmail } = require('../services/email.service')

/**
 * Create a notification and optionally send email
 */
exports.createNotification = async ({ recipient, type, title, message, relatedDocument, relatedUser, metadata = {}, sendEmail = true }) => {
    try {
        // Create notification record
        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            relatedDocument,
            relatedUser,
            metadata,
        })

        // Send email if requested
        if (sendEmail) {
            try {
                let emailResult
                if (type === 'DOCUMENT_UPLOADED' && metadata.emailData) {
                    emailResult = await sendDocumentUploadedEmail(metadata.emailData)
                } else if ((type === 'DOCUMENT_APPROVED' || type === 'DOCUMENT_REJECTED') && metadata.emailData) {
                    emailResult = await sendDocumentReviewedEmail(metadata.emailData)
                }

                if (emailResult) {
                    notification.emailSent = true
                    notification.emailSentAt = new Date()
                    await notification.save()
                }
            } catch (emailError) {
                console.error('Error sending email notification:', emailError)
                // Don't fail the notification creation if email fails
            }
        }

        return notification
    } catch (error) {
        console.error('Error creating notification:', error)
        throw error
    }
}

/**
 * Get notifications for the logged-in user
 */
exports.getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { page = 1, limit = 20, unreadOnly = false } = req.query

        const query = { recipient: userId }
        if (unreadOnly === 'true') {
            query.read = false
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .populate('relatedDocument', 'name status')
                .populate('relatedUser', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Notification.countDocuments(query),
        ])

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user.id
        const count = await Notification.countDocuments({ recipient: userId, read: false })

        res.json({
            success: true,
            data: { count },
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const notification = await Notification.findOne({ _id: id, recipient: userId })

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' })
        }

        if (!notification.read) {
            notification.read = true
            notification.readAt = new Date()
            await notification.save()
        }

        res.json({
            success: true,
            data: notification,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.id

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true, readAt: new Date() }
        )

        res.json({
            success: true,
            message: 'All notifications marked as read',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const notification = await Notification.findOne({ _id: id, recipient: userId })

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' })
        }

        await Notification.findByIdAndDelete(id)

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}
