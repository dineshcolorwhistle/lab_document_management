import { useEffect, useState } from 'react'
import { listLabs, createLab, updateLab, deleteLab } from '../services/labs'
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
        contact: form.contact.trim(),
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
    setEditForm({
      name: lab.name,
      description: lab.description || '',
      address: lab.address || '',
      contact: lab.contact || '',
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

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingLab) return
    const err = validateForm(editForm)
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
        contact: editForm.contact.trim(),
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
        <h2 className="text-xl font-semibold text-brand-primary">Lab Management</h2>
        <Button type="button" onClick={openModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lab
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="ldm-card overflow-hidden rounded-2xl p-0">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border">
                <thead className="bg-brand-surface/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6">
                      Lab name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6">
                      Address
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6">
                      Contact
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6">
                      Lab owners
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6">
                      Lab technicians
                    </th>
                    <th scope="col" className="relative px-4 py-3 sm:px-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border bg-brand-surface-elevated">
                  {labs.map((lab) => (
                    <tr key={lab.id} className="hover:bg-brand-muted/5">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-brand-primary sm:px-6">
                        {lab.name}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-brand-muted sm:px-6" title={lab.description}>
                        {lab.description || '—'}
                      </td>
                      <td className="max-w-[150px] truncate px-4 py-3 text-sm text-brand-muted sm:px-6" title={lab.address}>
                        {lab.address || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {lab.contact || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {(lab.labOwners || []).length} owner(s)
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {(lab.labTechnicians || []).length} technician(s)
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(lab)}
                            className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-brand-muted/10 hover:text-brand-primary"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(lab)}
                            className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
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

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-brand-border bg-brand-surface/60 px-4 py-3 sm:px-6">
                <p className="text-sm text-brand-muted">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="inline-flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
                type="text"
                className="mt-1"
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                placeholder="Phone or email"
              />
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
              type="text"
              className="mt-1"
              value={editForm.contact}
              onChange={(e) => setEditForm((f) => ({ ...f, contact: e.target.value }))}
              placeholder="Phone or email"
            />
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
                className="bg-accent-red text-white hover:bg-red-700"
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
