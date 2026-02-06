import { useEffect, useState } from 'react'
import { listLabs, createLab, updateLab, deleteLab } from '../services/labs'
import { Card } from '../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import { listLabOwners } from '../services/users'
import { listLabTechnicians } from '../services/users'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'
import { MultiSelect } from '../components/ui/MultiSelect'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../utils/cn'

const DEFAULT_LIMIT = 10
const SELECT_LIMIT = 200

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

const emptyForm = {
  name: '',
  description: '',
  address: '',
  contact: '',
  labOwnerIds: [],
  labTechnicianIds: [],
}

export function LabManagementPage() {
  const [labs, setLabs] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [labOwners, setLabOwners] = useState([])
  const [labTechnicians, setLabTechnicians] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingLab, setEditingLab] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editError, setEditError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingLab, setDeletingLab] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const fetchLabs = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await listLabs({ page, limit: DEFAULT_LIMIT })
      setLabs(res.data)
      setPagination(res.pagination)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load labs')
      setLabs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    setOptionsLoading(true)
    try {
      const [ownersRes, techsRes] = await Promise.all([
        listLabOwners({ page: 1, limit: SELECT_LIMIT }),
        listLabTechnicians({ page: 1, limit: SELECT_LIMIT }),
      ])
      setLabOwners(ownersRes.data.filter((u) => u.status === 'ACTIVE'))
      setLabTechnicians(techsRes.data.filter((u) => u.status === 'ACTIVE'))
    } catch {
      setLabOwners([])
      setLabTechnicians([])
    } finally {
      setOptionsLoading(false)
    }
  }

  useEffect(() => {
    fetchLabs(1)
  }, [])

  useEffect(() => {
    if (modalOpen || editModalOpen) fetchOptions()
  }, [modalOpen, editModalOpen])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    fetchLabs(newPage)
  }

  const openModal = () => {
    setForm(emptyForm)
    setSubmitError(null)
    setSuccessMessage(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSubmitError(null)
  }

  const validateForm = (f) => {
    if (!f.name?.trim()) return 'Lab name is required'
    const contactVal = (f.contact || '').trim().replace(/\D/g, '')
    if (contactVal && contactVal.length !== 10) return 'Contact must be exactly 10 digits'
    if (!f.labOwnerIds?.length) return 'Select at least one lab owner'
    if (!f.labTechnicianIds?.length) return 'Select at least one lab technician'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateForm(form)
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      await createLab({
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        contact: (form.contact || '').trim().replace(/\D/g, '').slice(0, 10) || '',
        labOwnerIds: form.labOwnerIds,
        labTechnicianIds: form.labTechnicianIds,
      })
      setSuccessMessage('Lab created. Assignment emails have been sent to selected lab owners and technicians.')
      setForm(emptyForm)
      await fetchLabs(pagination.page)
      setTimeout(closeModal, 2000)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to create lab')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (lab) => {
    setEditingLab(lab)
    const contactDigits = (lab.contact || '').replace(/\D/g, '').slice(0, 10)
    setEditForm({
      name: lab.name,
      description: lab.description || '',
      address: lab.address || '',
      contact: contactDigits,
      labOwnerIds: (lab.labOwners || []).map((o) => o.id),
      labTechnicianIds: (lab.labTechnicians || []).map((t) => t.id),
    })
    setEditError(null)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingLab(null)
    setEditError(null)
  }

  const validateEditForm = (f) => {
    if (!f.name?.trim()) return 'Lab name is required'
    const contactVal = (f.contact || '').trim().replace(/\D/g, '')
    if (contactVal && contactVal.length !== 10) return 'Contact must be exactly 10 digits'
    if (!f.labOwnerIds?.length) return 'Select at least one lab owner'
    if (!f.labTechnicianIds?.length) return 'Select at least one lab technician'
    return null
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingLab) return
    const err = validateEditForm(editForm)
    if (err) {
      setEditError(err)
      return
    }
    setEditError(null)
    setEditSubmitting(true)
    try {
      await updateLab(editingLab.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        address: editForm.address.trim(),
        contact: (editForm.contact || '').trim().replace(/\D/g, '').slice(0, 10) || '',
        labOwnerIds: editForm.labOwnerIds,
        labTechnicianIds: editForm.labTechnicianIds,
      })
      await fetchLabs(pagination.page)
      closeEditModal()
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update lab')
    } finally {
      setEditSubmitting(false)
    }
  }

  const openDeleteModal = (lab) => {
    setDeletingLab(lab)
    setDeleteError(null)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setDeletingLab(null)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingLab) return
    setDeleteError(null)
    setDeleteSubmitting(true)
    try {
      await deleteLab(deletingLab.id)
      await fetchLabs(pagination.page)
      closeDeleteModal()
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete lab')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Lab Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage labs, owners and technicians.</p>
        </div>
        <Button type="button" onClick={openModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lab
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-0 overflow-hidden border-border/60 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-brand-muted">Loading labs…</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-brand-muted">No labs yet.</p>
            <Button type="button" variant="secondary" className="mt-3" onClick={openModal}>
              Add Lab
            </Button>
          </div>
        ) : (
          <>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/20">
                    <TableHead className="w-[200px]">Lab Name</TableHead>
                    <TableHead className="w-[250px]">Description</TableHead>
                    <TableHead className="w-[200px]">Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Owners</TableHead>
                    <TableHead>Technicians</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labs.map((lab) => (
                    <TableRow key={lab.id}>
                      <TableCell className="font-medium text-foreground">
                        {lab.name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground" title={lab.description}>
                        {lab.description || '—'}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground" title={lab.address}>
                        {lab.address || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {lab.contact || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                          {(lab.labOwners || []).length} owner(s)
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-slate-700 text-xs font-medium ring-1 ring-inset ring-slate-600/10 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20">
                          {(lab.labTechnicians || []).length} technician(s)
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(lab)}
                            title="Edit"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(lab)}
                            title="Delete"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="h-8 gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="h-8 gap-1"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title="Add Lab" className="max-w-lg">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="lab-name" className="block text-sm font-medium text-brand-primary">
                Lab name <span className="text-accent-red">*</span>
              </label>
              <Input
                id="lab-name"
                type="text"
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Lab name"
                required
              />
            </div>
            <div>
              <label htmlFor="lab-description" className="block text-sm font-medium text-brand-primary">
                Description
              </label>
              <textarea
                id="lab-description"
                className="ldm-input mt-1 min-h-[80px] w-full resize-y rounded-xl"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="lab-address" className="block text-sm font-medium text-brand-primary">
                Address
              </label>
              <Input
                id="lab-address"
                type="text"
                className="mt-1"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Address"
              />
            </div>
            <div>
              <label htmlFor="lab-contact" className="block text-sm font-medium text-brand-primary">
                Contact
              </label>
              <Input
                id="lab-contact"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className="mt-1"
                value={form.contact}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setForm((f) => ({ ...f, contact: digits }))
                }}
                placeholder="10-digit phone number"
              />
              <p className="mt-1 text-xs text-brand-muted">Numbers only, exactly 10 digits</p>
            </div>
            <MultiSelect
              label="Lab owners"
              required
              placeholder="Select lab owners"
              options={labOwners.map((o) => ({ id: o.id, name: o.name, email: o.email }))}
              value={form.labOwnerIds}
              onChange={(ids) => setForm((f) => ({ ...f, labOwnerIds: ids }))}
              disabled={optionsLoading}
            />
            <MultiSelect
              label="Lab technicians"
              required
              placeholder="Select lab technicians"
              options={labTechnicians.map((t) => ({ id: t.id, name: t.name, email: t.email }))}
              value={form.labTechnicianIds}
              onChange={(ids) => setForm((f) => ({ ...f, labTechnicianIds: ids }))}
              disabled={optionsLoading}
            />
            <p className="text-xs text-brand-muted">
              Assignment emails will be sent to selected lab owners and technicians.
            </p>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Lab" className="max-w-lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-lab-name" className="block text-sm font-medium text-brand-primary">
              Lab name <span className="text-accent-red">*</span>
            </label>
            <Input
              id="edit-lab-name"
              type="text"
              className="mt-1"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Lab name"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-lab-description" className="block text-sm font-medium text-brand-primary">
              Description
            </label>
            <textarea
              id="edit-lab-description"
              className="ldm-input mt-1 min-h-[80px] w-full resize-y rounded-xl"
              value={editForm.description}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="edit-lab-address" className="block text-sm font-medium text-brand-primary">
              Address
            </label>
            <Input
              id="edit-lab-address"
              type="text"
              className="mt-1"
              value={editForm.address}
              onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Address"
            />
          </div>
          <div>
            <label htmlFor="edit-lab-contact" className="block text-sm font-medium text-brand-primary">
              Contact
            </label>
            <Input
              id="edit-lab-contact"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className="mt-1"
              value={editForm.contact}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                setEditForm((f) => ({ ...f, contact: digits }))
              }}
              placeholder="10-digit phone number"
            />
            <p className="mt-1 text-xs text-brand-muted">Numbers only, exactly 10 digits</p>
          </div>
          <MultiSelect
            label="Lab owners"
            required
            placeholder="Select lab owners"
            options={labOwners.map((o) => ({ id: o.id, name: o.name, email: o.email }))}
            value={editForm.labOwnerIds}
            onChange={(ids) => setEditForm((f) => ({ ...f, labOwnerIds: ids }))}
            disabled={optionsLoading}
          />
          <MultiSelect
            label="Lab technicians"
            required
            placeholder="Select lab technicians"
            options={labTechnicians.map((t) => ({ id: t.id, name: t.name, email: t.email }))}
            value={editForm.labTechnicianIds}
            onChange={(ids) => setEditForm((f) => ({ ...f, labTechnicianIds: ids }))}
            disabled={optionsLoading}
          />
          <p className="text-xs text-brand-muted">
            Assignment emails will be sent to selected lab owners and technicians.
          </p>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={editSubmitting}>
              {editSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Delete Lab">
        {deletingLab && (
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              Delete lab <strong className="text-brand-primary">{deletingLab.name}</strong>? This action cannot be undone.
            </p>
            {deleteError && <Alert variant="danger">{deleteError}</Alert>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteSubmitting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
