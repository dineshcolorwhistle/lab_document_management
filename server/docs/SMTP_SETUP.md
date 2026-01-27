# SMTP Email Configuration

This guide explains how to configure SMTP for sending emails (password reset links, admin invitations, etc.).

## Quick Start

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Google Account
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled

2. **Generate an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → enter "Lab Document Management"
   - Click **Generate**
   - Copy the 16-character password (it looks like: `abcd efgh ijkl mnop`)

3. **Configure `.env` in `server/` directory:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # The 16-char App Password (remove spaces)
   SMTP_FROM=your-email@gmail.com
   ```

**Important:** Use the **App Password**, not your regular Gmail password. If you see:
```
534-5.7.9 Application-specific password required
```
You're using the wrong password. Generate an App Password and use that.

### Option 2: Ethereal (Automatic Fallback)

If SMTP is not configured, the app automatically uses **Ethereal** (Nodemailer's test email service) in development. Check your server console for:
```
[email:ethereal] Message sent. Preview: https://ethereal.email/message/...
```
Open that URL to view the email and copy the reset link.

### Option 3: Other SMTP Providers

#### Mailtrap (Testing)
```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=<your-mailtrap-username>
SMTP_PASS=<your-mailtrap-password>
SMTP_FROM=noreply@lab-document-management.local
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
SMTP_FROM=your-verified-sender@domain.com
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-mailgun-smtp-username>
SMTP_PASS=<your-mailgun-smtp-password>
SMTP_FROM=noreply@your-domain.com
```

## Environment Variables

All SMTP variables are **optional**. If not set, the app uses Ethereal in development.

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port (usually 587 for TLS, 465 for SSL) | `587` |
| `SMTP_SECURE` | Use SSL/TLS (`true` for port 465, `false` for port 587) | `false` |
| `SMTP_USER` | SMTP username (usually your email) | `user@gmail.com` |
| `SMTP_PASS` | SMTP password (for Gmail: App Password) | `abcdefghijklmnop` |
| `SMTP_FROM` | "From" email address | `noreply@lab-docs.com` |

## Troubleshooting

### Gmail: "Application-specific password required"
- **Solution:** Generate an App Password (see Option 1 above)
- Don't use your regular Gmail password

### Connection timeout
- Check firewall/network allows outbound SMTP
- Verify `SMTP_HOST` and `SMTP_PORT` are correct
- For Gmail, ensure `SMTP_PORT=587` and `SMTP_SECURE=false`

### Authentication failed
- Verify `SMTP_USER` and `SMTP_PASS` are correct
- For Gmail, ensure you're using an App Password, not your account password
- Check that 2-Step Verification is enabled (required for App Passwords)

### Emails not received
- Check spam/junk folder
- Verify `SMTP_FROM` is a valid sender address
- For Gmail, ensure the App Password is still valid (they can be revoked)

## Testing

After configuring SMTP, test by:
1. Creating a new admin (Super Admin → Admin page → Add Admin)
2. Check the admin's email inbox (or Ethereal preview if using fallback)
3. The email should contain a password reset link
