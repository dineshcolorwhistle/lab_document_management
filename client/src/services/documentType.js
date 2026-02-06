import { api } from './api'

const documentTypeService = {
    getAll: async (params) => {
        const response = await api.get('/document-types', { params })
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/document-types/${id}`)
        return response.data
    },

    create: async (data) => {
        const response = await api.post('/document-types', data)
        return response.data
    },

    update: async (id, data) => {
        const response = await api.put(`/document-types/${id}`, data)
        return response.data
    },

    delete: async (id) => {
        const response = await api.delete(`/document-types/${id}`)
        return response.data
    },
}

export default documentTypeService
