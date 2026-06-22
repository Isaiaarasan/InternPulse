import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Target, Calendar, Trophy, FileText, CheckCircle } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { goalStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { goalService } from '../../services/goalService'
import { formatDate } from '../../utils/formatDate'
import toast from 'react-hot-toast'

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [goal, setGoal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    goalService.getGoalById(id)
      .then(res => setGoal(res.data.data || res.data))
      .catch(() => toast.error('Goal not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true)
    try {
      await goalService.updateGoalStatus(id!, status)
      setGoal({ ...goal, status })
      toast.success(`Goal marked as ${status}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="page-container"><div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" /></div>
  if (!goal) return null

  return (
    <div className="page-container space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted hover:text-primary-500 transition-colors">
        <ArrowLeft size={16} /> Back to Goals
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardBody className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
                  <Target size={22} className="text-primary-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primaryText">{goal.title}</h1>
                  <p className="text-xs text-muted mt-0.5">Week {goal.week}</p>
                </div>
              </div>
              <Badge variant={goalStatusBadge(goal.status)} className="shrink-0">{goal.status}</Badge>
            </div>

            <p className="text-sm text-secondary dark:text-gray-400 leading-relaxed mb-6">{goal.description}</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Calendar, label: 'Deadline', value: formatDate(goal.deadline) },
                { icon: Trophy, label: 'Points', value: `${goal.points} pts` },
                { icon: CheckCircle, label: 'Status', value: goal.status },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-muted" />
                    <span className="text-xs text-muted font-medium">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-primaryText">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {goal.status === 'Pending' && (
                <Button onClick={() => handleUpdateStatus('In-Progress')} isLoading={updating}>
                  Start Working
                </Button>
              )}
              {goal.status === 'In-Progress' && (
                <>
                  <Link to={`/intern/reports/new?goalId=${goal._id}`}>
                    <Button>
                      <FileText size={15} /> Submit Report
                    </Button>
                  </Link>
                  <Button variant="secondary" onClick={() => handleUpdateStatus('Submitted')} isLoading={updating}>
                    Mark as Submitted
                  </Button>
                </>
              )}
              {goal.status === 'Revision-Required' && (
                <Link to={`/intern/reports/new?goalId=${goal._id}`}>
                  <Button variant="destructive">
                    <FileText size={15} /> Resubmit Report
                  </Button>
                </Link>
              )}
              {goal.status === 'Approved' && (
                <div className="flex items-center gap-2 text-success font-semibold text-sm">
                  <CheckCircle size={18} /> Goal Approved! You earned {goal.points} points
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}
