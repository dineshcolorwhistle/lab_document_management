const nodemailer = require('nodemailer')
const { loadEnv } = require('../config/env')

function getTransport() {
  const env = loadEnv()

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

async function sendMail({ to, subject, text, html }) {
  const env = loadEnv()
  const transport = getTransport()

  if (!transport) {
    // eslint-disable-next-line no-console
    console.log('[email:dev] SMTP not configured; skipping send:', { to, subject, text })
    return { skipped: true }
  }

  return transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  })
}

module.exports = { sendMail }
