const nodemailer = require('nodemailer')
const { loadEnv } = require('../config/env')

let _smtpTransport = null
let _etherealTransportPromise = null

function getSmtpTransport() {
  const env = loadEnv()
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null
  if (_smtpTransport) return _smtpTransport
  _smtpTransport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })
  return _smtpTransport
}

async function getEtherealTransport() {
  if (_etherealTransportPromise) return _etherealTransportPromise
  _etherealTransportPromise = (async () => {
    const account = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    })
  })()
  return _etherealTransportPromise
}

async function getTransport() {
  const smtp = getSmtpTransport()
  if (smtp) return { transport: smtp, ethereal: false }
  return { transport: await getEtherealTransport(), ethereal: true }
}

async function sendMail({ to, subject, text, html }) {
  const env = loadEnv()
  const { transport, ethereal } = await getTransport()

  try {
    const info = await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })

    if (ethereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      // eslint-disable-next-line no-console
      console.log('[email:ethereal] Message sent. Preview:', previewUrl || 'N/A')
    }

    return info
  } catch (error) {
    // Provide helpful error message for common Gmail issue
    if (error?.responseCode === 534 || error?.message?.includes('Application-specific password')) {
      // eslint-disable-next-line no-console
      console.error(
        '[email:error] Gmail requires an App Password. See README.md or server/docs/SMTP_SETUP.md for setup instructions.'
      )
    }
    throw error
  }
}

module.exports = { sendMail }
