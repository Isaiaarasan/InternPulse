import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, FileText, Trophy, TrendingUp, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StatCardSkeleton } from '../../components/ui/Skeleton'
import { goalService } from '../../services/goalService'
import { userService } from '../../services/userService'
import { formatDate } from '../../utils/formatDate'
import { goalStatusBadge } from '../../components/ui/Badge'

interface Stats {
  goalsAssigned: number
  goalsCompleted: number
  pendingReports: number
  overallScore: number
}

export default function InternDashboard() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<any[]>([])
  const [stats, setStats] = useState<Stats>({ goalsAssigned: 0, goalsCompleted: 0, pendingReports: 0, overallScore: 0 })

  useEffect(() => {
    const init = async () => {
      try {
        const [goalsRes, analyticsRes] = await Promise.all([
          goalService.getMyGoals(),
          // For intern, analytics can be scoped to them or we just calculate from goals
          Promise.resolve({ data: { data: null } }) 
        ])
        
        const g: any[] = goalsRes.data.data || goalsRes.data || []
        setGoals(g.slice(0, 5))
        
        const completed = g.filter((x: any) => x.status === 'Approved').length
        const pending = g.filter((x: any) => x.status === 'Submitted' || x.status === 'In-Progress').length
        
        setStats({
          goalsAssigned: g.length,
          goalsCompleted: completed,
          pendingReports: pending,
          overallScore: g.length > 0 ? Math.round((completed / g.length) * 100) : 0,
        })
      } catch (err) {
        console.error("Dashboard Load Error:", err)
      } finally {
        setLoading(false)
      }
    }
    if (user) init()
  }, [user])

  const statCards = [
    { label: 'Goals Assigned', value: stats.goalsAssigned, icon: Target, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Goals Completed', value: stats.goalsCompleted, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Active Tasks', value: stats.pendingReports, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Success Rate', value: `${stats.overallScore}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]

  // Dynamic Chart Data from real goals
  const chartData = [
    { name: 'Completed', value: stats.goalsCompleted },
    { name: 'Pending', value: stats.goalsAssigned - stats.goalsCompleted }
  ]

  return (
    <div className="page-container space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-primaryText">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-muted text-sm mt-1">
          Here's your real-time internship progress
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="stat-card !p-4 sm:!p-6"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <p className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primaryText">{value}</p>
              </motion.div>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader><CardTitle>Goal Completion Overview</CardTitle></CardHeader>
          <CardBody>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Active Goals</CardTitle>
          <Link to="/intern/goals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </CardHeader>
        <CardBody>
          {goals.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Target size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-base font-medium">No goals assigned yet.</p>
              <p className="text-sm">Once a manager assigns tasks, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <Link
                  key={goal._id}
                  to={`/intern/goals/${goal._id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-primary">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primaryText group-hover:text-primary transition-colors">{goal.title}</p>
                      <p className="text-xs text-muted mt-0.5">Due {formatDate(goal.deadline)}</p>
                    </div>
                  </div>
                  <Badge variant={goalStatusBadge(goal.status)}>{goal.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link 
          to="/intern/reports/new" 
          className="flex items-center gap-4 p-5 bg-primary text-white rounded-3xl transition-all hover:shadow-glow hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight">Submit Weekly Report</span>
        </Link>
        
        <Link 
          to="/intern/goals" 
          className="flex items-center gap-4 p-5 bg-card border border-border hover:border-primary/30 text-primaryText rounded-3xl transition-all hover:shadow-card hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Target size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight text-primaryText">View My Goals</span>
        </Link>
        
        <Link 
          to="/intern/leaderboard" 
          className="flex items-center gap-4 p-5 bg-card border border-border hover:border-warning/30 text-primaryText rounded-3xl transition-all hover:shadow-card hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
            <Trophy size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight text-primaryText">Leaderboard</span>
        </Link>
      </div>
    </div>
  )
}
