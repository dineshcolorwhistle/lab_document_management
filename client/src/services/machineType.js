import { api } from './api'

export async function listMachineTypes({ page = 1, limit = 10, status } = {}) {
    const { data } = await api.get('/machine-types', { params: { page, limit, status } })
    return data
}

export async function getMachineType(id) {
    const { data } = await api.get(`/machine-types/${id}`)
    return data
}

export async function createMachineType(payload) {
    const { data } = await api.post('/machine-types', payload)
    return data
}

export async function updateMachineType(id, payload) {
    const { data } = await api.patch(`/machine-types/${id}`, payload)
    return data
}

export async function deleteMachineType(id) {
    const { data } = await api.delete(`/machine-types/${id}`)
    return data
}
