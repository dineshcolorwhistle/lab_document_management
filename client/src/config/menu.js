import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Shield,
  FlaskConical,
  Building2,
  Wrench,
  FileStack,
  Settings2,
  Cpu,
  Tags,
  Bell,
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
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: Bell,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.LAB_TECHNICIAN],
  },
  {
    id: 'document',
    label: 'Documents',
    path: '/documents',
    icon: FileText,
    roles: [ROLES.LAB_TECHNICIAN],
  },
  {
    id: 'lab-owner-documents',
    label: 'Documents',
    path: '/lab-owner-documents',
    icon: FileText,
    roles: [ROLES.LAB_OWNER],
  },
  {
    id: 'admin-documents',
    label: 'Documents',
    path: '/admin-documents',
    icon: FileText,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
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

  // Labs Group
  {
    id: 'lab-management',
    label: 'Lab Management',
    path: '/lab-management',
    icon: FlaskConical,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    category: 'Labs',
    rolePermissions: {
      [ROLES.ADMIN]: PERMISSIONS.CRUD,
      [ROLES.SUPER_ADMIN]: PERMISSIONS.CRUD,
    },
  },
  {
    id: 'lab-owner',
    label: 'Lab Owner',
    path: '/lab-owners',
    icon: Building2,
    roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    category: 'Labs',
    rolePermissions: {
      [ROLES.ADMIN]: PERMISSIONS.CRUD,
      [ROLES.SUPER_ADMIN]: PERMISSIONS.CRUD,
    },
  },
  {
    id: 'lab-technician',
    label: 'Lab Technician',
    path: '/lab-technicians',
    icon: Wrench,
    roles: [ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.SUPER_ADMIN],
    category: 'Labs',
    rolePermissions: {
      [ROLES.ADMIN]: PERMISSIONS.CRUD,
      [ROLES.LAB_OWNER]: PERMISSIONS.VIEW,
      [ROLES.SUPER_ADMIN]: PERMISSIONS.CRUD,
    },
  },

  // Machine Group
  {
    id: 'machine-type',
    label: 'Machine Type',
    path: '/machine-types',
    icon: Settings2,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.LAB_TECHNICIAN],
    category: 'Machine',
    rolePermissions: {
      [ROLES.LAB_OWNER]: PERMISSIONS.VIEW,
      [ROLES.LAB_TECHNICIAN]: PERMISSIONS.VIEW,
    },
  },
  {
    id: 'machine-instance',
    label: 'Machine Instance',
    path: '/machine-instance-management',
    icon: Cpu,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.LAB_TECHNICIAN],
    category: 'Machine',
    rolePermissions: {
      [ROLES.LAB_TECHNICIAN]: PERMISSIONS.VIEW,
    },
  },

  // Docs Group
  {
    id: 'document-type',
    label: 'Document Type',
    path: '/document-types',
    icon: Tags,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    category: 'Docs',
  },
  {
    id: 'document-template',
    label: 'Document Template',
    path: '/document-templates',
    icon: FileStack,
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    category: 'Docs',
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
