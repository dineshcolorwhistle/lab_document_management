import { api } from './api'

export async function listDocumentTemplates({ page = 1, limit = 10, status } = {}) {
    const { data } = await api.get('/document-templates', { params: { page, limit, status } })
    return data
}

export async function getDocumentTemplate(id) {
    const { data } = await api.get(`/document-templates/${id}`)
    return data
}

export async function createDocumentTemplate(payload) {
    const { data } = await api.post('/document-templates', payload)
    return data
}

export async function updateDocumentTemplate(id, payload) {
    const { data } = await api.patch(`/document-templates/${id}`, payload)
    return data
}

export async function deleteDocumentTemplate(id) {
    const { data } = await api.delete(`/document-templates/${id}`)
    return data
}
