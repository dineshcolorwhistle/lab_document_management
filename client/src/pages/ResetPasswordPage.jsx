import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/auth'

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
    <div className="mx-auto max-w-md rounded-lg border bg-white p-6">
      <h1 className="text-lg font-semibold">Reset password</h1>
      <p className="mt-2 text-sm text-slate-600">Choose a new password for your account.</p>

      {missingToken ? (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Missing reset token. Please request a new reset link.
        </div>
      ) : done ? (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Password updated. Redirecting to login…
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">New password</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 characters.</p>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}

      <div className="mt-4 text-sm">
        <Link className="font-medium text-blue-600" to="/login">
          Back to login
        </Link>
        <span className="mx-2 text-slate-400">•</span>
        <Link className="font-medium text-blue-600" to="/forgot-password">
          Request reset link
        </Link>
      </div>
    </div>
  )
}

