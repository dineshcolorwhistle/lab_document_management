const express = require('express')
const { z } = require('zod')

const { health, secureHealth, echo } = require('../controllers/health.controller')
const { requireAuth } = require('../middlewares/auth')
const { authorizeRoles } = require('../middlewares/rbac')
const { validate } = require('../middlewares/validate')
const { ROLES } = require('../constants/roles')

const router = express.Router()

router.get('/health', health)

router.get(
  '/health/secure',
  requireAuth,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER, ROLES.LAB_TECHNICIAN),
  secureHealth,
)

router.post(
  '/health/echo',
  validate({
    body: z.object({
      message: z.string().min(1),
    }),
  }),
  echo,
)

module.exports = { healthRouter: router }
