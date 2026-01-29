const express = require('express')
const { listLabs, getLab, createLab, updateLab, deleteLab } = require('../controllers/lab.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { ROLES } = require('../constants/roles')

const router = express.Router()

// All lab management routes — SUPER_ADMIN and ADMIN only
router.get(
  '/',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  listLabs,
)

router.get(
  '/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  getLab,
)

router.post(
  '/',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  createLab,
)

router.patch(
  '/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateLab,
)

router.delete(
  '/:id',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  deleteLab,
)

module.exports = { labRouter: router }
