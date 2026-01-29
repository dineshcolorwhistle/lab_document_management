/**
 * Test email configuration. Run from server directory:
 *   node src/scripts/test-email.js
 *   node src/scripts/test-email.js someone@example.com
 *
 * Uses SMTP_* from .env. Sends to SMTP_USER or the email you pass as first argument.
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const { loadEnv } = require('../config/env')
const { sendMail } = require('../services/email.service')

async function main() {
  const env = loadEnv()
  const to = process.argv[2] || env.SMTP_USER

  if (!to) {
    console.error('Usage: node src/scripts/test-email.js [recipient@email.com]')
    console.error('  If no recipient is given, sends to SMTP_USER.')
    process.exit(1)
  }

  const hasSmtp = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
  console.log('SMTP configured:', hasSmtp ? 'yes' : 'no (will use Ethereal test inbox)')
  if (hasSmtp) {
    console.log('  Host:', env.SMTP_HOST)
    console.log('  From:', env.SMTP_FROM)
  }
  console.log('Sending test email to:', to)
  console.log('')

  try {
    await sendMail({
      to,
      subject: 'Test email – Lab Document Management',
      text: 'This is a test email. If you received this, your server email configuration is working.',
    })
    console.log('Success: Test email sent. Check the inbox (and Spam) for:', to)
  } catch (err) {
    console.error('Failed to send test email:', err.message || err)
    if (err?.responseCode === 534 || err?.message?.includes('Application-specific password')) {
      console.error('Tip: Gmail requires an App Password. See server/docs/SMTP_SETUP.md')
    }
    process.exit(1)
  }
}

main()
