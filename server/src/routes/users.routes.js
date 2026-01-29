const express = require('express')
const {
  listAdmins,
  createAdmin,
  updateAdmin,
  enableAdmin,
  deleteAdmin,
  deleteAdminPermanent,
  listLabOwners,
  createLabOwner,
  updateLabOwner,
  enableLabOwner,
  deleteLabOwner,
  deleteLabOwnerPermanent,
  listLabTechnicians,
  createLabTechnician,
  updateLabTechnician,
  enableLabTechnician,
  deleteLabTechnician,
  deleteLabTechnicianPermanent,
} = require('../controllers/users.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

const router = express.Router()

// Mounted at /api/users — paths here are relative to /users (full path: /api/users/...)

router.get(
  '/',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  listAdmins,
)

router.post(
  '/admins',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  createAdmin,
)

router.patch(
  '/admins/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  updateAdmin,
)

router.patch(
  '/admins/:id/enable',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  enableAdmin,
)

router.delete(
  '/admins/:id/permanent',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteAdminPermanent,
)

router.delete(
  '/admins/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteAdmin,
)

// Lab owners — ADMIN and SUPER_ADMIN (CRUD)
router.get(
  '/lab-owners',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  listLabOwners,
)

router.post(
  '/lab-owners',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  createLabOwner,
)

router.patch(
  '/lab-owners/:id',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  updateLabOwner,
)

router.patch(
  '/lab-owners/:id/enable',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  enableLabOwner,
)

router.delete(
  '/lab-owners/:id',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  deleteLabOwner,
)

router.delete(
  '/lab-owners/:id/permanent',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  deleteLabOwnerPermanent,
)

// Lab technicians — list: ADMIN, LAB_OWNER, SUPER_ADMIN; create/update/delete: ADMIN, SUPER_ADMIN
router.get(
  '/lab-technicians',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.SUPER_ADMIN),
  listLabTechnicians,
)

router.post(
  '/lab-technicians',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  createLabTechnician,
)

router.patch(
  '/lab-technicians/:id',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  updateLabTechnician,
)

router.patch(
  '/lab-technicians/:id/enable',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  enableLabTechnician,
)

router.delete(
  '/lab-technicians/:id',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  deleteLabTechnician,
)

router.delete(
  '/lab-technicians/:id/permanent',
  requireAuth,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  deleteLabTechnicianPermanent,
)

module.exports = { usersRouter: router }
