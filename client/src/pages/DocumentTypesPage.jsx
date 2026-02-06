import { useEffect, useState } from 'react'
import documentTypeService from '../services/documentType'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'
import { Plus, Pencil, Trash2, Eye, Check, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../contexts/AuthContext'
import { getPermissionForMenu, PERMISSIONS } from '../config/menu'

export function DocumentTypesPage() {
    const { user } = useAuth()
    const canEdit = getPermissionForMenu('document-type', user?.role) === PERMISSIONS.CRUD

    const [items, setItems] = useState([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        is_equipment_related: false,
        is_personnel_related: false,
        is_system_related: false,
        status: 'ACTIVE',
    })

    const [submitting, setSubmitting] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const fetchData = async (page = 1) => {
        setLoading(true)
        try {
            const res = await documentTypeService.getAll({ page })
            setItems(res.data)
            setPagination(res.pagination)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch document types')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setForm({
                name: item.name,
                code: item.code,
                description: item.description || '',
                is_equipment_related: item.is_equipment_related || false,
                is_personnel_related: item.is_personnel_related || false,
                is_system_related: item.is_system_related || false,
                status: item.status || 'ACTIVE',
            })
        } else {
            setEditingItem(null)
            setForm({
                name: '',
                code: '',
                description: '',
                is_equipment_related: false,
                is_personnel_related: false,
                is_system_related: false,
                status: 'ACTIVE',
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            if (editingItem) {
                await documentTypeService.update(editingItem.id, form)
            } else {
                await documentTypeService.create(form)
            }
            setModalOpen(false)
            fetchData(pagination.page)
        } catch (err) {
            setError(err?.response?.data?.message || 'Operation failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        setError(null)
        try {
            await documentTypeService.delete(deletingId)
            setDeleteModalOpen(false)
            fetchData(pagination.page)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to delete document type')
            setDeleteModalOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Document Types</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage categories for document templates.</p>
                </div>
                {canEdit && (
                    <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Document Type
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Relations</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-muted-foreground">Loading...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-muted-foreground">No document types found.</td>
                            </tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    <code className="bg-muted px-1.5 py-0.5 rounded text-primary text-xs font-mono">{item.code}</code>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        {item.is_equipment_related && (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">Equipment</span>
                                        )}
                                        {item.is_personnel_related && (
                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase">Personnel</span>
                                        )}
                                        {item.is_system_related && (
                                            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase">System</span>
                                        )}
                                        {!item.is_equipment_related && !item.is_personnel_related && !item.is_system_related && (
                                            <span className="text-[10px] text-muted-foreground italic">None</span>
                                        )}
                                    </div>
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
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? (canEdit ? 'Edit Document Type' : 'Document Type Details') : 'Add Document Type'} className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Name</label>
                                <Input disabled={!canEdit} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Calibration Report" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Code</label>
                                <Input disabled={!canEdit} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. CAL_REP" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea
                                    disabled={!canEdit}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-3">
                                <label className="text-sm font-medium block">Related To</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <label className={cn(
                                        "flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
                                        form.is_equipment_related ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : "bg-muted/30 border-border text-muted-foreground"
                                    )}>
                                        <input type="checkbox" className="hidden" checked={form.is_equipment_related} onChange={() => canEdit && setForm({ ...form, is_equipment_related: !form.is_equipment_related })} />
                                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center", form.is_equipment_related ? "bg-blue-500 border-blue-500" : "border-input bg-background")}>
                                            {form.is_equipment_related && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className="text-xs font-semibold">Equipment</span>
                                    </label>

                                    <label className={cn(
                                        "flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
                                        form.is_personnel_related ? "bg-purple-500/10 border-purple-500/30 text-purple-500" : "bg-muted/30 border-border text-muted-foreground"
                                    )}>
                                        <input type="checkbox" className="hidden" checked={form.is_personnel_related} onChange={() => canEdit && setForm({ ...form, is_personnel_related: !form.is_personnel_related })} />
                                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center", form.is_personnel_related ? "bg-purple-500 border-purple-500" : "border-input bg-background")}>
                                            {form.is_personnel_related && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className="text-xs font-semibold">Personnel</span>
                                    </label>

                                    <label className={cn(
                                        "flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
                                        form.is_system_related ? "bg-orange-500/10 border-orange-500/30 text-orange-500" : "bg-muted/30 border-border text-muted-foreground"
                                    )}>
                                        <input type="checkbox" className="hidden" checked={form.is_system_related} onChange={() => canEdit && setForm({ ...form, is_system_related: !form.is_system_related })} />
                                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center", form.is_system_related ? "bg-orange-500 border-orange-500" : "border-input bg-background")}>
                                            {form.is_system_related && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <span className="text-xs font-semibold">System</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Status</label>
                                <select
                                    disabled={!canEdit}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="ACTIVE" className="bg-background text-foreground">Active</option>
                                    <option value="INACTIVE" className="bg-background text-foreground">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{canEdit ? 'Cancel' : 'Close'}</Button>
                            {canEdit && <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Document Type'}</Button>}
                        </div>
                    </form>
                </Modal>
            )}

            {deleteModalOpen && (
                <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Document Type">
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this document type? This action cannot be undone and will only succeed if the type is not associated with any templates.</p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
