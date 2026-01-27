import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getMenuItemsForRole } from '../../config/menu'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Sidebar({ isMobileOpen, onMobileClose }) {
  const { user } = useAuth()
  const location = useLocation()
  const menuItems = getMenuItemsForRole(user?.role)

  const NavLink = ({ item }) => {
    const Icon = item.icon
    const isActive =
      location.pathname === item.path || location.pathname.startsWith(item.path + '/')

    return (
      <Link
        to={item.path}
        onClick={onMobileClose}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-gray-700 hover:bg-slate-100 hover:text-gray-900'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
          )}
        />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-gray-200 bg-slate-50 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-slate-50/80 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">LD</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Lab Docs</div>
                <div className="text-xs text-gray-500">Compliance Platform</div>
              </div>
            </div>
            <button
              onClick={onMobileClose}
              className="lg:hidden rounded-md p-1.5 text-gray-400 hover:bg-slate-200 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink key={item.id} item={item} />
              ))}
              {menuItems.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  No menus available
                </div>
              )}
            </div>
          </nav>

          <div className="border-t border-gray-200 bg-slate-50/80 p-4">
            <div className="text-xs text-gray-500">
              <div className="font-medium text-gray-700">{user?.name}</div>
              <div className="mt-0.5 capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
      aria-label="Toggle sidebar"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  )
}
