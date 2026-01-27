import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../../contexts/AuthContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/documents': 'Document',
  '/reports': 'Reports',
  '/admin': 'Admin',
  '/lab-management': 'Lab Management',
  '/lab-technicians': 'Lab Technician',
  '/lab-owners': 'Lab Owner',
  '/labs': 'Lab',
  '/profile': 'Profile',
  '/settings': 'Account Settings',
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { loading } = useAuth()

  const currentPath = location.pathname
  const title = pageTitles[currentPath] || 'Dashboard'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        <Header
          title={title}
          breadcrumbs={[]}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
