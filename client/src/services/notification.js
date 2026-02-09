import { api } from './api'

export const notificationService = {
    // Get user's notifications
    getMyNotifications: async (params = {}) => {
        const response = await api.get('/notifications', { params })
        return response.data
    },

    // Get unread notification count
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count')
        return response.data
    },

    // Mark notification as read
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`)
        return response.data
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all')
        return response.data
    },

    // Bulk delete notifications
    deleteNotifications: async (ids) => {
        const response = await api.post('/notifications/bulk-delete', { ids })
        return response.data
    },

    // Delete notification
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`)
        return response.data
    },
}
