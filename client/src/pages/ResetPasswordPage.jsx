import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/auth'
import { AuthShell } from '../components/AuthShell'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token') || '', [params])

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword({ token, password })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 800)
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  const missingToken = !token

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a strong password to protect your account."
      footer={
        <div className="flex items-center justify-between text-sm">
          <Link className="font-medium text-[#352D36] underline-offset-4 hover:underline" to="/login">
            Back to login
          </Link>
          <Link
            className="font-medium text-[#352D36] underline-offset-4 hover:underline"
            to="/forgot-password"
          >
            Request a new link
          </Link>
        </div>
      }
    >
      {missingToken ? (
        <Alert variant="warning" title="Missing token">
          <div className="text-sm">
            Please request a new reset link and open it from your email.
          </div>
        </Alert>
      ) : done ? (
        <Alert variant="success">Password updated. Redirecting to login…</Alert>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-[#352D36]">New password</label>
            <Input
              className="mt-1"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              placeholder="Minimum 8 characters"
              required
            />
            <p className="mt-1 text-xs text-[#7D7980]">Minimum 8 characters.</p>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

