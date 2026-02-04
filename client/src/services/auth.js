import { api } from './api'

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function me() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function forgotPassword({ email }) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword({ token, password }) {
  const { data } = await api.post('/auth/reset-password', { token, password })
  return data
}

export async function updateProfile(data) {
  const { data: response } = await api.patch('/auth/me/profile', data)
  return response
}

export async function updatePassword({ currentPassword, newPassword }) {
  const { data } = await api.patch('/auth/me/password', { currentPassword, newPassword })
  return data
}

