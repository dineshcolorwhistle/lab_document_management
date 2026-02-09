import { useState, useEffect } from 'react'
import { documentService } from '../services/document'
import { FileText, Filter, CheckCircle, XCircle, X, History, MessageSquare, Download } from 'lucide-react'

export default function AdminDocumentsPage() {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        labId: '',
        status: '',
        machineInstanceId: '',
        documentType: '',
    })
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState(null)
    const [versions, setVersions] = useState([])
    const [reviewAction, setReviewAction] = useState('') // 'APPROVED' or 'REJECTED'
    const [feedback, setFeedback] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchDocuments()
    }, [filters, pagination.page])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            }
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key]
            })

            const response = await documentService.getAllDocuments(params)
            setDocuments(response.data || [])
            setPagination(response.pagination || { page: 1, limit: 10, total: 0 })
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }


    const handleViewHistory = async (doc) => {
        try {
            const response = await documentService.getDocumentVersionHistory(doc._id)
            setVersions(response.data || [])
            setSelectedDocument(doc)
            setShowHistoryModal(true)
        } catch (error) {
            console.error('Error fetching version history:', error)
            alert('Failed to load version history')
        }
    }

    const handleReviewClick = (document, action) => {
        setSelectedDocument(document)
        setReviewAction(action)
        setFeedback('')
        setShowReviewModal(true)
    }

    const handleSubmitReview = async () => {
        if (!selectedDocument || !reviewAction) return

        try {
            setSubmitting(true)
            await documentService.reviewDocument(selectedDocument._id, {
                status: reviewAction,
                feedback: feedback.trim(),
            })

            // Update the document in the list
            setDocuments(documents.map(doc =>
                doc._id === selectedDocument._id
                    ? { ...doc, status: reviewAction, feedback: feedback.trim() }
                    : doc
            ))

            setShowReviewModal(false)
            setSelectedDocument(null)
            setFeedback('')
        } catch (error) {
            console.error('Error reviewing document:', error)
            alert(error.response?.data?.message || 'Failed to review document')
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200',
        }
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value })
        setPagination({ ...pagination, page: 1 })
    }

    const clearFilters = () => {
        setFilters({
            labId: '',
            status: '',
            machineInstanceId: '',
            documentType: '',
        })
        setPagination({ ...pagination, page: 1 })
    }

    const hasActiveFilters = Object.values(filters).some(v => v !== '')

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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
                <p className="text-muted-foreground mt-1">Review and manage all documents across all labs</p>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        All Documents ({pagination.total || 0})
                    </h2>
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
                            <h3 className="text-lg font-semibold text-foreground mb-2">No documents found</h3>
                            <p className="text-muted-foreground">
                                {hasActiveFilters ? 'Try adjusting your filters' : 'No documents have been uploaded yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Document</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Uploaded By</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Lab</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Machine</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Uploaded</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-start gap-2">
                                                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-foreground">
                                                            {doc.name}
                                                            <span className="text-xs text-muted-foreground ml-2 border border-border px-1.5 py-0.5 rounded-full">v{doc.version}</span>
                                                        </div>
                                                        {doc.applicableDate && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Applicable: {formatDate(doc.applicableDate)}
                                                            </div>
                                                        )}
                                                        {doc.comments && (
                                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                💬 {doc.comments}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <div className="font-medium text-foreground">{doc.uploadedBy?.name}</div>
                                                    <div className="text-sm text-muted-foreground">{doc.uploadedBy?.email}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-foreground">{doc.lab?.name}</td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <div className="font-medium text-foreground text-sm">
                                                        {doc.machineInstance?.nickname || doc.machineInstance?.model}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {doc.machineInstance?.serialNumber}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-foreground">
                                                {doc.documentTemplate?.documentType?.name || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-2">
                                                    {getStatusBadge(doc.status)}
                                                    {doc.feedback && (
                                                        <div className="text-xs text-muted-foreground flex items-start gap-1">
                                                            <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{doc.feedback}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-foreground">{formatDate(doc.createdAt)}</div>
                                                {doc.reviewedBy && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Reviewed by {doc.reviewedBy.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewHistory(doc)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Version History"
                                                    >
                                                        <History className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadDocument(doc)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="h-5 w-5" />
                                                    </button>
                                                    {doc.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleReviewClick(doc, 'APPROVED')}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReviewClick(doc, 'REJECTED')}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
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
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedDocument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}>
                    <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-2xl font-bold text-foreground">
                                {reviewAction === 'APPROVED' ? 'Approve Document' : 'Reject Document'}
                            </h2>
                            <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Document Info */}
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span className="font-semibold text-foreground">{selectedDocument.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Uploaded by {selectedDocument.uploadedBy?.name} • {selectedDocument.lab?.name}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Feedback {reviewAction === 'REJECTED' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    rows="4"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder={
                                        reviewAction === 'APPROVED'
                                            ? 'Add optional feedback for approval...'
                                            : 'Please provide a reason for rejection...'
                                    }
                                    required={reviewAction === 'REJECTED'}
                                />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {reviewAction === 'APPROVED'
                                        ? 'Optional: Add any comments or notes about this approval'
                                        : 'Required: Explain why this document is being rejected'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting || (reviewAction === 'REJECTED' && !feedback.trim())}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${reviewAction === 'APPROVED'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : reviewAction === 'APPROVED' ? 'Approve Document' : 'Reject Document'}
                            </button>
                        </div>
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
                                {selectedDocument && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Document: {selectedDocument.name}
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
