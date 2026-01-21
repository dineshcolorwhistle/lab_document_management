const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const bcrypt = require('bcryptjs')
const { connectDb } = require('../config/db')

require('../models/User') // register model
const User = require('../models/User')
const { ROLES } = require('../constants/roles')

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required to seed users')
  }

  const name = process.env.SEED_SUPER_ADMIN_NAME
  const email = process.env.SEED_SUPER_ADMIN_EMAIL
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD
  const role = process.env.SEED_SUPER_ADMIN_ROLE || ROLES.SUPER_ADMIN
  const forcePassword =
    String(process.env.SEED_SUPER_ADMIN_FORCE_PASSWORD || '').toLowerCase() === 'true' ||
    String(process.env.SEED_SUPER_ADMIN_FORCE_PASSWORD || '') === '1'

  if (!name || !email || !password) {
    throw new Error(
      'Missing seed env vars. Set SEED_SUPER_ADMIN_NAME, SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD',
    )
  }

  await connectDb(MONGODB_URI)

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
  if (existing) {
    // Keep existing password by default; optionally reset if requested.
    existing.name = name
    existing.role = role
    existing.status = 'ACTIVE'
    if (forcePassword) {
      existing.passwordHash = await bcrypt.hash(password, 10)
    }
    await existing.save()
    // eslint-disable-next-line no-console
    console.log(
      `Seed: user already existed; updated role/status${forcePassword ? ' + password' : ''} for ${email}`,
    )
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    status: 'ACTIVE',
    assignedLabs: [],
  })

  // eslint-disable-next-line no-console
  console.log(`Seed: created SUPER_ADMIN user ${email}`)
}

seed()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    const mongoose = require('mongoose')
    await mongoose.disconnect().catch(() => undefined)
  })

