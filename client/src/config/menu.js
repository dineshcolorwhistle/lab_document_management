import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Shield,
  FlaskConical,
  Building2,
  Wrench,
} from 'lucide-react'
import { ROLES } from '../constants/roles'

/** Permission levels: CRUD (create, read, update, delete) | VIEW (read-only) */
export const PERMISSIONS = Object.freeze({
  CRUD: 'CRUD',
  VIEW: 'VIEW',
})

/**
 * Flat menu items with role visibility and per-role permissions.
 * Each item: { id, label, path, icon, roles, rolePermissions? }
 * rolePermissions: { [ROLES.XXX]: 'CRUD' | 'VIEW' } — omit = full access for that role.
 */
export const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.LAB_TECHNICIAN],
  },
  {
    id: 'document',
    label: 'Document',
    path: '/documents',
    icon: FileText,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.LAB_TECHNICIAN],
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER],
    rolePermissions: {
      [ROLES.LAB_OWNER]: PERMISSIONS.VIEW,
    },
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: Shield,
    roles: [ROLES.SUPER_ADMIN],
    rolePermissions: {
      [ROLES.SUPER_ADMIN]: PERMISSIONS.CRUD,
    },
  },
  {
    id: 'lab-management',
    label: 'Lab Management',
    path: '/lab-management',
    icon: FlaskConical,
    roles: [ROLES.ADMIN],
    rolePermissions: {
      [ROLES.ADMIN]: PERMISSIONS.CRUD,
    },
  },
  {
    id: 'lab-technician',
    label: 'Lab Technician',
    path: '/lab-technicians',
    icon: Wrench,
    roles: [ROLES.ADMIN, ROLES.LAB_OWNER],
    rolePermissions: {
      [ROLES.ADMIN]: PERMISSIONS.CRUD,
      [ROLES.LAB_OWNER]: PERMISSIONS.VIEW,
    },
  },
  {
    id: 'lab-owner',
    label: 'Lab Owner',
    path: '/lab-owners',
    icon: Building2,
    roles: [ROLES.ADMIN],
    rolePermissions: {
      [ROLES.ADMIN]: PERMISSIONS.CRUD,
    },
  },
  {
    id: 'lab',
    label: 'Lab',
    path: '/labs',
    icon: FlaskConical,
    roles: [ROLES.LAB_OWNER],
  },
]

/**
 * Returns menu items visible for the given role.
 * @param {string} userRole
 * @returns {Array<{ id, label, path, icon, permission?: 'CRUD'|'VIEW' }>}
 */
export function getMenuItemsForRole(userRole) {
  if (!userRole) return []
  return menuItems
    .filter((item) => item.roles.includes(userRole))
    .map((item) => {
      const permission = item.rolePermissions?.[userRole]
      return {
        ...item,
        permission: permission ?? PERMISSIONS.CRUD,
      }
    })
}

/**
 * Returns the permission level for a menu item and role.
 * @param {string} menuId - e.g. 'reports', 'admin'
 * @param {string} userRole
 * @returns {'CRUD'|'VIEW'|null} null if user has no access
 */
export function getPermissionForMenu(menuId, userRole) {
  if (!userRole) return null
  const item = menuItems.find((i) => i.id === menuId)
  if (!item || !item.roles.includes(userRole)) return null
  return item.rolePermissions?.[userRole] ?? PERMISSIONS.CRUD
}
