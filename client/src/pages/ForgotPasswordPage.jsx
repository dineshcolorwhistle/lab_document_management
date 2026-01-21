import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/auth'
import { AuthShell } from '../components/AuthShell'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword({ email: email.trim() })
      setDone(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we’ll send a secure reset link."
      footer={
        <div className="flex items-center justify-between text-sm">
          <Link className="font-medium text-[#352D36] underline-offset-4 hover:underline" to="/login">
            Back to login
          </Link>
          <span className="text-xs text-[#909493]">Link expires in 30 minutes</span>
        </div>
      }
    >
      {done ? (
        <Alert
          variant="info"
          title="Check your email"
        >
          If that email exists, a reset link has been sent.
          <div className="mt-1 text-xs text-[#7D7980]">
            If SMTP isn’t configured, the link is logged in the server console.
          </div>
        </Alert>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-[#352D36]">Email</label>
            <Input
              className="mt-1"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

