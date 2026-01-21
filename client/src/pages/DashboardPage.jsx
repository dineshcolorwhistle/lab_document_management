import { useEffect, useState } from 'react'
import { me } from '../services/auth'
import { clearToken } from '../services/token'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

export function DashboardPage() {
  const [state, setState] = useState({ loading: true, user: null, error: null })

  useEffect(() => {
    let mounted = true
    me()
      .then((data) => {
        if (!mounted) return
        setState({ loading: false, user: data.user, error: null })
      })
      .catch((err) => {
        if (!mounted) return
        setState({
          loading: false,
          user: null,
          error: err?.response?.data?.message || 'Failed to load session',
        })
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold text-[#352D36]">Dashboard</h1>
        {state.loading ? (
          <p className="mt-2 text-sm text-[#7D7980]">Loading…</p>
        ) : state.user ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#9C9F9F]/40 bg-white/50 p-4">
              <div className="text-xs font-medium text-[#909493]">Name</div>
              <div className="mt-1 text-sm font-semibold text-[#352D36]">{state.user.name}</div>
            </div>
            <div className="rounded-xl border border-[#9C9F9F]/40 bg-white/50 p-4">
              <div className="text-xs font-medium text-[#909493]">Role</div>
              <div className="mt-1 text-sm font-semibold text-[#352D36]">{state.user.role}</div>
            </div>
            <div className="rounded-xl border border-[#9C9F9F]/40 bg-white/50 p-4 sm:col-span-2">
              <div className="text-xs font-medium text-[#909493]">Email</div>
              <div className="mt-1 text-sm font-semibold text-[#352D36]">{state.user.email}</div>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <Alert variant="danger">{state.error}</Alert>
          </div>
        )}
      </Card>

      <Button
        variant="secondary"
        onClick={() => {
          clearToken()
          window.location.href = '/login'
        }}
      >
        Logout
      </Button>
    </div>
  )
}

