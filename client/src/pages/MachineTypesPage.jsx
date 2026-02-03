import { useEffect, useState } from 'react'
import {
    listMachineTypes,
    createMachineType,
    updateMachineType,
    deleteMachineType,
} from '../services/machineType'
import { listDocumentTemplates } from '../services/documentTemplate'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'
import { Plus, Pencil, Trash2, Settings2, Check } from 'lucide-react'
import { cn } from '../utils/cn'

export function MachineTypesPage() {
    const [items, setItems] = useState([])
    const [docTemplates, setDocTemplates] = useState([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [form, setForm] = useState({
        name: '',
        category: '',
        defaultCalibrationFrequency: '',
        defaultMaintenanceFrequency: '',
        status: 'ACTIVE',
        notes: '',
        requiredDocumentTemplates: [],
    })

    const [submitting, setSubmitting] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const fetchData = async (page = 1) => {
        setLoading(true)
        try {
            const [res, docsRes] = await Promise.all([
                listMachineTypes({ page }),
                listDocumentTemplates({ limit: 100, status: 'ACTIVE' })
            ])
            setItems(res.data)
            setPagination(res.pagination)
            setDocTemplates(docsRes.data)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch machine types')
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
                category: item.category || '',
                defaultCalibrationFrequency: item.defaultCalibrationFrequency || '',
                defaultMaintenanceFrequency: item.defaultMaintenanceFrequency || '',
                status: item.status || 'ACTIVE',
                notes: item.notes || '',
                requiredDocumentTemplates: (item.requiredDocumentTemplates || []).map(dt => typeof dt === 'string' ? dt : dt.id || dt._id),
            })
        } else {
            setEditingItem(null)
            setForm({
                name: '',
                category: '',
                defaultCalibrationFrequency: '',
                defaultMaintenanceFrequency: '',
                status: 'ACTIVE',
                notes: '',
                requiredDocumentTemplates: [],
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (editingItem) {
                await updateMachineType(editingItem.id, form)
            } else {
                await createMachineType(form)
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
        try {
            await deleteMachineType(deletingId)
            setDeleteModalOpen(false)
            fetchData(pagination.page)
        } catch (err) {
            setError('Failed to delete machine type')
        }
    }

    const toggleDocTemplate = (id) => {
        setForm(prev => ({
            ...prev,
            requiredDocumentTemplates: prev.requiredDocumentTemplates.includes(id)
                ? prev.requiredDocumentTemplates.filter(t => t !== id)
                : [...prev.requiredDocumentTemplates, id]
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Machine Types</h2>
                    <p className="text-muted-foreground text-sm mt-1">Configure equipment categories and default maintenance cycles.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Machine Type
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Machine Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Required Docs</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{item.notes}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {item.category || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex -space-x-2">
                                        {(item.requiredDocumentTemplates || []).map((dt, i) => (
                                            <div key={i} className="h-7 w-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] text-blue-500 font-bold" title={dt.name}>
                                                {dt.name?.[0]?.toUpperCase() || 'D'}
                                            </div>
                                        ))}
                                        {(item.requiredDocumentTemplates || []).length === 0 && <span className="text-xs text-muted-foreground italic">None</span>}
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
                                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => { setDeletingId(item.id); setDeleteModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Machine Type' : 'Add Machine Type'} className="max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Machine Type Name</label>
                                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Microscope, Centrifuge" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Category</label>
                                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Diagnostic, Research" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Calibration Frequency</label>
                                <Input value={form.defaultCalibrationFrequency} onChange={e => setForm({ ...form, defaultCalibrationFrequency: e.target.value })} placeholder="e.g. 6 Months" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Maintenance Frequency</label>
                                <Input value={form.defaultMaintenanceFrequency} onChange={e => setForm({ ...form, defaultMaintenanceFrequency: e.target.value })} placeholder="e.g. 3 Months" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Status</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1 block">Notes</label>
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-2 block">Required Documents</label>
                                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-3 border border-border rounded-lg bg-muted/20">
                                    {docTemplates.map(doc => (
                                        <label key={doc.id} className={cn(
                                            "flex items-center gap-2 p-2 rounded-md border transition-all cursor-pointer",
                                            form.requiredDocumentTemplates.includes(doc.id) ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400" : "bg-card border-border hover:border-blue-500/30"
                                        )}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={form.requiredDocumentTemplates.includes(doc.id)}
                                                onChange={() => toggleDocTemplate(doc.id)}
                                            />
                                            <div className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center",
                                                form.requiredDocumentTemplates.includes(doc.id) ? "bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "border-muted-foreground/30"
                                            )}>
                                                {form.requiredDocumentTemplates.includes(doc.id) && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold truncate">{doc.name}</div>
                                                <div className="text-[10px] opacity-70 truncate">{doc.frequency}</div>
                                            </div>
                                        </label>
                                    ))}
                                    {docTemplates.length === 0 && <div className="col-span-2 text-center text-xs text-muted-foreground py-4">No active document templates found.</div>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Machine Type'}</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleteModalOpen && (
                <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Machine Type">
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this machine type? Existing machines of this type will not be deleted but will lose their categorical link.</p>
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
