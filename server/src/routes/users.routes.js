const express = require('express')
const {
  listAdmins,
  createAdmin,
  updateAdmin,
  enableAdmin,
  deleteAdmin,
  deleteAdminPermanent,
} = require('../controllers/users.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

const router = express.Router()

router.get(
  '/users',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  listAdmins,
)

router.post(
  '/users/admins',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  createAdmin,
)

router.patch(
  '/users/admins/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  updateAdmin,
)

router.patch(
  '/users/admins/:id/enable',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  enableAdmin,
)

router.delete(
  '/users/admins/:id/permanent',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteAdminPermanent,
)

router.delete(
  '/users/admins/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteAdmin,
)

module.exports = { usersRouter: router }
