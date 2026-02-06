import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, FileText } from 'lucide-react'
import { notificationService } from '../services/notification'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchUnreadCount()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount()
            setUnreadCount(response.data.count)
        } catch (error) {
            console.error('Error fetching unread count:', error)
        }
    }

    const fetchRecentNotifications = async () => {
        try {
            setLoading(true)
            const response = await notificationService.getMyNotifications({ page: 1, limit: 5 })
            setNotifications(response.data || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBellClick = () => {
        setShowDropdown(!showDropdown)
        if (!showDropdown) {
            fetchRecentNotifications()
        }
    }

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation()
        try {
            await notificationService.markAsRead(id)
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ))
            fetchUnreadCount()
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.read) {
            await notificationService.markAsRead(notification._id)
            fetchUnreadCount()
        }

        // Navigate to related document if exists
        if (notification.relatedDocument) {
            setShowDropdown(false)
            // Navigate based on user role - for now go to notifications page
            navigate('/notifications')
        }
    }

    const handleViewAll = () => {
        setShowDropdown(false)
        navigate('/notifications')
    }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const seconds = Math.floor((now - date) / 1000)

        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return date.toLocaleDateString()
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'DOCUMENT_UPLOADED':
                return <FileText className="h-5 w-5 text-blue-600" />
            case 'DOCUMENT_APPROVED':
                return <Check className="h-5 w-5 text-green-600" />
            case 'DOCUMENT_REJECTED':
                return <X className="h-5 w-5 text-red-600" />
            default:
                return <Bell className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-sm text-gray-500">{unreadCount} unread</span>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No notifications</p>
                                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                    className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={handleViewAll}
                                className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 hover:bg-blue-50 rounded transition-colors"
                            >
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
