import { useState, useEffect } from 'react'
import { documentService } from '../services/document'
import { FileText, Filter, Download, Eye, History } from 'lucide-react'

export default function LabOwnerDocumentsPage() {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        labId: '',
        status: '',
        machineInstanceId: '',
    })
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

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

            const response = await documentService.getLabOwnerDocuments(params)
            setDocuments(response.data || [])
            setPagination(response.pagination || { page: 1, limit: 10, total: 0 })
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
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
        setPagination({ ...pagination, page: 1 }) // Reset to first page
    }

    const clearFilters = () => {
        setFilters({
            labId: '',
            status: '',
            machineInstanceId: '',
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
                <h1 className="text-3xl font-bold text-foreground">Lab Documents</h1>
                <p className="text-muted-foreground mt-1">View and manage documents from your labs</p>
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
                        Documents ({pagination.total || 0})
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
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Document Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Uploaded By</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Lab</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Machine Instance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Document Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Last Updated</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr key={doc._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium text-foreground">{doc.name}</div>
                                                        {doc.comments && (
                                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                                {doc.comments}
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
                                                    <div className="font-medium text-foreground">
                                                        {doc.machineInstance?.nickname || doc.machineInstance?.model}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {doc.machineInstance?.serialNumber}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-foreground">
                                                {doc.documentTemplate?.documentType?.name || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4">{getStatusBadge(doc.status)}</td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <div className="text-sm text-foreground">{formatDate(doc.updatedAt)}</div>
                                                    {doc.reviewedBy && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            by {doc.reviewedBy.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleDownloadDocument(doc)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
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
        </div>
    )
}
