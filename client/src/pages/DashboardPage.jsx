import { useEffect, useState } from 'react'
import { me } from '../services/auth'
import { clearToken } from '../services/token'

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
      <div className="rounded-lg border bg-white p-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        {state.loading ? (
          <p className="mt-2 text-sm text-slate-600">Loading…</p>
        ) : state.user ? (
          <div className="mt-3 text-sm text-slate-700">
            <div>
              <span className="font-medium">Name:</span> {state.user.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {state.user.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> {state.user.role}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-red-600">{state.error}</p>
        )}
      </div>

      <button
        type="button"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        onClick={() => {
          clearToken()
          window.location.href = '/login'
        }}
      >
        Logout
      </button>
    </div>
  )
}

