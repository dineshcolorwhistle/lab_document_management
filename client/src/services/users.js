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

// ——— Lab owners (ADMIN / SUPER_ADMIN) ———

/**
 * @param {{ page?: number; limit?: number }} params
 * @returns {Promise<{ data: Array<{ id: string; name: string; email: string; status: string; createdAt: string }>; pagination: { page: number; limit: number; total: number; totalPages: number } }>}
 */
export async function listLabOwners({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get('/users/lab-owners', { params: { page, limit } })
  return data
}

/**
 * @param {{ name: string; email: string }} payload
 * @returns {Promise<{ user: { id: string; name: string; email: string; role: string }; message: string }>}
 */
export async function createLabOwner({ name, email }) {
  const { data } = await api.post('/users/lab-owners', { name, email })
  return data
}

/**
 * @param {string} id
 * @param {{ name: string }} payload
 * @returns {Promise<{ user: { id: string; name: string; email: string; role: string; status: string; createdAt: string }; message: string }>}
 */
export async function updateLabOwner(id, { name }) {
  const { data } = await api.patch(`/users/lab-owners/${id}`, { name })
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function enableLabOwner(id) {
  const { data } = await api.patch(`/users/lab-owners/${id}/enable`)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteLabOwner(id) {
  const { data } = await api.delete(`/users/lab-owners/${id}`)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteLabOwnerPermanent(id) {
  const { data } = await api.delete(`/users/lab-owners/${id}/permanent`)
  return data
}

// ——— Lab technicians (list: ADMIN, LAB_OWNER; create/update/delete: ADMIN only) ———

/**
 * @param {{ page?: number; limit?: number }} params
 * @returns {Promise<{ data: Array<{ id: string; name: string; email: string; status: string; createdAt: string }>; pagination: { page: number; limit: number; total: number; totalPages: number } }>}
 */
export async function listLabTechnicians({ page = 1, limit = 10, labId } = {}) {
  const { data } = await api.get('/users/lab-technicians', { params: { page, limit, labId } })
  return data
}

/**
 * @param {{ name: string; email: string }} payload
 * @returns {Promise<{ user: { id: string; name: string; email: string; role: string }; message: string }>}
 */
export async function createLabTechnician({ name, email }) {
  const { data } = await api.post('/users/lab-technicians', { name, email })
  return data
}

/**
 * @param {string} id
 * @param {{ name: string }} payload
 * @returns {Promise<{ user: { id: string; name: string; email: string; role: string; status: string; createdAt: string }; message: string }>}
 */
export async function updateLabTechnician(id, { name }) {
  const { data } = await api.patch(`/users/lab-technicians/${id}`, { name })
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function enableLabTechnician(id) {
  const { data } = await api.patch(`/users/lab-technicians/${id}/enable`)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteLabTechnician(id) {
  const { data } = await api.delete(`/users/lab-technicians/${id}`)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteLabTechnicianPermanent(id) {
  const { data } = await api.delete(`/users/lab-technicians/${id}/permanent`)
  return data
}
