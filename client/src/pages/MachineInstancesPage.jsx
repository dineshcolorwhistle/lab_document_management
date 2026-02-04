import { useEffect, useState } from 'react'
import {
    listMachineInstances,
    createMachineInstance,
    updateMachineInstance,
    deleteMachineInstance,
} from '../services/machineInstance'
import { listMachineTypes } from '../services/machineType'
import { listLabs, getMyLabs } from '../services/labs'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'
import { Plus, Pencil, Trash2, Cpu, Calendar, Tag, Info, Building2 } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '../contexts/AuthContext'
import { useLab } from '../contexts/LabContext'
import { ROLES } from '../constants/roles'
import { getPermissionForMenu, PERMISSIONS } from '../config/menu'
import { Eye } from 'lucide-react'

export function MachineInstancesPage() {
    const { user } = useAuth()
    const { selectedLab } = useLab()
    const canEdit = getPermissionForMenu('machine-instance', user?.role) === PERMISSIONS.CRUD

    const [items, setItems] = useState([])
    const [machineTypes, setMachineTypes] = useState([])
    const [typeDetailsModalOpen, setTypeDetailsModalOpen] = useState(false)
    const [selectedTypeDetails, setSelectedTypeDetails] = useState(null)
    const [allLabs, setAllLabs] = useState([])
    const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN
    const isLabOwner = user?.role === ROLES.LAB_OWNER

    const initialForm = {
        machineType: '',
        nickname: '',
        model: '',
        serialNumber: '',
        calibrationDueDate: '',
        maintenanceDueDate: '',
        status: 'Active',
        notes: '',
        lab: '',
    }

    const [form, setForm] = useState(initialForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const fetchData = async (page = 1) => {
        setLoading(true)
        setError(null)
        try {
            const labId = selectedLab?.id
            const res = await listMachineInstances({ page, labId })
            setItems(res.data)
            setPagination(res.pagination)
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch machine instances')
        } finally {
            setLoading(false)
        }
    }

    const fetchDropdownData = async () => {
        try {
            const [mtRes, labsRes] = await Promise.all([
                listMachineTypes({ limit: 100, status: 'ACTIVE' }),
                isAdmin ? listLabs({ limit: 100 }) : getMyLabs()
            ])
            setMachineTypes(mtRes.data)
            setAllLabs(labsRes.data || [])
        } catch (err) {
            console.error('Failed to fetch dropdown data', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedLab?.id])

    useEffect(() => {
        fetchDropdownData()
    }, [])

    const handleOpenModal = (item = null) => {
        setError(null)
        if (item) {
            setEditingItem(item)
            setForm({
                machineType: item.machineType?.id || item.machineType?._id || item.machineType || '',
                nickname: item.nickname || '',
                model: item.model || '',
                serialNumber: item.serialNumber || '',
                calibrationDueDate: item.calibrationDueDate ? new Date(item.calibrationDueDate).toISOString().split('T')[0] : '',
                maintenanceDueDate: item.maintenanceDueDate ? new Date(item.maintenanceDueDate).toISOString().split('T')[0] : '',
                status: item.status || 'Active',
                notes: item.notes || '',
                lab: item.lab?.id || item.lab?._id || item.lab || '',
            })
        } else {
            setEditingItem(null)
            setForm({
                ...initialForm,
                // Use selected lab from context if available (standard for lab roles)
                lab: selectedLab ? selectedLab.id : (allLabs.length === 1 ? allLabs[0].id : ''),
            })
        }
        setModalOpen(true)
    }

    const handleViewTypeDetails = async (typeId) => {
        if (!typeId) return
        try {
            const res = await listMachineTypes() // Or add a getMachineType service
            const type = res.data.find(t => t.id === typeId)
            setSelectedTypeDetails(type)
            setTypeDetailsModalOpen(true)
        } catch (err) {
            console.error('Failed to fetch type details', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        // Ensure lab is set from context if missing (e.g., for lab owner)
        if (!form.lab && selectedLab) {
            form.lab = selectedLab.id
        }

        try {
            if (editingItem) {
                await updateMachineInstance(editingItem.id, form)
            } else {
                await createMachineInstance(form)
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
            await deleteMachineInstance(deletingId)
            setDeleteModalOpen(false)
            fetchData(pagination.page)
        } catch (err) {
            setError('Failed to delete machine instance')
        }
    }

    const formatDate = (date) => {
        if (!date) return '—'
        return new Date(date).toLocaleDateString()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-500/10 text-green-500'
            case 'Under Maintenance': return 'bg-yellow-500/10 text-yellow-500'
            case 'Out of Service': return 'bg-red-500/10 text-red-500'
            default: return 'bg-slate-500/10 text-slate-500'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Machine Instance Management</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage individual equipment units, serial numbers, and maintenance schedules.</p>
                </div>
                {canEdit && (
                    <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Machine Instance
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-brand-surface/60">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Machine Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Model / Serial</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lab</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Calibration / Maintenance</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">Loading machines...</td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No machine instances found.</td>
                            </tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-foreground">{item.nickname || item.machineType?.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.nickname ? item.machineType?.name : 'No Nickname'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-foreground">{item.model}</div>
                                    <div className="text-xs text-muted-foreground">SN: {item.serialNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm text-foreground">{item.lab?.name || '—'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs text-foreground">Cal: {formatDate(item.calibrationDueDate)}</div>
                                    <div className="text-xs text-muted-foreground">Maint: {formatDate(item.maintenanceDueDate)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase",
                                        getStatusColor(item.status)
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
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? (canEdit ? 'Edit Machine Instance' : 'Machine Instance Details') : 'Add Machine Instance'} className="max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground flex items-center justify-between">
                                    Machine Type
                                    {form.machineType && (
                                        <button
                                            type="button"
                                            onClick={() => handleViewTypeDetails(form.machineType)}
                                            className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                                        >
                                            <Info className="h-3 w-3" /> View Details
                                        </button>
                                    )}
                                </label>
                                <select
                                    required
                                    disabled={!canEdit}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                                    value={form.machineType}
                                    onChange={e => setForm({ ...form, machineType: e.target.value })}
                                >
                                    <option value="">Select Machine Type</option>
                                    {machineTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground">Nickname (Optional)</label>
                                <Input disabled={!canEdit} value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} placeholder="e.g. Lab Bench 1 Microscope" />
                            </div>

                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground">Model</label>
                                <Input disabled={!canEdit} required value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. Nikon Eclipse E200" />
                            </div>

                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground">Serial Number</label>
                                <Input disabled={!canEdit} required value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} placeholder="e.g. SN-12345678" />
                            </div>

                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground">Calibration Due Date</label>
                                <Input disabled={!canEdit} required type="date" value={form.calibrationDueDate} onChange={e => setForm({ ...form, calibrationDueDate: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground">Maintenance Due Date</label>
                                <Input disabled={!canEdit} required type="date" value={form.maintenanceDueDate} onChange={e => setForm({ ...form, maintenanceDueDate: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="text-sm font-medium mb-1 block text-foreground">Status</label>
                                <select
                                    disabled={!canEdit}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Out of Service">Out of Service</option>
                                </select>
                            </div>

                            {/* Lab Selection - only for Admin/Super Admin. Lab Owners use the context-selected lab. */}
                            {isAdmin && (
                                <div className="col-span-1">
                                    <label className="text-sm font-medium mb-1 block text-foreground">Assign to Lab</label>
                                    <select
                                        required
                                        disabled={!canEdit}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                                        value={form.lab}
                                        onChange={e => setForm({ ...form, lab: e.target.value })}
                                    >
                                        <option value="">Select Lab</option>
                                        {allLabs.map(lab => (
                                            <option key={lab.id} value={lab.id}>{lab.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="col-span-2">
                                <label className="text-sm font-medium mb-1 block text-foreground">Notes</label>
                                <textarea
                                    disabled={!canEdit}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Additional details about this machine..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{canEdit ? 'Cancel' : 'Close'}</Button>
                            {canEdit && <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Machine Instance'}</Button>}
                        </div>
                    </form>
                </Modal>
            )}

            {deleteModalOpen && (
                <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Machine Instance">
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this machine instance? This action cannot be undone and will remove all history associated with this serial number.</p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {typeDetailsModalOpen && selectedTypeDetails && (
                <Modal open={typeDetailsModalOpen} onClose={() => setTypeDetailsModalOpen(false)} title="Machine Type Details" className="max-w-md">
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase text-[10px] tracking-wider opacity-60">General Info</label>
                            <div className="mt-1 grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-border/50">
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase block">Name</label>
                                    <div className="text-sm font-semibold text-foreground">{selectedTypeDetails.name}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase block">Category</label>
                                    <div className="text-sm text-foreground">{selectedTypeDetails.category || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-medium text-muted-foreground uppercase block">Calibration Frequency</label>
                                <div className="text-sm text-foreground bg-muted/20 p-2 rounded border border-border/50">{selectedTypeDetails.defaultCalibrationFrequency || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-muted-foreground uppercase block">Maintenance Frequency</label>
                                <div className="text-sm text-foreground bg-muted/20 p-2 rounded border border-border/50">{selectedTypeDetails.defaultMaintenanceFrequency || 'N/A'}</div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase block mb-1.5">Required Document Templates</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedTypeDetails.requiredDocumentTemplates?.length > 0 ? (
                                    selectedTypeDetails.requiredDocumentTemplates.map(dt => (
                                        <span key={dt.id || dt._id} className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-bold border border-blue-500/20">
                                            {dt.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">No standard templates required</span>
                                )}
                            </div>
                        </div>

                        {selectedTypeDetails.notes && (
                            <div>
                                <label className="text-[10px] font-medium text-muted-foreground uppercase block mb-1">Type Instructions/Notes</label>
                                <div className="text-xs text-muted-foreground bg-slate-500/5 p-3 rounded-lg border border-border/50 italic leading-relaxed">
                                    {selectedTypeDetails.notes}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-border mt-2">
                            <Button variant="outline" className="h-9 px-4" onClick={() => setTypeDetailsModalOpen(false)}>Close Details</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
