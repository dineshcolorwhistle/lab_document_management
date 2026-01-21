import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/auth'

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
    <div className="mx-auto max-w-md rounded-lg border bg-white p-6">
      <h1 className="text-lg font-semibold">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter your email address and we’ll send a password reset link.
      </p>

      {done ? (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          If that email exists, a reset link has been sent.
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <div className="mt-4 text-sm">
        <Link className="font-medium text-blue-600" to="/login">
          Back to login
        </Link>
      </div>
    </div>
  )
}

