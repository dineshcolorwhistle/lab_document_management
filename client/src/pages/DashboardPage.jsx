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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { cn } from '../utils/cn'

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary' }) => {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    red: 'bg-red-500/10 text-red-600 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {trend && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>{trendLabel || trend}</span>
              </div>
            )}
            {trendLabel && !trend && (
              <div className={cn("mt-2 flex items-center gap-1.5 text-sm font-medium", color === 'red' ? 'text-red-600' : 'text-amber-600')}>
                <span>{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border", colorStyles[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
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
        }, 800)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your compliance status and recent activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Labs"
          value={stats.totalLabs}
          icon={FlaskConical}
          color="primary"
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Documents - spanning 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/documents">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Safety Protocol v{item}.0</p>
                      <p className="text-xs text-muted-foreground">Updated 2 hours ago by Admin</p>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                    Approved
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <a href="/upload">
                <span className="flex items-center gap-2">
                  <div className="p-1 bg-primary/10 rounded-md"><FileText className="h-4 w-4 text-primary" /></div>
                  Upload New Document
                </span>
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <a href="/pending">
                <span className="flex items-center gap-2">
                  <div className="p-1 bg-amber-500/10 rounded-md"><Clock className="h-4 w-4 text-amber-600" /></div>
                  Review Pending
                </span>
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
              <a href="/reports">
                <span className="flex items-center gap-2">
                  <div className="p-1 bg-blue-500/10 rounded-md"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
                  Generate Report
                </span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
