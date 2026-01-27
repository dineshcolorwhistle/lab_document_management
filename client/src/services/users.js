import { api } from './api'

/**
 * @param {{ page?: number; limit?: number }} params
 * @returns {Promise<{ data: Array<{ id: string; name: string; email: string; status: string; createdAt: string }>; pagination: { page: number; limit: number; total: number; totalPages: number } }>}
 */
export async function listAdmins({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get('/users', {
    params: { role: 'ADMIN', page, limit },
  })
  return data
}

/**
 * @param {{ name: string; email: string }} payload
 * @returns {Promise<{ user: { id: string; name: string; email: string; role: string }; message: string }>}
 */
export async function createAdmin({ name, email }) {
  const { data } = await api.post('/users/admins', { name, email })
  return data
}

/**
 * @param {string} id
 * @param {{ name: string }} payload
 * @returns {Promise<{ user: { id: string; name: string; email: string; role: string; status: string; createdAt: string }; message: string }>}
 */
export async function updateAdmin(id, { name }) {
  const { data } = await api.patch(`/users/admins/${id}`, { name })
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function enableAdmin(id) {
  const { data } = await api.patch(`/users/admins/${id}/enable`)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteAdmin(id) {
  const { data } = await api.delete(`/users/admins/${id}`)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteAdminPermanent(id) {
  const { data } = await api.delete(`/users/admins/${id}/permanent`)
  return data
}
