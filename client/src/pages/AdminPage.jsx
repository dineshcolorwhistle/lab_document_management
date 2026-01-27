import { useEffect, useState } from 'react'
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  enableAdmin,
  deleteAdmin,
  deleteAdminPermanent,
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

export function AdminPage() {
  const [admins, setAdmins] = useState([])
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
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [editError, setEditError] = useState(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingAdmin, setDeletingAdmin] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const [enableModalOpen, setEnableModalOpen] = useState(false)
  const [enablingAdmin, setEnablingAdmin] = useState(null)
  const [enableError, setEnableError] = useState(null)
  const [enableSubmitting, setEnableSubmitting] = useState(false)

  const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false)
  const [permanentDeletingAdmin, setPermanentDeletingAdmin] = useState(null)
  const [permanentDeleteError, setPermanentDeleteError] = useState(null)
  const [permanentDeleteSubmitting, setPermanentDeleteSubmitting] = useState(false)

  const fetchAdmins = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await listAdmins({ page, limit: DEFAULT_LIMIT })
      setAdmins(res.data)
      setPagination(res.pagination)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admins')
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins(1)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    fetchAdmins(newPage)
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
      await createAdmin({ name: form.name.trim(), email: form.email.trim() })
      setSuccessMessage('Admin created. A password-set link has been sent to their email.')
      setForm({ name: '', email: '' })
      await fetchAdmins(pagination.page)
      setTimeout(closeModal, 1500)
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to create admin')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (admin) => {
    setEditingAdmin(admin)
    setEditForm({ name: admin.name, email: admin.email })
    setEditError(null)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingAdmin(null)
    setEditError(null)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingAdmin) return
    setEditError(null)
    setEditSubmitting(true)
    try {
      await updateAdmin(editingAdmin.id, { name: editForm.name.trim() })
      await fetchAdmins(pagination.page)
      closeEditModal()
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update admin')
    } finally {
      setEditSubmitting(false)
    }
  }

  const openDeleteModal = (admin) => {
    setDeletingAdmin(admin)
    setDeleteError(null)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setDeletingAdmin(null)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return
    setDeleteError(null)
    setDeleteSubmitting(true)
    try {
      await deleteAdmin(deletingAdmin.id)
      await fetchAdmins(pagination.page)
      closeDeleteModal()
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to disable admin')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const openEnableModal = (admin) => {
    setEnablingAdmin(admin)
    setEnableError(null)
    setEnableModalOpen(true)
  }

  const closeEnableModal = () => {
    setEnableModalOpen(false)
    setEnablingAdmin(null)
    setEnableError(null)
  }

  const handleEnableConfirm = async () => {
    if (!enablingAdmin) return
    setEnableError(null)
    setEnableSubmitting(true)
    try {
      await enableAdmin(enablingAdmin.id)
      await fetchAdmins(pagination.page)
      closeEnableModal()
    } catch (err) {
      setEnableError(err?.response?.data?.message || 'Failed to enable admin')
    } finally {
      setEnableSubmitting(false)
    }
  }

  const openPermanentDeleteModal = (admin) => {
    setPermanentDeletingAdmin(admin)
    setPermanentDeleteError(null)
    setPermanentDeleteModalOpen(true)
  }

  const closePermanentDeleteModal = () => {
    setPermanentDeleteModalOpen(false)
    setPermanentDeletingAdmin(null)
    setPermanentDeleteError(null)
  }

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeletingAdmin) return
    setPermanentDeleteError(null)
    setPermanentDeleteSubmitting(true)
    try {
      await deleteAdminPermanent(permanentDeletingAdmin.id)
      await fetchAdmins(pagination.page)
      closePermanentDeleteModal()
    } catch (err) {
      setPermanentDeleteError(err?.response?.data?.message || 'Failed to delete admin')
    } finally {
      setPermanentDeleteSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Admins</h2>
        <Button type="button" onClick={openModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500">Loading admins…</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500">No admins yet.</p>
            <Button type="button" variant="secondary" className="mt-3" onClick={openModal}>
              Add Admin
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                    >
                      Created
                    </th>
                    <th scope="col" className="relative px-4 py-3 sm:px-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 sm:px-6">
                        {admin.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 sm:px-6">
                        {admin.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            admin.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 sm:px-6">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {admin.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(admin)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                              title="Disable"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => openEnableModal(admin)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"
                                title="Enable"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openPermanentDeleteModal(admin)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
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
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                <p className="text-sm text-gray-600">
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

      <Modal open={modalOpen} onClose={closeModal} title="Add Admin">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="admin-name"
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
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                className="mt-1"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-gray-500">
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

      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Admin">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-admin-name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              id="edit-admin-name"
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
            <label htmlFor="edit-admin-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="edit-admin-email"
              type="email"
              className="mt-1 bg-gray-100 cursor-not-allowed"
              value={editForm.email}
              readOnly
              disabled
              aria-label="Email (read-only)"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
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

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Disable Admin">
        {deletingAdmin && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Disable <strong>{deletingAdmin.name}</strong> ({deletingAdmin.email})? They will no
              longer be able to sign in.
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
                {deleteSubmitting ? 'Disabling…' : 'Disable'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={enableModalOpen} onClose={closeEnableModal} title="Enable Admin">
        {enablingAdmin && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enable <strong>{enablingAdmin.name}</strong> ({enablingAdmin.email})? They will be
              able to sign in again.
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
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {enableSubmitting ? 'Enabling…' : 'Enable'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={permanentDeleteModalOpen} onClose={closePermanentDeleteModal} title="Delete Admin Permanently">
        {permanentDeletingAdmin && (
          <div className="space-y-4">
            <Alert variant="danger" title="This cannot be undone">
              Permanently delete <strong>{permanentDeletingAdmin.name}</strong> (
              {permanentDeletingAdmin.email})? Their account and all associated data will be
              removed. This action cannot be undone.
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
                className="bg-red-600 text-white hover:bg-red-700"
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
