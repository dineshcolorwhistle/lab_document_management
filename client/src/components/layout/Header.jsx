import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { clearToken } from '../../services/token'
import { cn } from '../../utils/cn'

export function Header({ title, breadcrumbs, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleLogout = () => {
    logout()
    clearToken()
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-slate-50 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-md p-2 text-gray-600 hover:bg-slate-200"
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
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="mx-1">/</span>}
                    {crumb.path ? (
                      <a href={crumb.path} className="hover:text-gray-700">
                        {crumb.label}
                      </a>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-slate-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span className="hidden sm:block">{user?.name}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
              <div className="border-b border-gray-100 px-4 py-2">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
                <div className="mt-1 text-xs font-medium text-gray-600 capitalize">
                  {user?.role?.toLowerCase().replace('_', ' ')}
                </div>
              </div>
              <a
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault()
                  setDropdownOpen(false)
                  navigate('/profile')
                }}
              >
                <User className="h-4 w-4" />
                Profile
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                onClick={(e) => {
                  e.preventDefault()
                  setDropdownOpen(false)
                  navigate('/settings')
                }}
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </a>
              <div className="border-t border-gray-100" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
