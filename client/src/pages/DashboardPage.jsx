import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLab } from '../contexts/LabContext'
import { ROLES } from '../constants/roles'
import { documentService } from '../services/document'
import { listMachineTypes } from '../services/machineType'
import { listMachineInstances } from '../services/machineInstance'
import {
  FlaskConical,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Upload,
  Server,
  Activity,
  ChevronRight
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
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
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
  const { selectedLab } = useLab()
  const [stats, setStats] = useState({
    // Shared Stats
    machineTypes: 0,
    machineInstances: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,

    // Admin/Other roles stats
    totalLabs: 0,
    expiringDocuments: 0,

    loading: true,
  })

  const [recentDocuments, setRecentDocuments] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === ROLES.LAB_TECHNICIAN) {
          // Fetch real data for Lab Technician
          const [
            machineTypesData,
            machineInstancesData,
            pendingDocsData,
            approvedDocsData,
            recentDocsData
          ] = await Promise.all([
            listMachineTypes({ limit: 1 }), // Just to get total count
            listMachineInstances({ limit: 1 }), // Just to get total count filtered by rolw
            documentService.getMyDocuments({ status: 'PENDING', limit: 1 }),
            documentService.getMyDocuments({ status: 'APPROVED', limit: 1 }),
            documentService.getMyDocuments({ limit: 5 })
          ])

          setStats({
            machineTypes: machineTypesData.pagination?.total || 0,
            machineInstances: machineInstancesData.pagination?.total || 0,
            pendingDocuments: pendingDocsData.pagination?.total || 0,
            approvedDocuments: approvedDocsData.pagination?.total || 0,
            loading: false
          })

          setRecentDocuments(recentDocsData.data || [])
        } else if (user?.role === ROLES.LAB_OWNER) {
          // Fetch real data for Lab Owner
          // Filter by selectedLab if available
          const labId = selectedLab?.id

          const [
            machineTypesData,
            machineInstancesData,
            pendingDocsData,
            approvedDocsData,
            recentDocsData
          ] = await Promise.all([
            listMachineTypes({ limit: 1 }), // Machine Types are global
            listMachineInstances({ limit: 1, labId }), // Filtered by lab
            documentService.getLabOwnerDocuments({ status: 'PENDING', limit: 1, labId }),
            documentService.getLabOwnerDocuments({ status: 'APPROVED', limit: 1, labId }),
            documentService.getLabOwnerDocuments({ limit: 5, labId })
          ])

          setStats({
            machineTypes: machineTypesData.pagination?.total || 0,
            machineInstances: machineInstancesData.pagination?.total || 0,
            pendingDocuments: pendingDocsData.pagination?.total || 0,
            approvedDocuments: approvedDocsData.pagination?.total || 0,
            loading: false
          })

          setRecentDocuments(recentDocsData.data || [])
        } else {
          // Mock data for other roles
          setTimeout(() => {
            setStats({
              totalLabs: 12,
              pendingDocuments: 8,
              approvedDocuments: 145,
              expiringDocuments: 3,
              loading: false,
            })
            setRecentDocuments([
              { _id: 1, name: 'Safety Protocol v1.0', updatedAt: new Date(), status: 'APPROVED' },
              { _id: 2, name: 'Safety Protocol v2.0', updatedAt: new Date(), status: 'APPROVED' },
              { _id: 3, name: 'Safety Protocol v3.0', updatedAt: new Date(), status: 'APPROVED' }
            ])
          }, 800)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, selectedLab])

  if (stats.loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  // Render Dashboard for Lab Technician OR Lab Owner (Shared Design)
  if (user?.role === ROLES.LAB_TECHNICIAN || user?.role === ROLES.LAB_OWNER) {
    const isOwner = user?.role === ROLES.LAB_OWNER

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            {isOwner && selectedLab
              ? `Viewing data for: ${selectedLab.name}`
              : "Here's an overview of your lab activities and documents."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Machine Type"
            value={stats.machineTypes}
            icon={Server}
            color="primary"
          />
          <StatCard
            title="Machine Instance"
            value={stats.machineInstances}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Pending Documents"
            value={stats.pendingDocuments}
            icon={Clock}
            color="amber"
            trendLabel={stats.pendingDocuments > 0 ? "Requires attention" : "All caught up"}
          />
          <StatCard
            title="Approved Documents"
            value={stats.approvedDocuments}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Recent Documents & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Documents */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to={isOwner ? "/lab-owner-documents" : "/documents"}>View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent documents found.</p>
                ) : (
                  recentDocuments.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated {doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        doc.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-600" :
                          doc.status === 'REJECTED' ? "bg-red-500/10 text-red-600" :
                            "bg-amber-500/10 text-amber-600"
                      )}>
                        {doc.status}
                      </div>
                    </div>
                  ))
                )}
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
                <Link to={isOwner ? "/lab-owner-documents" : "/documents"}>
                  <span className="flex items-center gap-2">
                    <div className="p-1 bg-primary/10 rounded-md">
                      {isOwner ? <FileText className="h-4 w-4 text-primary" /> : <Upload className="h-4 w-4 text-primary" />}
                    </div>
                    {isOwner ? "View Documents" : "Upload New Document"}
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                <Link to="/machine-types">
                  <span className="flex items-center gap-2">
                    <div className="p-1 bg-blue-500/10 rounded-md"><Server className="h-4 w-4 text-blue-600" /></div>
                    Machine Type
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                <Link to="/machine-instance-management">
                  <span className="flex items-center gap-2">
                    <div className="p-1 bg-purple-500/10 rounded-md"><Activity className="h-4 w-4 text-purple-600" /></div>
                    Machine Instance
                  </span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fallback for other roles (Keep existing mock layout)
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
