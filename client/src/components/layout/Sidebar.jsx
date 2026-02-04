
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getMenuItemsForRole } from '../../config/menu'
import { X, PanelLeftClose, PanelLeft, ChevronDown, Check, Building2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLab } from '../../contexts/LabContext'
import { ROLES } from '../../constants/roles'
import { API_URL } from '../../utils/env'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu'

export function Sidebar({
  isMobileOpen,
  onMobileClose,
  isCollapsed = false,
  onCollapseToggle,
}) {
  const { user } = useAuth()
  const location = useLocation()
  const menuItems = getMenuItemsForRole(user?.role)

  const { selectedLab, selectLab, labs } = useLab()
  const showLabSelector = user?.role === ROLES.LAB_OWNER || user?.role === ROLES.LAB_TECHNICIAN

  const baseUrl = API_URL

  const NavLink = ({ item }) => {
    const Icon = item.icon
    const isActive =
      location.pathname === item.path || location.pathname.startsWith(item.path + '/')

    return (
      <Link
        to={item.path}
        onClick={onMobileClose}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
          isActive
            ? 'bg-blue-600/10 text-blue-100' // Distinct active background
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' // Visible inactive text
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />
        )}
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col bg-slate-900 shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800',
          'w-sidebar',
          isCollapsed && 'lg:w-sidebar-collapsed',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header / logo */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-slate-800/60">
          {showLabSelector ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex min-w-0 items-center gap-2 py-1.5 px-2 bg-slate-800/40 border border-slate-700/50 rounded-lg transition-all hover:bg-slate-800/60 hover:border-slate-600 text-left outline-none',
                    isCollapsed ? 'lg:flex-0 lg:min-w-0 p-1' : 'flex-1'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/20">
                    <span className="text-sm font-semibold text-white">
                      {selectedLab ? selectedLab.name.substring(0, 2).toUpperCase() : 'LD'}
                    </span>
                  </div>
                  <div className={cn('min-w-0 flex-1', isCollapsed && 'lg:sr-only')}>
                    <div className="flex items-center justify-between gap-1">
                      <div className="truncate text-sm font-semibold text-white">
                        {selectedLab ? selectedLab.name : 'Select Lab'}
                      </div>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-56 bg-slate-900 border-slate-800 text-slate-200"
              >
                {labs.length > 0 ? (
                  labs.map((lab) => (
                    <DropdownMenuItem
                      key={lab.id}
                      onClick={() => selectLab(lab.id)}
                      className="focus:bg-slate-800 focus:text-white cursor-pointer"
                    >
                      <Building2 className="mr-2 h-4 w-4 opacity-50" />
                      <span className="flex-1 truncate">{lab.name}</span>
                      {selectedLab?.id === lab.id && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-2 text-xs text-slate-500 text-center">No labs assigned</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/dashboard"
              onClick={onMobileClose}
              className={cn(
                'flex min-w-0 items-center gap-3 py-2 transition-opacity hover:opacity-90',
                isCollapsed ? 'lg:flex-0 lg:min-w-0' : 'flex-1'
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/20">
                <span className="text-sm font-semibold text-white">LD</span>
              </div>
              <div className={cn('min-w-0 flex-1', isCollapsed && 'lg:sr-only')}>
                <div className="truncate text-base font-semibold text-white tracking-tight">
                  Lab Docs
                </div>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={onCollapseToggle}
              className={cn(
                'hidden rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:block',
                isCollapsed && 'lg:block'
              )}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onMobileClose}
              className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
            {menuItems.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-slate-500">
                No menus available
              </div>
            )}
          </div>
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-slate-800 p-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl bg-slate-800/50 px-3 py-2.5 border border-slate-700/50',
              isCollapsed && 'lg:justify-center lg:px-2'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-700 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
              {user?.profileImage ? (
                <img
                  src={`${baseUrl}/${user.profileImage}`}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div className={cn('min-w-0 flex-1 truncate', isCollapsed && 'lg:sr-only')}>
              <div className="truncate text-xs font-medium text-slate-200">{user?.name}</div>
              <div className="truncate text-[10px] text-slate-400 capitalize mt-0.5">
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
