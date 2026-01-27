import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  FlaskConical,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
} from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">{trendLabel || trend}</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalLabs: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    expiringDocuments: 0,
    loading: true,
  })

  useEffect(() => {
    // Simulate API call - replace with actual API endpoint
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API call
        // const data = await api.get('/dashboard/stats')
        
        // Mock data for now
        setTimeout(() => {
          setStats({
            totalLabs: 12,
            pendingDocuments: 8,
            approvedDocuments: 145,
            expiringDocuments: 3,
            loading: false,
          })
        }, 500)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Here's an overview of your compliance dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Labs"
          value={stats.totalLabs}
          icon={FlaskConical}
          color="blue"
          trend="+2 this month"
        />
        <StatCard
          title="Pending Documents"
          value={stats.pendingDocuments}
          icon={Clock}
          color="yellow"
          trendLabel="Requires attention"
        />
        <StatCard
          title="Approved Documents"
          value={stats.approvedDocuments}
          icon={CheckCircle2}
          color="green"
          trend="+12 this week"
        />
        <StatCard
          title="Expiring Documents"
          value={stats.expiringDocuments}
          icon={AlertTriangle}
          color="red"
          trendLabel="Action needed"
        />
      </div>

      {/* Quick Actions / Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
            <a href="/documents" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Document {item}</p>
                  <p className="text-xs text-gray-500">Updated 2 hours ago</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Approved
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Upload New Document
            </button>
            <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Review Pending Documents
            </button>
            <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Generate Compliance Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
