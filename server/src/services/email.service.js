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
  // eslint-disable-next-line no-console
  console.warn(
    '[email] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Using Ethereal test inbox – emails will NOT reach real addresses. See server/docs/SMTP_SETUP.md to send to real inboxes.'
  )
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

/**
 * Send document uploaded notification email
 */
async function sendDocumentUploadedEmail({ recipient, document, uploader, lab, machineInstance }) {
  const subject = `New Document Uploaded: ${document.name}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📄 New Document Uploaded</h2>
        </div>
        <div class="content">
          <p>Hello ${recipient.name},</p>
          <p>A new document has been uploaded and is pending review.</p>
          
          <div class="info-row"><span class="label">Document Name:</span> ${document.name}</div>
          <div class="info-row"><span class="label">Uploaded By:</span> ${uploader.name} (${uploader.email})</div>
          <div class="info-row"><span class="label">Lab:</span> ${lab.name}</div>
          <div class="info-row"><span class="label">Machine Instance:</span> ${machineInstance.nickname || machineInstance.model} - ${machineInstance.serialNumber}</div>
          ${document.applicableDate ? `<div class="info-row"><span class="label">Applicable Date:</span> ${new Date(document.applicableDate).toLocaleDateString()}</div>` : ''}
          ${document.comments ? `<div class="info-row"><span class="label">Comments:</span> ${document.comments}</div>` : ''}
          <div class="info-row"><span class="label">Upload Date:</span> ${new Date(document.createdAt).toLocaleString()}</div>
          
          <p style="margin-top: 20px;">Please review this document at your earliest convenience.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Lab Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `New Document Uploaded\n\nDocument Name: ${document.name}\nUploaded By: ${uploader.name} (${uploader.email})\nLab: ${lab.name}\nMachine Instance: ${machineInstance.nickname || machineInstance.model} - ${machineInstance.serialNumber}\n${document.applicableDate ? `Applicable Date: ${new Date(document.applicableDate).toLocaleDateString()}\n` : ''}${document.comments ? `Comments: ${document.comments}\n` : ''}Upload Date: ${new Date(document.createdAt).toLocaleString()}\n\nPlease review this document at your earliest convenience.`

  return sendMail({ to: recipient.email, subject, html, text })
}

/**
 * Send document reviewed notification email
 */
async function sendDocumentReviewedEmail({ recipient, document, reviewer, status, feedback }) {
  const statusText = status === 'APPROVED' ? 'Approved' : 'Rejected'
  const statusColor = status === 'APPROVED' ? '#10b981' : '#ef4444'
  const statusEmoji = status === 'APPROVED' ? '✅' : '❌'

  const subject = `Document ${statusText}: ${document.name}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${statusColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #4b5563; }
        .status-badge { display: inline-block; padding: 6px 12px; background-color: ${statusColor}; color: white; border-radius: 4px; font-weight: bold; }
        .feedback-box { background-color: white; padding: 15px; border-left: 4px solid ${statusColor}; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">${statusEmoji} Document ${statusText}</h2>
        </div>
        <div class="content">
          <p>Hello ${recipient.name},</p>
          <p>Your document has been reviewed.</p>
          
          <div class="info-row"><span class="label">Document Name:</span> ${document.name}</div>
          <div class="info-row"><span class="label">Status:</span> <span class="status-badge">${statusText}</span></div>
          <div class="info-row"><span class="label">Reviewed By:</span> ${reviewer.name}</div>
          <div class="info-row"><span class="label">Review Date:</span> ${new Date().toLocaleString()}</div>
          
          ${feedback ? `<div class="feedback-box"><div class="label">Feedback:</div><p style="margin: 10px 0 0 0;">${feedback}</p></div>` : ''}
          
          <p style="margin-top: 20px;">${status === 'APPROVED' ? 'Your document has been approved and is now active in the system.' : 'Please review the feedback and resubmit if necessary.'}</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Lab Management System.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `Document ${statusText}\n\nDocument Name: ${document.name}\nStatus: ${statusText}\nReviewed By: ${reviewer.name}\nReview Date: ${new Date().toLocaleString()}\n\n${feedback ? `Feedback: ${feedback}\n\n` : ''}${status === 'APPROVED' ? 'Your document has been approved and is now active in the system.' : 'Please review the feedback and resubmit if necessary.'}`

  return sendMail({ to: recipient.email, subject, html, text })
}

module.exports = {
  sendMail,
  sendDocumentUploadedEmail,
  sendDocumentReviewedEmail,
}

