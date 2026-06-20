import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Target, FileText, CheckCircle, AlertCircle, X, Clock, Sparkles } from 'lucide-react'
import { useNotifStore } from '../../stores/notifStore'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { timeAgo } from '../../utils/formatDate'
import api from '../../services/api'
import toast from 'react-hot-toast'

const typeConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  goal_assigned:    { icon: Target,      label: 'Goal Assigned',     color: '#7C3AED', bg: 'rgba(124,58,237,0.15)' },
  report_submitted: { icon: FileText,    label: 'Report Submitted',  color: '#FFB703', bg: 'rgba(255,183,3,0.12)'  },
  report_approved:  { icon: CheckCircle, label: 'Report Approved',   color: '#06D6A0', bg: 'rgba(6,214,160,0.12)'  },
  report_rejected:  { icon: AlertCircle, label: 'Revision Requested',color: '#EF233C', bg: 'rgba(239,35,60,0.12)'  },
  reminder:         { icon: Clock,       label: 'Reminder',          color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
}

export default function NotificationsCenter() {
  const { notifications, unreadCount, isLoading, fetchAll, markAllRead, markRead } = useNotifStore()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => { fetchAll() }, [])

  const displayed = filter === 'unread'
    ? notifications.filter((n: any) => !n.isRead)
    : notifications

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(id)
    try {
      await api.delete(`/notifications/${id}`)
      await fetchAll()
      toast.success('Notification dismissed')
    } catch {
      toast.error('Could not dismiss notification')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page-container space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0
              ? <><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{unreadCount} unread</span> notifications</>
              : 'All notifications'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === f ? 'var(--primary)' : 'var(--bg-surface-2)',
                  color: filter === f ? '#fff' : 'var(--text-muted)',
                }}>
                {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 rounded-3xl shimmer-loading" />)}
        </div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(124,58,237,0.08)' }}>
                <Bell size={28} style={{ color: 'rgba(124,58,237,0.4)' }} />
              </div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {filter === 'unread' ? "You're all caught up 🎉" : 'Notifications from goals, reports, and reminders will appear here'}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {displayed.map((notif: any, i: number) => {
              const cfg = typeConfig[notif.type] || typeConfig.reminder
              const Icon = cfg.icon
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markRead(notif._id)}
                  className="flex items-start gap-4 p-5 rounded-3xl cursor-pointer transition-all duration-200 group relative"
                  style={{
                    background: !notif.isRead ? `${cfg.bg.replace(')', ', 0.08)').replace('rgba', 'rgba')}` : 'var(--card-bg)',
                    border: !notif.isRead ? `1px solid ${cfg.color}25` : '1px solid var(--border-color)',
                    boxShadow: 'var(--card-shadow)',
                  }}>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg }}>
                    <Icon size={17} style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-primary)', fontWeight: notif.isRead ? 400 : 600 }}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Unread dot + dismiss button */}
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                    )}
                    <button
                      onClick={(e) => handleDelete(notif._id, e)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(239,35,60,0.1)' }}
                      disabled={deleting === notif._id}
                      title="Dismiss">
                      <X size={12} style={{ color: '#EF233C' }} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* CRON info banner */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <Sparkles size={16} style={{ color: '#7C3AED', marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: '#A78BFA' }}>Automated Notification Schedule</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            📋 <b>Friday 5PM</b> — Intern submission reminders &nbsp;·&nbsp;
            📊 <b>Monday 9AM</b> — Manager review briefing &nbsp;·&nbsp;
            🚨 <b>Hourly</b> — Overdue task alerts &nbsp;·&nbsp;
            📈 <b>Sunday 8PM</b> — Weekly digest
          </p>
        </div>
      </div>
    </div>
  )
}
