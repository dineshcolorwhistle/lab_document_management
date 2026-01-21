const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const { app } = require('./app')
const { connectDb } = require('./config/db')
const { loadEnv } = require('./config/env')

async function start() {
  const env = loadEnv()

  await connectDb(env.MONGODB_URI)

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.PORT}`)
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err)
  process.exit(1)
})

