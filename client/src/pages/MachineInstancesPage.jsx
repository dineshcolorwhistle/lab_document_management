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
import { Plus, Pencil, Trash2, Cpu, Calendar, Tag, Info, Building2, Settings2 } from 'lucide-react'
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
    const [viewDocModalOpen, setViewDocModalOpen] = useState(false)
    const [viewingDoc, setViewingDoc] = useState(null)
    const [viewTypeModalOpen, setViewTypeModalOpen] = useState(false)
    const [viewingType, setViewingType] = useState(null)
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

    const handleViewTypeDetails = (type) => {
        if (!type) return
        setViewingType(type)
        setViewTypeModalOpen(true)
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
                                    <div className="flex flex-col">
                                        <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                            {item.nickname || item.machineType?.name}
                                            {!item.nickname && (
                                                <button onClick={() => handleViewTypeDetails(item.machineType)} className="p-1 rounded-md bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 transition-colors">
                                                    <Info className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                onClick={() => handleViewTypeDetails(item.machineType)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                                            >
                                                {item.nickname ? item.machineType?.name : 'Standard Type'}
                                            </button>
                                            <div className="flex -space-x-1.5 overflow-hidden ml-1">
                                                {(item.machineType?.requiredDocumentTemplates || []).map((dt, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={(e) => { e.stopPropagation(); setViewingDoc(dt); setViewDocModalOpen(true); }}
                                                        className="h-5 w-5 rounded-full bg-blue-500/10 border border-card flex items-center justify-center text-[8px] text-blue-600 font-black cursor-pointer hover:scale-110 hover:z-10 transition-all shadow-sm ring-1 ring-blue-500/10"
                                                        title={dt.name}
                                                    >
                                                        {dt.name?.[0]?.toUpperCase() || 'D'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
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

            {/* Professional Machine Type Detail Modal */}
            {viewTypeModalOpen && viewingType && (
                <Modal open={viewTypeModalOpen} onClose={() => setViewTypeModalOpen(false)} title="Machine Type Specifications" className="max-w-xl">
                    <div className="p-0 overflow-hidden">
                        <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white relative">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl">
                                    <Cpu className="h-8 w-8 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold leading-none">{viewingType.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 uppercase tracking-widest leading-normal">
                                            {viewingType.category || 'Standard'}
                                        </span>
                                        <span className="text-xs text-white/50 font-medium">System ID: {viewingType.id?.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2">Calibration</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-semibold text-foreground">{viewingType.defaultCalibrationFrequency || 'Not Defined'}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2">Maintenance</label>
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Settings2 className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-semibold">{viewingType.defaultMaintenanceFrequency || 'Not Defined'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider pl-1">Compliance Requirements</label>
                                <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10">
                                    {(viewingType.requiredDocumentTemplates || []).length > 0 ? (
                                        viewingType.requiredDocumentTemplates.map(dt => (
                                            <div
                                                key={dt.id}
                                                onClick={() => { setViewingDoc(dt); setViewDocModalOpen(true); }}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border hover:border-blue-500/40 cursor-pointer shadow-sm transition-all"
                                            >
                                                <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                                                    {dt.name?.[0]}
                                                </div>
                                                <span className="text-[11px] font-semibold text-foreground">{dt.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-muted-foreground italic w-full text-center py-2">No standard document templates requirement detected.</div>
                                    )}
                                </div>
                            </div>

                            {viewingType.notes && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider pl-1">Administrative Notes</label>
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs leading-relaxed text-muted-foreground italic">
                                        {viewingType.notes}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button className="w-full" variant="outline" onClick={() => setViewTypeModalOpen(false)}>Close Specifications</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Professional Document Detail Modal */}
            {viewDocModalOpen && viewingDoc && (
                <Modal open={viewDocModalOpen} onClose={() => setViewDocModalOpen(false)} title="Document Template Details" className="max-w-2xl">
                    <div className="p-0 overflow-hidden">
                        <div className="relative p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-bold shadow-xl border border-white/20">
                                    {viewingDoc.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-bold truncate leading-none">{viewingDoc.name}</h3>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider border border-white/10">
                                            {viewingDoc.frequency || 'N/A'}
                                        </div>
                                        <div className="h-4 w-px bg-white/20" />
                                        <div className="text-sm font-medium text-white/80 flex items-center gap-1.5">
                                            <span className="opacity-60 text-xs uppercase tracking-widest font-bold">Clause:</span>
                                            {viewingDoc.nablClauseMapping || 'Not Assigned'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 bg-card">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
                                    <div className="h-1 w-4 bg-blue-500 rounded-full" />
                                    Description
                                </div>
                                <div className="p-5 rounded-2xl bg-muted/30 border border-border text-sm leading-relaxed text-foreground shadow-inner">
                                    {viewingDoc.description || <span className="text-muted-foreground italic">No detailed description has been provided for this template.</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
                                        <div className="h-1 w-4 bg-blue-500 rounded-full" />
                                        Allowed Formats
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {(viewingDoc.allowedFileTypes || []).length > 0 ? (
                                            viewingDoc.allowedFileTypes.map(type => (
                                                <div key={type} className="flex items-center gap-2 pr-3 pl-2 py-1.5 rounded-xl bg-background border border-border shadow-sm">
                                                    <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600 uppercase">
                                                        {type}
                                                    </div>
                                                    <span className="text-xs font-semibold text-foreground uppercase">{type}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-muted-foreground italic">Standard formats apply</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
                                        <div className="h-1 w-4 bg-blue-500 rounded-full" />
                                        Guidance Content
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border self-start",
                                            viewingDoc.helpContentType === 'NONE'
                                                ? "bg-muted text-muted-foreground border-border"
                                                : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                        )}>
                                            Type: {viewingDoc.helpContentType || 'NONE'}
                                        </div>
                                        {viewingDoc.helpContentType !== 'NONE' && (
                                            <div className="text-xs text-foreground p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 italic">
                                                {viewingDoc.helpContentValue}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-border">
                                <Button className="min-w-[120px]" onClick={() => setViewDocModalOpen(false)}>Close Overview</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}
