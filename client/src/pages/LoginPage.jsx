import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { setToken } from '../services/token'
import { AuthShell } from '../components/AuthShell'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login({ email: email.trim(), password })
      setToken(data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Welcome back. Please enter your details.">
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

        <div>
          <label className="text-sm font-medium text-[#352D36]">Password</label>
          <Input
            className="mt-1"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </div>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link className="font-medium text-[#352D36] underline-offset-4 hover:underline" to="/forgot-password">
            Forgot password?
          </Link>
          <span className="text-xs text-[#909493]">Secure access with RBAC</span>
        </div>
      </form>
    </AuthShell>
  )
}
