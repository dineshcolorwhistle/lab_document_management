import { api } from './api'

/**
 * @param {{ page?: number; limit?: number }} params
 * @returns {Promise<{ data: Array<Lab>; pagination: { page: number; limit: number; total: number; totalPages: number } }>}
 */
export async function listLabs({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get('/labs', { params: { page, limit } })
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ lab: Lab }>}
 */
export async function getLab(id) {
  const { data } = await api.get(`/labs/${id}`)
  return data
}

/**
 * @param {{ name: string; description?: string; address?: string; contact?: string; labOwnerIds: string[]; labTechnicianIds: string[] }} payload
 * @returns {Promise<{ lab: Lab; message: string }>}
 */
export async function createLab(payload) {
  const { data } = await api.post('/labs', payload)
  return data
}

/**
 * @param {string} id
 * @param {{ name: string; description?: string; address?: string; contact?: string; labOwnerIds: string[]; labTechnicianIds: string[] }} payload
 * @returns {Promise<{ lab: Lab; message: string }>}
 */
export async function updateLab(id, payload) {
  const { data } = await api.patch(`/labs/${id}`, payload)
  return data
}

/**
 * @param {string} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteLab(id) {
  const { data } = await api.delete(`/labs/${id}`)
  return data
}
