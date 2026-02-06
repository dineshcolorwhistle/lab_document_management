import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, FileText, Filter } from 'lucide-react'
import { notificationService } from '../services/notification'
import { useNavigate } from 'react-router-dom'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // 'all', 'unread'
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        fetchNotifications()
    }, [filter, pagination.page])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            }
            if (filter === 'unread') {
                params.unreadOnly = true
            }
            const response = await notificationService.getMyNotifications(params)
            setNotifications(response.data || [])
            setPagination(response.pagination || { page: 1, limit: 20, total: 0 })
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true, readAt: new Date() } : n
            ))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(notifications.map(n => ({ ...n, read: true, readAt: new Date() })))
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return
        }

        try {
            await notificationService.deleteNotification(id)
            setNotifications(notifications.filter(n => n._id !== id))
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.read) {
            await handleMarkAsRead(notification._id)
        }

        // Navigate to related document if exists
        if (notification.relatedDocument) {
            // You can customize navigation based on user role
            // For now, we'll just mark it as read
        }
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'DOCUMENT_UPLOADED':
                return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' }
            case 'DOCUMENT_APPROVED':
                return { icon: Check, color: 'text-green-600', bg: 'bg-green-100' }
            case 'DOCUMENT_REJECTED':
                return { icon: FileText, color: 'text-red-600', bg: 'bg-red-100' }
            default:
                return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' }
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-4 border-b border-border">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === 'all'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === 'unread'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {/* Notifications List */}
            <div className="bg-card rounded-xl border border-border shadow-sm">
                {loading && notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-muted-foreground">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                        </h3>
                        <p className="text-muted-foreground">
                            {filter === 'unread' ? "You're all caught up!" : "You'll see notifications here when you have them"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => {
                            const iconData = getNotificationIcon(notification.type)
                            const Icon = iconData.icon

                            return (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-6 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconData.bg} flex items-center justify-center`}>
                                            <Icon className={`h-6 w-6 ${iconData.color}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className={`text-base ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {formatDateTime(notification.createdAt)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleMarkAsRead(notification._id)
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDelete(notification._id)
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unread Indicator */}
                                            {!notification.read && (
                                                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    Unread
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t border-border">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.pages}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
