import { api } from './api'

export async function listMachineInstances({ page = 1, limit = 10, status, labId } = {}) {
    const { data } = await api.get('/machine-instances', { params: { page, limit, status, labId } })
    return data
}

export async function getMachineInstance(id) {
    const { data } = await api.get(`/machine-instances/${id}`)
    return data
}

export async function createMachineInstance(payload) {
    const { data } = await api.post('/machine-instances', payload)
    return data
}

export async function updateMachineInstance(id, payload) {
    const { data } = await api.patch(`/machine-instances/${id}`, payload)
    return data
}

export async function deleteMachineInstance(id) {
    const { data } = await api.delete(`/machine-instances/${id}`)
    return data
}
