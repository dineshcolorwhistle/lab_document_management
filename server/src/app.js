const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const routes = require('./routes')
const { notFound } = require('./middlewares/notFound')
const { errorHandler } = require('./middlewares/errorHandler')
const { loadEnv } = require('./config/env')

const app = express()
const env = loadEnv()

// Trust proxy so req.ip works correctly behind reverse proxies.
app.set('trust proxy', true)

app.use(
  cors({
    origin: env.corsOrigins.includes('*') ? '*' : env.corsOrigins,
    credentials: true,
  }),
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

app.get('/', (_req, res) => {
  res.json({ success: true, name: 'lab-document-management-api' })
})

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

module.exports = { app }
