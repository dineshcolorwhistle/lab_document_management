import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getMenuItemsForRole } from '../../config/menu'
import { X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Sidebar({
  isMobileOpen,
  onMobileClose,
  isCollapsed = false,
  onCollapseToggle,
}) {
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
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-brand-primary/8 text-brand-primary shadow-soft'
            : 'text-brand-primary/80 hover:bg-brand-muted/10 hover:text-brand-primary'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-primary'
          )}
        />
        <span className={cn('truncate', isCollapsed && 'lg:sr-only')}>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-primary/20 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col bg-brand-surface-elevated shadow-soft-xl transition-all duration-300 ease-in-out lg:translate-x-0',
          'w-sidebar',
          isCollapsed && 'lg:w-sidebar-collapsed',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header / logo */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-brand-border/60 px-3 py-2">
          <Link
            to="/dashboard"
            onClick={onMobileClose}
            className={cn(
              'flex min-w-0 items-center gap-3 rounded-xl py-2 transition-colors hover:bg-brand-muted/10',
              isCollapsed ? 'lg:flex-0 lg:min-w-0' : 'flex-1'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary shadow-soft">
              <span className="text-sm font-bold text-brand-surface">LD</span>
            </div>
            <div className={cn('min-w-0 flex-1', isCollapsed && 'lg:sr-only')}>
              <div className="truncate text-sm font-semibold text-brand-primary">Lab Docs</div>
              <div className="truncate text-xs text-brand-muted">Compliance</div>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={onCollapseToggle}
              className={cn(
                'hidden rounded-lg p-2 text-brand-muted transition-colors hover:bg-brand-muted/10 hover:text-brand-primary lg:block',
                isCollapsed && 'lg:block'
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onMobileClose}
              className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-brand-muted/10 hover:text-brand-primary lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
            {menuItems.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-brand-muted">
                No menus available
              </div>
            )}
          </div>
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-brand-border/60 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl bg-brand-surface/80 px-3 py-2',
              isCollapsed && 'lg:justify-center'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-xs font-semibold text-brand-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={cn('min-w-0 flex-1 truncate', isCollapsed && 'lg:sr-only')}>
              <div className="truncate text-xs font-medium text-brand-primary">{user?.name}</div>
              <div className="truncate text-xs text-brand-muted capitalize">
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
  )
}
