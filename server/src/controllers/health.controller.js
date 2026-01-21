const { asyncHandler } = require('../utils/asyncHandler')

const health = asyncHandler(async (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

const secureHealth = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    user: req.user,
    timestamp: new Date().toISOString(),
  })
})

const echo = asyncHandler(async (req, res) => {
  res.json({ success: true, echo: req.body })
})

module.exports = { health, secureHealth, echo }
