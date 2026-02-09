import { api } from './api'

export const documentService = {
    // Get machine instances for the logged-in technician
    getMachineInstances: async () => {
        const response = await api.get('/documents/machine-instances')
        return response.data
    },

    // Get document templates for a specific machine instance
    getDocumentTemplates: async (machineInstanceId) => {
        const response = await api.get(`/documents/machine-instances/${machineInstanceId}/templates`)
        return response.data
    },

    // Upload a document
    uploadDocument: async (formData) => {
        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    // Get all documents uploaded by the technician
    getMyDocuments: async (params = {}) => {
        const response = await api.get('/documents/my-documents', { params })
        return response.data
    },

    // Get documents for Lab Owner
    getLabOwnerDocuments: async (params = {}) => {
        const response = await api.get('/documents/lab-owner/documents', { params })
        return response.data
    },

    // Get all documents for Admin
    getAllDocuments: async (params = {}) => {
        const response = await api.get('/documents/admin/documents', { params })
        return response.data
    },

    // Review a document (Admin only)
    reviewDocument: async (id, data) => {
        const response = await api.patch(`/documents/admin/documents/${id}/review`, data)
        return response.data
    },

    // Get version history of a document
    getDocumentVersionHistory: async (id) => {
        const response = await api.get(`/documents/${id}/versions`)
        return response.data
    },

    // Get a single document by ID
    getDocumentById: async (id) => {
        const response = await api.get(`/documents/${id}`)
        return response.data
    },

    // Download/View a document
    downloadDocument: async (id) => {
        const response = await api.get(`/documents/${id}/download`, {
            responseType: 'blob',
        })
        return response
    },

    // Upload a new version of a document
    uploadDocumentVersion: async (id, formData) => {
        const response = await api.post(`/documents/${id}/versions`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    // Delete a document
    deleteDocument: async (id) => {
        const response = await api.delete(`/documents/${id}`)
        return response.data
    },
}

