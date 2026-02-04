import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { clearToken } from '../../services/token'
import { cn } from '../../utils/cn'

import { ThemeToggle } from '../ui/ThemeToggle'
import { API_URL } from '../../utils/env'

export function Header({ title, breadcrumbs, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const baseUrl = API_URL

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
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        {/* Left: menu (mobile) + title & breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-xl p-2 text-brand-primary transition-colors hover:bg-brand-muted/10 lg:hidden"
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
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-brand-primary">{title}</h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-sm text-brand-muted" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="mx-1" aria-hidden>/</span>}
                    {crumb.path ? (
                      <a href={crumb.path} className="hover:text-brand-primary">
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Right: user menu */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-2 text-brand-primary transition-colors hover:bg-brand-muted/10 sm:gap-3 sm:px-3"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-brand-primary text-xs font-semibold text-brand-surface shadow-soft">
                {user?.profileImage ? (
                  <img
                    src={`${baseUrl}/${user.profileImage}`}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">{user?.name}</span>
              <ChevronDown
                className={cn('h-4 w-4 text-brand-muted transition-transform', dropdownOpen && 'rotate-180')}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-brand-border bg-brand-surface-elevated py-1 shadow-soft-xl"
                role="menu"
              >
                <div className="border-b border-brand-border/60 px-4 py-3">
                  <div className="truncate text-sm font-medium text-brand-primary">{user?.name}</div>
                  <div className="truncate text-xs text-brand-muted">{user?.email}</div>
                  <div className="mt-0.5 text-xs font-medium capitalize text-brand-primary/80">
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-primary transition-colors hover:bg-brand-muted/10"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault()
                    setDropdownOpen(false)
                    navigate('/profile')
                  }}
                >
                  <User className="h-4 w-4 text-brand-muted" />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-primary transition-colors hover:bg-brand-muted/10"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault()
                    setDropdownOpen(false)
                    navigate('/settings')
                  }}
                >
                  <Settings className="h-4 w-4 text-brand-muted" />
                  Account Settings
                </a>
                <div className="my-1 border-t border-brand-border/60" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
