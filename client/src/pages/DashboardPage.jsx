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

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'brand' }) => {
  const colorClasses = {
    brand: 'bg-brand-primary/8 text-brand-primary border-brand-muted/30',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
    amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    red: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  }

  return (
    <div className="ldm-card rounded-2xl transition-shadow hover:shadow-soft-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-muted">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-primary sm:text-3xl">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-brand-muted">
              <TrendingUp className="h-4 w-4 text-accent-green" />
              <span>{trendLabel || trend}</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorClasses[color]}`}>
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
    const fetchStats = async () => {
      try {
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
        <div className="text-sm text-brand-muted">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface-elevated p-6 shadow-soft-lg">
        <h2 className="text-xl font-semibold text-brand-primary">
          Welcome back, {user?.name}!
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Here&apos;s an overview of your compliance dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <StatCard
          title="Total Labs"
          value={stats.totalLabs}
          icon={FlaskConical}
          color="brand"
          trend="+2 this month"
        />
        <StatCard
          title="Pending Documents"
          value={stats.pendingDocuments}
          icon={Clock}
          color="amber"
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
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Recent Documents */}
        <div className="ldm-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-primary">Recent Documents</h3>
            <a href="/documents" className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-brand-border/60 bg-brand-surface/50 p-3 transition-colors hover:bg-brand-muted/5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/8">
                  <FileText className="h-5 w-5 text-brand-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-primary">Document {item}</p>
                  <p className="text-xs text-brand-muted">Updated 2 hours ago</p>
                </div>
                <span className="shrink-0 rounded-lg bg-accent-green/10 px-2.5 py-1 text-xs font-medium text-accent-green">
                  Approved
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ldm-card">
          <h3 className="mb-4 text-lg font-semibold text-brand-primary">Quick Actions</h3>
          <div className="space-y-2">
            <button className="ldm-btn ldm-btn-secondary w-full justify-start rounded-xl text-left">
              Upload New Document
            </button>
            <button className="ldm-btn ldm-btn-secondary w-full justify-start rounded-xl text-left">
              Review Pending Documents
            </button>
            <button className="ldm-btn ldm-btn-secondary w-full justify-start rounded-xl text-left">
              Generate Compliance Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
