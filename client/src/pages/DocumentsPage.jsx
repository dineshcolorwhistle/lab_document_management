import { useState, useEffect } from 'react'
import { documentService } from '../services/document'
import { FileText, Upload, Trash2, X, Check, AlertCircle, Download, MessageSquare, FileUp, History } from 'lucide-react'

export default function DocumentsPage() {
    const [machineInstances, setMachineInstances] = useState([])
    const [documentTemplates, setDocumentTemplates] = useState([])
    const [documents, setDocuments] = useState([])
    const [selectedMachineInstance, setSelectedMachineInstance] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [documentName, setDocumentName] = useState('')
    const [applicableDate, setApplicableDate] = useState('')
    const [comments, setComments] = useState('')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showVersionModal, setShowVersionModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [selectedDocumentForVersion, setSelectedDocumentForVersion] = useState(null)
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

    // Fetch machine instances on mount
    useEffect(() => {
        fetchMachineInstances()
        fetchDocuments()
    }, [])

    const fetchMachineInstances = async () => {
        try {
            const response = await documentService.getMachineInstances()
            setMachineInstances(response.data || [])
        } catch (err) {
            console.error('Error fetching machine instances:', err)
            setError('Failed to load machine instances')
        }
    }

    const fetchDocuments = async (page = 1) => {
        try {
            setLoading(true)
            const response = await documentService.getMyDocuments({ page, limit: pagination.limit })
            setDocuments(response.data || [])
            setPagination(response.pagination || { page: 1, limit: 10, total: 0 })
        } catch (err) {
            console.error('Error fetching documents:', err)
            setError('Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    const handleMachineInstanceChange = async (e) => {
        const instanceId = e.target.value
        setSelectedMachineInstance(instanceId)
        setSelectedTemplate('')
        setDocumentTemplates([])

        if (instanceId) {
            try {
                const response = await documentService.getDocumentTemplates(instanceId)
                setDocumentTemplates(response.data || [])
            } catch (err) {
                console.error('Error fetching templates:', err)
                setError('Failed to load document templates')
            }
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg']
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Only PDF, DOCX, and JPG files are allowed.')
                e.target.value = ''
                return
            }

            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB')
                e.target.value = ''
                return
            }

            setSelectedFile(file)
            setError('')
        }
    }

    const handleUploadDocument = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!selectedMachineInstance || !selectedTemplate || !selectedFile || !documentName) {
            setError('Please fill in all required fields')
            return
        }

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('machineInstanceId', selectedMachineInstance)
            formData.append('documentTemplateId', selectedTemplate)
            formData.append('name', documentName)
            if (applicableDate) {
                formData.append('applicableDate', applicableDate)
            }
            if (comments) {
                formData.append('comments', comments)
            }

            await documentService.uploadDocument(formData)
            setSuccess('Document uploaded successfully!')

            // Reset form
            setSelectedMachineInstance('')
            setSelectedTemplate('')
            setSelectedFile(null)
            setDocumentName('')
            setApplicableDate('')
            setComments('')
            setDocumentTemplates([])
            setShowUploadModal(false)

            // Refresh documents list
            fetchDocuments()
        } catch (err) {
            console.error('Error uploading document:', err)
            setError(err.response?.data?.message || 'Failed to upload document')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return
        }

        try {
            setLoading(true)
            await documentService.deleteDocument(id)
            setSuccess('Document deleted successfully!')
            fetchDocuments()
        } catch (err) {
            console.error('Error deleting document:', err)
            setError(err.response?.data?.message || 'Failed to delete document')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadDocument = async (doc) => {
        try {
            const response = await documentService.downloadDocument(doc._id)

            // Get content type from header
            const contentType = response.headers['content-type']

            // Create blob with correct type
            const blob = new Blob([response.data], { type: contentType })
            const url = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = url

            // Get filename from header or fallback to document name
            const contentDisposition = response.headers['content-disposition']
            let fileName = doc.name

            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
                if (fileNameMatch && fileNameMatch.length === 2)
                    fileName = fileNameMatch[1]
            }

            // Ensure filename has extension if missing
            if (!fileName.includes('.') && contentType) {
                const extension = contentType.split('/')[1]
                if (extension) fileName += `.${extension}`
            }
            // Use original name from metadata if available and current name has no extension
            else if (!fileName.includes('.') && doc.metadata?.originalName) {
                fileName = doc.metadata.originalName
            }

            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading document:', error)
            alert('Failed to download document')
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleOpenVersionModal = (doc) => {
        setSelectedDocumentForVersion(doc)
        setDocumentName(doc.name)
        setApplicableDate(doc.applicableDate ? new Date(doc.applicableDate).toISOString().split('T')[0] : '')
        setComments('')
        setSelectedFile(null)
        setError('')
        setSuccess('')
        setShowVersionModal(true)
    }

    const handleUploadVersion = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!selectedFile || !documentName) {
            setError('Please select a file and document name')
            return
        }

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('name', documentName)
            if (applicableDate) {
                formData.append('applicableDate', applicableDate)
            }
            if (comments) {
                formData.append('comments', comments)
            }

            await documentService.uploadDocumentVersion(selectedDocumentForVersion._id, formData)
            setSuccess('New version uploaded successfully!')

            // Reset form
            setSelectedDocumentForVersion(null)
            setSelectedFile(null)
            setDocumentName('')
            setApplicableDate('')
            setComments('')
            setShowVersionModal(false)

            // Refresh documents list
            fetchDocuments()
        } catch (err) {
            console.error('Error uploading version:', err)
            setError(err.response?.data?.message || 'Failed to upload version')
        } finally {
            setLoading(false)
        }
    }

    const handleViewHistory = async (doc) => {
        try {
            // setLoading(true) // Don't block UI with global loading, maybe local loading state?
            const response = await documentService.getDocumentVersionHistory(doc._id)
            setVersions(response.data || [])
            setShowHistoryModal(true)
            setSelectedDocumentForVersion(doc) // Reuse this for title
        } catch (err) {
            console.error('Error fetching version history:', err)
            setError('Failed to load version history')
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200',
        }
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
                    <p className="text-muted-foreground mt-1">Upload and manage your machine documents</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    <Upload className="h-4 w-4" />
                    Upload Document
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    <Check className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{success}</span>
                    <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Documents List */}
            <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">My Documents</h2>
                </div>
                <div className="p-6">
                    {loading && documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-muted-foreground">Loading documents...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No documents yet</h3>
                            <p className="text-muted-foreground">Upload your first document to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Document Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Machine Instance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Template</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Lab</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">File Size</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Uploaded</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium text-foreground">
                                                            {doc.name}
                                                            <span className="text-xs text-muted-foreground ml-2 border border-border px-1.5 py-0.5 rounded-full">v{doc.version}</span>
                                                        </div>
                                                        {doc.status === 'REJECTED' && doc.feedback && (
                                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                                                <div className="text-xs font-semibold text-red-800 mb-1">
                                                                    Rejection Feedback:
                                                                </div>
                                                                <div className="text-sm text-red-700">{doc.feedback}</div>
                                                                {doc.reviewedBy && (
                                                                    <div className="text-xs text-red-600 mt-1">
                                                                        Reviewed by {doc.reviewedBy.name} on {formatDate(doc.reviewedAt)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {doc.status === 'APPROVED' && doc.feedback && (
                                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                                <div className="text-xs font-semibold text-green-800 mb-1">
                                                                    Approval Note:
                                                                </div>
                                                                <div className="text-sm text-green-700">{doc.feedback}</div>
                                                                {doc.reviewedBy && (
                                                                    <div className="text-xs text-green-600 mt-1">
                                                                        Reviewed by {doc.reviewedBy.name} on {formatDate(doc.reviewedAt)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium text-foreground">{doc.machineInstance?.nickname || doc.machineInstance?.model}</div>
                                                    <div className="text-sm text-muted-foreground">{doc.machineInstance?.serialNumber}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-foreground">{doc.documentTemplate?.name}</td>
                                            <td className="py-3 px-4 text-foreground">{doc.lab?.name}</td>
                                            <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                                            <td className="py-3 px-4 text-foreground">{formatFileSize(doc.metadata?.size || 0)}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{formatDate(doc.createdAt)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownloadDocument(doc)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewHistory(doc)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Version History"
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenVersionModal(doc)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Upload New Version"
                                                    >
                                                        <FileUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                            <button
                                onClick={() => fetchDocuments(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => fetchDocuments(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
                    <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-2xl font-bold text-foreground">Upload Document</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadDocument}>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Document Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        placeholder="Enter document name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Select Machine Instance <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={selectedMachineInstance}
                                        onChange={handleMachineInstanceChange}
                                        required
                                    >
                                        <option value="">-- Select Machine Instance --</option>
                                        {machineInstances.map((instance) => (
                                            <option key={instance._id} value={instance._id}>
                                                {instance.nickname || instance.model} - {instance.serialNumber} ({instance.lab?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedMachineInstance && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Select Document Template <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            value={selectedTemplate}
                                            onChange={(e) => setSelectedTemplate(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Select Document Template --</option>
                                            {documentTemplates.map((template) => (
                                                <option key={template._id} value={template._id}>
                                                    {template.name} - {template.documentType?.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {selectedTemplate && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Upload File <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={handleFileChange}
                                            accept=".pdf,.docx,.jpg,.jpeg"
                                            required
                                        />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Allowed formats: PDF, DOCX, JPG (Max size: 10MB)
                                        </p>
                                        {selectedFile && (
                                            <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <Check className="h-5 w-5 text-green-600" />
                                                <span className="text-sm text-green-800">
                                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedTemplate && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Applicable Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                value={applicableDate}
                                                onChange={(e) => setApplicableDate(e.target.value)}
                                                required
                                            />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Required: Select when this document becomes applicable
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Comments
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                                rows="3"
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                                placeholder="Add any additional comments or notes..."
                                            />
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Optional: Add any relevant comments about this document
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={loading}
                                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedMachineInstance || !selectedTemplate || !selectedFile || !documentName}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Version Upload Modal */}
            {showVersionModal && selectedDocumentForVersion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowVersionModal(false)}>
                    <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Upload New Version</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Updating: {selectedDocumentForVersion.name} (Version {selectedDocumentForVersion.version})
                                </p>
                            </div>
                            <button onClick={() => setShowVersionModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadVersion}>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Document Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        placeholder="Enter document name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Upload File <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={handleFileChange}
                                        accept=".pdf,.docx,.jpg,.jpeg"
                                        required
                                    />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Allowed formats: PDF, DOCX, JPG (Max size: 10MB)
                                    </p>
                                    {selectedFile && (
                                        <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <Check className="h-5 w-5 text-green-600" />
                                            <span className="text-sm text-green-800">
                                                {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Applicable Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={applicableDate}
                                        onChange={(e) => setApplicableDate(e.target.value)}
                                        required
                                    />
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Required: Select when this new version becomes applicable
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Comments
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        rows="3"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Add any comments about this version..."
                                    />
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Optional: Add any relevant comments about this version
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                                <button
                                    type="button"
                                    onClick={() => setShowVersionModal(false)}
                                    disabled={loading}
                                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedFile || !documentName}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? 'Uploading Version...' : 'Upload New Version'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Version History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
                    <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Version History</h2>
                                {selectedDocumentForVersion && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Document: {selectedDocumentForVersion.name}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="relative border-l-2 border-muted ml-3 space-y-8">
                                {versions.map((version, index) => (
                                    <div key={version._id} className="relative pl-8">
                                        {/* Timeline dot */}
                                        <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 ${index === 0 ? 'bg-blue-600 border-blue-600' : 'bg-card border-muted-foreground'}`}></div>

                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-muted/30 p-4 rounded-lg">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-foreground">Version {version.version}</span>
                                                    {version.isLatestVersion && (
                                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">Latest</span>
                                                    )}
                                                    {getStatusBadge(version.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Uploaded by {version.uploadedBy?.name} on {formatDate(version.createdAt)}
                                                </p>
                                                {version.comments && (
                                                    <div className="text-sm text-foreground mb-2">
                                                        <span className="font-semibold">Comments:</span> {version.comments}
                                                    </div>
                                                )}
                                                {version.feedback && (
                                                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                        <span className="font-semibold">Feedback:</span> {version.feedback}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDownloadDocument(version)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {versions.length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">No version history found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
