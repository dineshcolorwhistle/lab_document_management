import { useEffect, useState } from 'react'
import {
  listLabTechnicians,
  createLabTechnician,
  updateLabTechnician,
  enableLabTechnician,
  deleteLabTechnician,
  deleteLabTechnicianPermanent,
} from '../services/users'
import { useAuth } from '../contexts/AuthContext'
import { getPermissionForMenu } from '../config/menu'
import { PERMISSIONS } from '../config/menu'
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

export function LabTechniciansPage() {
  const { user } = useAuth()
  const canEdit = getPermissionForMenu('lab-technician', user?.role) === PERMISSIONS.CRUD

  const [technicians, setTechnicians] = useState([])
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
  const [editingTech, setEditingTech] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [editError, setEditError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingTech, setDeletingTech] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const [enableModalOpen, setEnableModalOpen] = useState(false)
  const [enablingTech, setEnablingTech] = useState(null)
  const [enableError, setEnableError] = useState(null)
  const [enableSubmitting, setEnableSubmitting] = useState(false)

  const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false)
  const [permanentDeletingTech, setPermanentDeletingTech] = useState(null)
  const [permanentDeleteError, setPermanentDeleteError] = useState(null)
  const [permanentDeleteSubmitting, setPermanentDeleteSubmitting] = useState(false)

  const fetchTechnicians = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await listLabTechnicians({ page, limit: DEFAULT_LIMIT })
      setTechnicians(res.data)
      setPagination(res.pagination)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load lab technicians')
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnicians(1)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    fetchTechnicians(newPage)
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
      await createLabTechnician({ name: form.name.trim(), email: form.email.trim() })
      setSuccessMessage('Lab technician created. A password-set link has been sent to their email. If they don’t see it, ask them to check Spam and Promotions.')
      setForm({ name: '', email: '' })
      await fetchTechnicians(pagination.page)
      setTimeout(closeModal, 1500)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to create lab technician')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (tech) => {
    setEditingTech(tech)
    setEditForm({ name: tech.name, email: tech.email })
    setEditError(null)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingTech(null)
    setEditError(null)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingTech) return
    setEditError(null)
    setEditSubmitting(true)
    try {
      await updateLabTechnician(editingTech.id, { name: editForm.name.trim() })
      await fetchTechnicians(pagination.page)
      closeEditModal()
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update lab technician')
    } finally {
      setEditSubmitting(false)
    }
  }

  const openDeleteModal = (tech) => {
    setDeletingTech(tech)
    setDeleteError(null)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setDeletingTech(null)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTech) return
    setDeleteError(null)
    setDeleteSubmitting(true)
    try {
      await deleteLabTechnician(deletingTech.id)
      await fetchTechnicians(pagination.page)
      closeDeleteModal()
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to disable lab technician')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const openEnableModal = (tech) => {
    setEnablingTech(tech)
    setEnableError(null)
    setEnableModalOpen(true)
  }

  const closeEnableModal = () => {
    setEnableModalOpen(false)
    setEnablingTech(null)
    setEnableError(null)
  }

  const handleEnableConfirm = async () => {
    if (!enablingTech) return
    setEnableError(null)
    setEnableSubmitting(true)
    try {
      await enableLabTechnician(enablingTech.id)
      await fetchTechnicians(pagination.page)
      closeEnableModal()
    } catch (err) {
      setEnableError(err?.response?.data?.message || 'Failed to enable lab technician')
    } finally {
      setEnableSubmitting(false)
    }
  }

  const openPermanentDeleteModal = (tech) => {
    setPermanentDeletingTech(tech)
    setPermanentDeleteError(null)
    setPermanentDeleteModalOpen(true)
  }

  const closePermanentDeleteModal = () => {
    setPermanentDeleteModalOpen(false)
    setPermanentDeletingTech(null)
    setPermanentDeleteError(null)
  }

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeletingTech) return
    setPermanentDeleteError(null)
    setPermanentDeleteSubmitting(true)
    try {
      await deleteLabTechnicianPermanent(permanentDeletingTech.id)
      await fetchTechnicians(pagination.page)
      closePermanentDeleteModal()
    } catch (err) {
      setPermanentDeleteError(err?.response?.data?.message || 'Failed to delete lab technician')
    } finally {
      setPermanentDeleteSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-brand-primary">Lab Technicians</h2>
        {canEdit && (
          <Button type="button" onClick={openModal} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Lab Technician
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="ldm-card overflow-hidden rounded-2xl p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-brand-muted">Loading lab technicians…</p>
          </div>
        ) : technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-brand-muted">No lab technicians yet.</p>
            {canEdit && (
              <Button type="button" variant="secondary" className="mt-3" onClick={openModal}>
                Add Lab Technician
              </Button>
            )}
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
                    {canEdit && (
                      <th scope="col" className="relative px-4 py-3 sm:px-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border bg-brand-surface-elevated">
                  {technicians.map((tech) => (
                    <tr key={tech.id} className="hover:bg-brand-muted/5">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-brand-primary sm:px-6">
                        {tech.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {tech.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            tech.status === 'ACTIVE'
                              ? 'bg-accent-green/10 text-accent-green'
                              : 'bg-brand-muted/20 text-brand-muted'
                          )}
                        >
                          {tech.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-brand-muted sm:px-6">
                        {formatDate(tech.createdAt)}
                      </td>
                      {canEdit && (
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(tech)}
                              className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-brand-muted/10 hover:text-brand-primary"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {tech.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(tech)}
                                className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
                                title="Disable"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEnableModal(tech)}
                                  className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-green/10 hover:text-accent-green"
                                  title="Enable"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openPermanentDeleteModal(tech)}
                                  className="rounded-lg p-2 text-brand-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
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

      {canEdit && (
        <>
          <Modal open={modalOpen} onClose={closeModal} title="Add Lab Technician">
            {successMessage ? (
              <Alert variant="success">{successMessage}</Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="lab-tech-name" className="block text-sm font-medium text-brand-primary">
                    Name
                  </label>
                  <Input
                    id="lab-tech-name"
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
                  <label htmlFor="lab-tech-email" className="block text-sm font-medium text-brand-primary">
                    Email
                  </label>
                  <Input
                    id="lab-tech-email"
                    type="email"
                    className="mt-1"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="tech@example.com"
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

          <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Lab Technician">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-lab-tech-name" className="block text-sm font-medium text-brand-primary">
                  Name
                </label>
                <Input
                  id="edit-lab-tech-name"
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
                <label htmlFor="edit-lab-tech-email" className="block text-sm font-medium text-brand-primary">
                  Email
                </label>
                <Input
                  id="edit-lab-tech-email"
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

          <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Disable Lab Technician">
            {deletingTech && (
              <div className="space-y-4">
                <p className="text-sm text-brand-muted">
                  Disable <strong className="text-brand-primary">{deletingTech.name}</strong> ({deletingTech.email})?
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

          <Modal open={enableModalOpen} onClose={closeEnableModal} title="Enable Lab Technician">
            {enablingTech && (
              <div className="space-y-4">
                <p className="text-sm text-brand-muted">
                  Enable <strong className="text-brand-primary">{enablingTech.name}</strong> ({enablingTech.email})?
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

          <Modal open={permanentDeleteModalOpen} onClose={closePermanentDeleteModal} title="Delete Lab Technician Permanently">
            {permanentDeletingTech && (
              <div className="space-y-4">
                <Alert variant="danger" title="This cannot be undone">
                  Permanently delete <strong>{permanentDeletingTech.name}</strong> (
                  {permanentDeletingTech.email})? Their account and all associated data will be removed.
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
        </>
      )}
    </div>
  )
}
