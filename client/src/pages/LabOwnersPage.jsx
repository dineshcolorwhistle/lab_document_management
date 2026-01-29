import { useEffect, useState } from 'react'
import {
  listLabOwners,
  createLabOwner,
  updateLabOwner,
  enableLabOwner,
  deleteLabOwner,
  deleteLabOwnerPermanent,
} from '../services/users'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, UserCheck } from 'lucide-react'
import { cn } from '../utils/cn'

const DEFAULT_LIMIT = 10

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

export function LabOwnersPage() {
  const [labOwners, setLabOwners] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingOwner, setEditingOwner] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [editError, setEditError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingOwner, setDeletingOwner] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const [enableModalOpen, setEnableModalOpen] = useState(false)
  const [enablingOwner, setEnablingOwner] = useState(null)
  const [enableError, setEnableError] = useState(null)
  const [enableSubmitting, setEnableSubmitting] = useState(false)

  const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false)
  const [permanentDeletingOwner, setPermanentDeletingOwner] = useState(null)
  const [permanentDeleteError, setPermanentDeleteError] = useState(null)
  const [permanentDeleteSubmitting, setPermanentDeleteSubmitting] = useState(false)

  const fetchLabOwners = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await listLabOwners({ page, limit: DEFAULT_LIMIT })
      setLabOwners(res.data)
      setPagination(res.pagination)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load lab owners')
      setLabOwners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLabOwners(1)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    fetchLabOwners(newPage)
  }

  const openModal = () => {
    setForm({ name: '', email: '' })
    setSubmitError(null)
    setSuccessMessage(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSubmitError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      await createLabOwner({ name: form.name.trim(), email: form.email.trim() })
      setSuccessMessage('Lab owner created. A password-set link has been sent to their email. If they don’t see it, ask them to check Spam and Promotions.')
      setForm({ name: '', email: '' })
      await fetchLabOwners(pagination.page)
      setTimeout(closeModal, 1500)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to create lab owner')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (owner) => {
    setEditingOwner(owner)
    setEditForm({ name: owner.name, email: owner.email })
    setEditError(null)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingOwner(null)
    setEditError(null)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingOwner) return
    setEditError(null)
    setEditSubmitting(true)
    try {
      await updateLabOwner(editingOwner.id, { name: editForm.name.trim() })
      await fetchLabOwners(pagination.page)
      closeEditModal()
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update lab owner')
    } finally {
      setEditSubmitting(false)
    }
  }

  const openDeleteModal = (owner) => {
    setDeletingOwner(owner)
    setDeleteError(null)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setDeletingOwner(null)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingOwner) return
    setDeleteError(null)
    setDeleteSubmitting(true)
    try {
      await deleteLabOwner(deletingOwner.id)
      await fetchLabOwners(pagination.page)
      closeDeleteModal()
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to disable lab owner')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const openEnableModal = (owner) => {
    setEnablingOwner(owner)
    setEnableError(null)
    setEnableModalOpen(true)
  }

  const closeEnableModal = () => {
    setEnableModalOpen(false)
    setEnablingOwner(null)
    setEnableError(null)
  }

  const handleEnableConfirm = async () => {
    if (!enablingOwner) return
    setEnableError(null)
    setEnableSubmitting(true)
    try {
      await enableLabOwner(enablingOwner.id)
      await fetchLabOwners(pagination.page)
      closeEnableModal()
    } catch (err) {
      setEnableError(err?.response?.data?.message || 'Failed to enable lab owner')
    } finally {
      setEnableSubmitting(false)
    }
  }

  const openPermanentDeleteModal = (owner) => {
    setPermanentDeletingOwner(owner)
    setPermanentDeleteError(null)
    setPermanentDeleteModalOpen(true)
  }

  const closePermanentDeleteModal = () => {
    setPermanentDeleteModalOpen(false)
    setPermanentDeletingOwner(null)
    setPermanentDeleteError(null)
  }

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeletingOwner) return
    setPermanentDeleteError(null)
    setPermanentDeleteSubmitting(true)
    try {
      await deleteLabOwnerPermanent(permanentDeletingOwner.id)
      await fetchLabOwners(pagination.page)
      closePermanentDeleteModal()
    } catch (err) {
      setPermanentDeleteError(err?.response?.data?.message || 'Failed to delete lab owner')
    } finally {
      setPermanentDeleteSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-brand-primary">Lab Owners</h2>
        <Button type="button" onClick={openModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lab Owner
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="ldm-card overflow-hidden rounded-2xl p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-brand-muted">Loading lab owners…</p>
          </div>
        ) : labOwners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-brand-muted">No lab owners yet.</p>
            <Button type="button" variant="secondary" className="mt-3" onClick={openModal}>
              Add Lab Owner
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-border">
                <thead className="bg-brand-surface/60">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted sm:px-6"
                    >
                      Created
                    </th>
                    <th scope="col" className="relative px-4 py-3 sm:px-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border bg-brand-surface-elevated">
                  {labOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-brand-muted/5">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-brand-primary sm:px-6">
                        {owner.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {owner.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            owner.status === 'ACTIVE'
                              ? 'bg-accent-green/10 text-accent-green'
                              : 'bg-brand-muted/20 text-brand-muted'
                          )}
                        >
                          {owner.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {formatDate(owner.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(owner)}
                            className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-brand-muted/10 hover:text-brand-primary"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {owner.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(owner)}
                              className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
                              title="Disable"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => openEnableModal(owner)}
                                className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-green/10 hover:text-accent-green"
                                title="Enable"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openPermanentDeleteModal(owner)}
                                className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
                                title="Delete permanently"
                              >
                                <Trash2 className="h-4 w-4" />
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

      <Modal open={modalOpen} onClose={closeModal} title="Add Lab Owner">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="lab-owner-name" className="block text-sm font-medium text-brand-primary">
                Name
              </label>
              <Input
                id="lab-owner-name"
                type="text"
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="lab-owner-email" className="block text-sm font-medium text-brand-primary">
                Email
              </label>
              <Input
                id="lab-owner-email"
                type="email"
                className="mt-1"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="owner@example.com"
                required
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-brand-muted">
                A password-set link will be sent to this email.
              </p>
            </div>
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

      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Lab Owner">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-lab-owner-name" className="block text-sm font-medium text-brand-primary">
              Name
            </label>
            <Input
              id="edit-lab-owner-name"
              type="text"
              className="mt-1"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="edit-lab-owner-email" className="block text-sm font-medium text-brand-primary">
              Email
            </label>
            <Input
              id="edit-lab-owner-email"
              type="email"
              className="mt-1 bg-brand-surface cursor-not-allowed"
              value={editForm.email}
              readOnly
              disabled
              aria-label="Email (read-only)"
            />
            <p className="mt-1 text-xs text-brand-muted">Email cannot be changed.</p>
          </div>
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

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Disable Lab Owner">
        {deletingOwner && (
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              Disable <strong className="text-brand-primary">{deletingOwner.name}</strong> ({deletingOwner.email})?
              They will no longer be able to sign in.
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
                {deleteSubmitting ? 'Disabling…' : 'Disable'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={enableModalOpen} onClose={closeEnableModal} title="Enable Lab Owner">
        {enablingOwner && (
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              Enable <strong className="text-brand-primary">{enablingOwner.name}</strong> ({enablingOwner.email})?
              They will be able to sign in again.
            </p>
            {enableError && <Alert variant="danger">{enableError}</Alert>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeEnableModal}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleEnableConfirm}
                disabled={enableSubmitting}
                className="bg-accent-green text-white hover:bg-teal-700"
              >
                {enableSubmitting ? 'Enabling…' : 'Enable'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={permanentDeleteModalOpen} onClose={closePermanentDeleteModal} title="Delete Lab Owner Permanently">
        {permanentDeletingOwner && (
          <div className="space-y-4">
            <Alert variant="danger" title="This cannot be undone">
              Permanently delete <strong>{permanentDeletingOwner.name}</strong> (
              {permanentDeletingOwner.email})? Their account and all associated data will be removed.
              This action cannot be undone.
            </Alert>
            {permanentDeleteError && <Alert variant="danger">{permanentDeleteError}</Alert>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closePermanentDeleteModal}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePermanentDeleteConfirm}
                disabled={permanentDeleteSubmitting}
                className="bg-accent-red text-white hover:bg-red-700"
              >
                {permanentDeleteSubmitting ? 'Deleting…' : 'Delete permanently'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
