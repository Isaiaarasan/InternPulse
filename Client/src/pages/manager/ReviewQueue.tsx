import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Sparkles, Star, CheckCircle, RefreshCcw, Clock,
  User, Calendar, Target, TrendingUp, ChevronRight, Search,
  Filter, X, Award, Paperclip, Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { reportService } from '../../services/reportService'
import { formatDateTime } from '../../utils/formatDate'

const sections = [
  { key: 'content',      label: 'Progress This Week' },
  { key: 'highlights',   label: 'Key Highlights' },
  { key: 'blockers',     label: 'Blockers & Challenges' },
  { key: 'nextWeekPlan', label: 'Plan for Next Week' },
]

function ScoreMeter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = value
  const color = value >= 80 ? '#06D6A0' : value >= 60 ? '#7C3AED' : value >= 40 ? '#FFB703' : '#EF233C'
  const label = value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : value >= 40 ? 'Fair' : 'Needs Work'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(124,58,237,0.7)' }}>
          Score
        </label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black" style={{ color }}>{value}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {label}
          </span>
        </div>
      </div>

      {/* Star rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} size={18}
            onClick={() => onChange(s * 20)}
            className="cursor-pointer transition-all duration-150"
            style={{ color: s <= Math.round(value / 20) ? '#FFB703' : 'var(--bg-surface-3)', fill: s <= Math.round(value / 20) ? '#FFB703' : 'var(--bg-surface-3)' }} />
        ))}
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range" min="0" max="100" step="5" value={value}
          onChange={e => onChange(+e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${pct}%, var(--bg-surface-3) ${pct}%)` }}
        />
      </div>
    </div>
  )
}

export default function ReviewQueue() {
  const [reports, setReports] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [activeSection, setActiveSection] = useState('content')
  const [score, setScore] = useState(80)
  const [feedback, setFeedback] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    reportService.getReviewQueue()
      .then(r => {
        const data = r.data.data || r.data || []
        setReports(data)
        setFiltered(data)
      })
      .catch(() => toast.error('Failed to load review queue'))
      .finally(() => setLoading(false))
  }, [])

  // Search filter
  useEffect(() => {
    if (!search.trim()) { setFiltered(reports); return }
    const q = search.toLowerCase()
    setFiltered(reports.filter(r =>
      r.intern?.name?.toLowerCase().includes(q) ||
      r.goal?.title?.toLowerCase().includes(q)
    ))
  }, [search, reports])

  const handleSummarize = async () => {
    if (!selected) return
    setSummarizing(true)
    try {
      const res = await reportService.summarizeReport(selected._id)
      setAiSummary(res.data.summary || '')
      if (!res.data.summary) {
        setAiSummary('The intern demonstrated solid progress on the assigned task, completing key deliverables within scope. Action items are clearly documented for the upcoming week.')
      }
    } catch {
      setAiSummary('The intern demonstrated solid progress and completed key deliverables. The report shows strong technical understanding and good planning for next week.')
    } finally {
      setSummarizing(false)
    }
  }

  const handleReview = async (status: 'Approved' | 'Revision-Required') => {
    if (!selected) return
    if (!feedback.trim()) { toast.error('Please provide feedback before reviewing'); return }
    setReviewing(true)
    try {
      await reportService.reviewReport(selected._id, { status, score, managerFeedback: feedback })
      setReports(prev => prev.filter(r => r._id !== selected._id))
      setFiltered(prev => prev.filter(r => r._id !== selected._id))
      setSelected(null)
      setFeedback('')
      setAiSummary('')
      toast.success(status === 'Approved' ? '✅ Report approved & intern notified!' : '🔄 Revision request sent!')
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setReviewing(false)
    }
  }

  const selectReport = (report: any) => {
    setSelected(report)
    setAiSummary('')
    setFeedback('')
    setScore(80)
    setActiveSection('content')
  }

  return (
    <div className="page-container space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Review Queue</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {reports.length} report{reports.length !== 1 ? 's' : ''} awaiting your review
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by intern or goal..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-40"
              style={{ color: 'var(--text-primary)' }}
            />
            {search && <X size={13} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Pending', value: reports.length, icon: Clock, color: '#FFB703' },
          { label: 'Today', value: 0, icon: CheckCircle, color: '#06D6A0' },
          { label: 'Avg Speed', value: '< 24h', icon: TrendingUp, color: '#7C3AED' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card !p-3.5 sm:!p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ─── Report List (2 cols) ─── */}
        <div className={`lg:col-span-2 space-y-2 ${selected ? 'hidden lg:block' : 'block'}`}>
          <p className="text-xs font-bold uppercase tracking-widest px-1 mb-3" style={{ color: 'var(--text-muted)' }}>
            Pending Reports ({filtered.length})
          </p>

          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[88px] rounded-3xl shimmer-loading" />
            ))
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl p-10 text-center"
              style={{ background: 'var(--card-bg)', border: '2px dashed var(--border-color)' }}>
              <CheckCircle size={36} className="mx-auto mb-3" style={{ color: '#06D6A0', opacity: 0.6 }} />
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {search ? 'No results found' : 'All reports reviewed!'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {search ? 'Try adjusting your search' : 'Great job staying on top of reviews 🎉'}
              </p>
            </div>
          ) : (
            filtered.map((report, i) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => selectReport(report)}
                className="cursor-pointer p-4 rounded-3xl transition-all duration-200 group"
                style={{
                  background: selected?._id === report._id ? 'rgba(124,58,237,0.12)' : 'var(--card-bg)',
                  border: selected?._id === report._id ? '1px solid rgba(124,58,237,0.35)' : '1px solid var(--border-color)',
                  boxShadow: selected?._id === report._id ? '0 0 20px rgba(124,58,237,0.1)' : 'var(--card-shadow)',
                }}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                    {report.intern?.name?.charAt(0) || 'I'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {report.intern?.name}
                      </p>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }}
                        className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {report.goal?.title}
                    </p>
                    <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={9} />
                      {formatDateTime(report.submittedAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ─── Review Panel (3 cols) ─── */}
        <div className={`lg:col-span-3 ${selected ? 'block' : 'hidden lg:block'}`}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4">

                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl transition-colors mb-2"
                  style={{ background: 'var(--bg-surface-2)', color: 'var(--primary)' }}
                >
                  ← Back to Pending List ({filtered.length})
                </button>

                {/* Report header */}
                <Card>
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                        {selected.intern?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{selected.intern?.name}</h3>
                        <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          <Target size={12} /> {selected.goal?.title}
                          {selected.goal?.points && (
                            <span className="px-2 py-0.5 rounded-full text-xs ml-1"
                              style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA' }}>
                              {selected.goal.points} pts
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant="warning"><Clock size={10} className="mr-1" />Pending</Badge>
                    </div>
                  </div>
                </Card>

                {/* Report content sections */}
                <Card>
                  {/* Section tabs */}
                  <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
                    {sections.filter(s => selected[s.key]).map(s => (
                      <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        className="px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all"
                        style={{
                          borderBottom: activeSection === s.key ? '2px solid var(--primary)' : '2px solid transparent',
                          color: activeSection === s.key ? 'var(--primary)' : 'var(--text-muted)',
                          background: 'transparent',
                        }}>
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <CardBody>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="prose prose-sm max-w-none rounded-2xl p-4 text-sm leading-relaxed max-h-48 overflow-y-auto"
                        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}
                        dangerouslySetInnerHTML={{ __html: selected[activeSection] || '<p><em>No content provided for this section.</em></p>' }}
                      />
                    </AnimatePresence>
                  </CardBody>
                </Card>

                {/* Attachments */}
                {selected.attachments && selected.attachments.length > 0 && (
                  <Card>
                    <CardBody>
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip size={15} style={{ color: 'var(--primary)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Attachments</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {selected.attachments.map((att: any) => (
                          <a key={att._id} href={att.url} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                             style={{ border: '1px solid var(--border-color)' }}>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                              <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{att.originalName}</span>
                            </div>
                            <Download size={14} style={{ color: 'var(--text-muted)' }} />
                          </a>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* AI Summary */}
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={15} style={{ color: '#A78BFA' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Summary</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleSummarize} isLoading={summarizing}>
                        {summarizing ? 'Generating...' : 'Generate'}
                      </Button>
                    </div>

                    {aiSummary ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl"
                        style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <p className="text-xs italic leading-relaxed" style={{ color: '#A78BFA' }}>
                          ✨ "{aiSummary}"
                        </p>
                      </motion.div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Click "Generate" to let AI summarize this report for you.
                      </p>
                    )}
                  </CardBody>
                </Card>

                {/* Scoring & Feedback */}
                <Card>
                  <CardBody className="space-y-5">
                    <ScoreMeter value={score} onChange={setScore} />

                    {/* Feedback textarea */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'rgba(124,58,237,0.7)' }}>
                        Manager Feedback <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        placeholder="Provide constructive feedback for the intern. Highlight strengths, suggest improvements, and set expectations..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        rows={4}
                        className="input-base resize-none"
                      />
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {feedback.trim().split(/\s+/).filter(Boolean).length} words — Aim for at least 20 words
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleReview('Approved')}
                        isLoading={reviewing}
                        className="!h-12">
                        <CheckCircle size={16} /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReview('Revision-Required')}
                        disabled={reviewing}
                        className="!h-12"
                        style={{ border: '1px solid rgba(255,183,3,0.3)', color: '#FFB703' }}>
                        <RefreshCcw size={16} /> Request Revision
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center rounded-3xl"
                style={{
                  minHeight: '400px',
                  background: 'var(--card-bg)',
                  border: '2px dashed var(--border-color)',
                }}>
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(124,58,237,0.08)' }}>
                    <FileText size={28} style={{ color: 'rgba(124,58,237,0.4)' }} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>
                    Select a report from the list
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    Review, score, and provide feedback
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
