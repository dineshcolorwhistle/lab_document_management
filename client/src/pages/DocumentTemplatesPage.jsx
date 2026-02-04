import { useEffect, useState } from 'react'
import {
    listDocumentTemplates,
    createDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
} from '../services/documentTemplate'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, FileStack, Eye } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../contexts/AuthContext'
import { getPermissionForMenu, PERMISSIONS } from '../config/menu'

const FREQUENCIES = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
    { value: 'ONE_TIME', label: 'One-Time' },
]

const FILE_TYPES = ['pdf', 'docx', 'jpg']

export function DocumentTemplatesPage() {
    const { user } = useAuth()
    const canEdit = getPermissionForMenu('document-template', user?.role) === PERMISSIONS.CRUD

    const [templates, setTemplates] = useState([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [form, setForm] = useState({
        name: '',
        description: '',
        frequency: 'MONTHLY',
        allowedFileTypes: ['pdf'],
        nablClauseMapping: '',
        helpContentType: 'NONE',
        helpContentValue: '',
        status: 'ACTIVE',
    })

    const [submitting, setSubmitting] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const fetchTemplates = async (page = 1) => {
        setLoading(true)
        try {
            const res = await listDocumentTemplates({ page })
            setTemplates(res.data)
            setPagination(res.pagination)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch templates')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingTemplate(template)
            setForm({
                name: template.name,
                description: template.description || '',
                frequency: template.frequency,
                allowedFileTypes: template.allowedFileTypes || ['pdf'],
                nablClauseMapping: template.nablClauseMapping || '',
                helpContentType: template.helpContentType || 'NONE',
                helpContentValue: template.helpContentValue || '',
                status: template.status || 'ACTIVE',
            })
        } else {
            setEditingTemplate(null)
            setForm({
                name: '',
                description: '',
                frequency: 'MONTHLY',
                allowedFileTypes: ['pdf'],
                nablClauseMapping: '',
                helpContentType: 'NONE',
                helpContentValue: '',
                status: 'ACTIVE',
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingTemplate) {
                await updateDocumentTemplate(editingTemplate.id, form)
            } else {
                await createDocumentTemplate(form)
            }
            setModalOpen(false)
            fetchTemplates(pagination.page)
        } catch (err) {
            setError(err?.response?.data?.message || 'Operation failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            await deleteDocumentTemplate(deletingId)
            setDeleteModalOpen(false)
            fetchTemplates(pagination.page)
        } catch (err) {
            setError('Failed to delete template')
        }
    }

    const toggleFileType = (type) => {
        setForm(prev => ({
            ...prev,
            allowedFileTypes: prev.allowedFileTypes.includes(type)
                ? prev.allowedFileTypes.filter(t => t !== type)
                : [...prev.allowedFileTypes, type]
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Document Templates</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage standard document requirements and mappings.</p>
                </div>
                {canEdit && (
                    <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Template
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Frequency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {templates.map(item => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {FREQUENCIES.find(f => f.value === item.frequency)?.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase",
                                        item.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors" title={canEdit ? "Edit" : "View Details"}>
                                            {canEdit ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                        {canEdit && (
                                            <button onClick={() => { setDeletingId(item.id); setDeleteModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-sm text-muted-foreground">
                                    No templates found. Create your first document template to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTemplate ? (canEdit ? 'Edit Template' : 'Template Details') : 'Add New Template'} className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1 block">Document Name</label>
                                <Input disabled={!canEdit} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Enter document name" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea
                                    disabled={!canEdit}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Usage instructions or details"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Frequency</label>
                                <select
                                    disabled={!canEdit}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                    value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                                >
                                    {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Status</label>
                                <select
                                    disabled={!canEdit}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-2 block">Allowed File Types</label>
                                <div className="flex gap-4">
                                    {FILE_TYPES.map(type => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.allowedFileTypes.includes(type)}
                                                onChange={() => canEdit && toggleFileType(type)}
                                                disabled={!canEdit}
                                                className="rounded border-border disabled:opacity-50"
                                            />
                                            <span className="text-sm uppercase">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">NABL Clause Mapping</label>
                                <Input disabled={!canEdit} value={form.nablClauseMapping} onChange={e => setForm({ ...form, nablClauseMapping: e.target.value })} placeholder="e.g. 7.1.1, 8.5" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Help Content Type</label>
                                <select
                                    disabled={!canEdit}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                    value={form.helpContentType} onChange={e => setForm({ ...form, helpContentType: e.target.value })}
                                >
                                    <option value="NONE">None</option>
                                    <option value="TEXT">Text</option>
                                    <option value="VIDEO">Video Link</option>
                                    <option value="PDF">PDF Link</option>
                                </select>
                            </div>
                            {form.helpContentType !== 'NONE' && (
                                <div className="col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Help Content {form.helpContentType === 'TEXT' ? 'Body' : 'Link'}</label>
                                    {form.helpContentType === 'TEXT' ? (
                                        <textarea
                                            disabled={!canEdit}
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                            value={form.helpContentValue} onChange={e => setForm({ ...form, helpContentValue: e.target.value })}
                                        />
                                    ) : (
                                        <Input disabled={!canEdit} value={form.helpContentValue} onChange={e => setForm({ ...form, helpContentValue: e.target.value })} placeholder="https://..." />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{canEdit ? 'Cancel' : 'Close'}</Button>
                            {canEdit && <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Template'}</Button>}
                        </div>
                    </form>
                </Modal>
            )}

            {deleteModalOpen && (
                <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Template">
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this document template? Labs using this template might be affected.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete Permanently</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
