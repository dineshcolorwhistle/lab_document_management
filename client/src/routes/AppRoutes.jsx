import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AdminPage } from '../pages/AdminPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { RequireRole } from '../components/rbac/RequireRole'
import { ROLES } from '../constants/roles'

const Placeholder = ({ title, desc = 'Coming soon...' }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    <p className="mt-2 text-gray-600">{desc}</p>
  </div>
)

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Document — all roles */}
        <Route
          path="/documents"
          element={
            <RequireRole
              allowedRoles={[
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.LAB_OWNER,
                ROLES.LAB_TECHNICIAN,
              ]}
            >
              <Placeholder title="Document" />
            </RequireRole>
          }
        />

        {/* Reports — SUPER_ADMIN, ADMIN, LAB_OWNER (LAB_OWNER View only) */}
        <Route
          path="/reports"
          element={
            <RequireRole
              allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LAB_OWNER]}
            >
              <Placeholder title="Reports" />
            </RequireRole>
          }
        />

        {/* Admin — SUPER_ADMIN only (CRUD) */}
        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AdminPage />
            </RequireRole>
          }
        />

        {/* Lab Management — ADMIN only (CRUD) */}
        <Route
          path="/lab-management"
          element={
            <RequireRole allowedRoles={[ROLES.ADMIN]}>
              <Placeholder title="Lab Management" />
            </RequireRole>
          }
        />

        {/* Lab Technician — ADMIN (CRUD), LAB_OWNER (View) */}
        <Route
          path="/lab-technicians"
          element={
            <RequireRole
              allowedRoles={[ROLES.ADMIN, ROLES.LAB_OWNER]}
            >
              <Placeholder title="Lab Technician" />
            </RequireRole>
          }
        />

        {/* Lab Owner — ADMIN only (CRUD) */}
        <Route
          path="/lab-owners"
          element={
            <RequireRole allowedRoles={[ROLES.ADMIN]}>
              <Placeholder title="Lab Owner" />
            </RequireRole>
          }
        />

        {/* Lab — LAB_OWNER only */}
        <Route
          path="/labs"
          element={
            <RequireRole allowedRoles={[ROLES.LAB_OWNER]}>
              <Placeholder title="Lab" />
            </RequireRole>
          }
        />

        {/* Profile / Settings — header dropdown, all authenticated */}
        <Route
          path="/profile"
          element={
            <RequireRole
              allowedRoles={[
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.LAB_OWNER,
                ROLES.LAB_TECHNICIAN,
              ]}
            >
              <Placeholder title="Profile" desc="Profile settings." />
            </RequireRole>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireRole
              allowedRoles={[
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.LAB_OWNER,
                ROLES.LAB_TECHNICIAN,
              ]}
            >
              <Placeholder title="Account Settings" desc="Account settings." />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
