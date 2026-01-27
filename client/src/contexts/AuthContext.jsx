import { createContext, useContext, useEffect, useState } from 'react'
import { me } from '../services/auth'
import { getToken, clearToken } from '../services/token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const data = await me()
      setUser(data.user)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load session')
      setUser(null)
      clearToken()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setError(null)
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setError(null)
  }

  const hasRole = (allowedRoles) => {
    if (!user?.role) return false
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role)
    }
    return user.role === allowedRoles
  }

  const hasAnyRole = (...roles) => {
    return roles.some((role) => hasRole(role))
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser: fetchUser,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
