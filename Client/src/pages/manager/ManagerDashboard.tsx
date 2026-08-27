import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Target, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StatCardSkeleton } from '../../components/ui/Skeleton'
import { userService } from '../../services/userService'

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ interns: 0, activeGoals: 0, pendingReviews: 0, completedGoals: 0 })
  const [interns, setInterns] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const [internsRes, analyticsRes] = await Promise.all([
          userService.getInterns(),
          userService.getAnalytics(),
        ])
        setInterns((internsRes.data.data || internsRes.data || []).slice(0, 5))
        const a = analyticsRes.data.data || analyticsRes.data || {}
        setStats({
          interns: a.totalInterns || 0,
          activeGoals: a.activeGoals || 0,
          pendingReviews: a.pendingReviews || 0,
          completedGoals: a.completedGoals || 0,
        })
      } catch (err) {
        console.error("Manager Dashboard Error:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const statCards = [
    { label: 'Total Interns', value: stats.interns, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', to: '/manager/interns' },
    { label: 'Active Goals', value: stats.activeGoals, icon: Target, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', to: '/manager/goals/create' },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: Clock, color: 'text-warning', bg: 'bg-warning/10', to: '/manager/reviews' },
    { label: 'Goals Completed', value: stats.completedGoals, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', to: '/manager/analytics' },
  ]

  const chartData = [
    { name: 'Active', value: stats.activeGoals },
    { name: 'Completed', value: stats.completedGoals },
    { name: 'Reviews', value: stats.pendingReviews }
  ]

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primaryText">Manager Overview</h2>
          <p className="text-sm text-muted mt-1">Real-time team performance tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, color, bg, to }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={to} className="stat-card block group !p-4 sm:!p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <p className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon size={16} className={color} />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primaryText group-hover:text-primary-500 transition-colors">{value}</p>
                </Link>
              </motion.div>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Team Progress Metrics</CardTitle></CardHeader>
            <CardBody>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="#2563EB" radius={[10, 10, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Intern list */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <Link to="/manager/interns" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {interns.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="text-sm">No interns assigned yet.</p>
                </div>
              ) : (
                interns.map((intern) => (
                  <Link key={intern._id} to={`/manager/interns/${intern._id}`} className="flex items-center gap-3 p-3 rounded-xl border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {intern.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primaryText">{intern.name}</p>
                      <p className="text-xs text-muted">{intern.department || 'General'}</p>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="success">Active</Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/manager/goals/create" className="flex items-center gap-3 p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition-all hover:shadow-glow shadow-primary-500/20">
          <Target size={20} /> <span className="font-semibold text-sm">Create New Goal</span>
        </Link>
        <Link to="/manager/reviews" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 hover:shadow-hover text-primaryText rounded-2xl transition-all">
          <FileText size={20} className="text-warning" /> <span className="font-semibold text-sm">Review Queue ({stats.pendingReviews})</span>
        </Link>
        <Link to="/manager/analytics" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 hover:shadow-hover text-primaryText rounded-2xl transition-all">
          <Users size={20} className="text-primary-500" /> <span className="font-semibold text-sm">Team Analytics</span>
        </Link>
      </div>
    </div>
  )
}
