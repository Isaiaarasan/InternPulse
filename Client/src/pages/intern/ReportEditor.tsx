import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  FileText, ArrowLeft, Send, Target, CheckCircle,
  AlertTriangle, BookOpen, Calendar, Lightbulb, TrendingUp, Paperclip, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { goalService } from '../../services/goalService'
import { reportService } from '../../services/reportService'
import { formatDate } from '../../utils/formatDate'

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
}
const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'blockquote', 'code-block', 'link']

const tips = [
  { icon: CheckCircle, text: 'Describe what you accomplished — be specific with tasks & outputs', color: '#06D6A0' },
  { icon: AlertTriangle, text: 'Mention blockers honestly — managers can help resolve them', color: '#FFB703' },
  { icon: BookOpen, text: 'Share key learnings from courses, documentation, or experimentation', color: '#7C3AED' },
  { icon: Target, text: 'Set clear goals for next week — makes your next review easier', color: '#4F46E5' },
  { icon: Lightbulb, text: 'Include ideas or suggestions you have for the project', color: '#06B6D4' },
]

const sections = [
  { key: 'content',      label: '📋 Progress This Week',  placeholder: 'What tasks did you complete? What was delivered? Mention PRs, features, bugs fixed...' },
  { key: 'highlights',   label: '🌟 Key Highlights',      placeholder: 'Your biggest achievement or learning this week...' },
  { key: 'blockers',     label: '🚧 Blockers & Challenges', placeholder: 'What slowed you down? Any technical issues, unclear requirements, or dependencies?' },
  { key: 'nextWeekPlan', label: '🎯 Plan for Next Week',  placeholder: 'What will you work on next week? List 3-5 specific goals...' },
]

export default function ReportEditor() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [goals, setGoals] = useState<any[]>([])
  const [selectedGoal, setSelectedGoal] = useState(searchParams.get('goalId') || '')
  const [activeSection, setActiveSection] = useState('content')
  const [form, setForm] = useState({ content: '', highlights: '', blockers: '', nextWeekPlan: '' })
  const [loading, setLoading] = useState(false)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)

  const totalWords = Object.values(form).join(' ').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
  const progress = Math.min(100, Math.round((totalWords / 150) * 100))
  const selectedGoalObj = goals.find(g => g._id === selectedGoal)

  useEffect(() => {
    goalService.getMyGoals()
      .then(res => {
        const all = res.data.data || res.data || []
        setGoals(all.filter((g: any) => ['In-Progress', 'Revision-Required', 'Pending'].includes(g.status)))
      })
      .catch(() => toast.error('Could not load goals'))
      .finally(() => setGoalsLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedGoal) { toast.error('Please select a goal first'); return }
    if (totalWords < 20) { toast.error('Please write at least 20 words across your report sections'); return }
    setLoading(true)
    try {
      await reportService.submitReport({
        goal: selectedGoal,
        content: form.content,
        highlights: form.highlights,
        blockers: form.blockers,
        nextWeekPlan: form.nextWeekPlan,
        attachments: attachments.map(a => a._id),
      })
      setSubmitted(true)
      toast.success('Report submitted! Great work this week 🎉')
      setTimeout(() => navigate('/intern/reports/history'), 2000)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const res = await reportService.uploadAttachment(file);
      const newAttachment = res.data.data;
      setAttachments(prev => [...prev, newAttachment]);
      toast.success('File attached successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a._id !== id));
  };

  // ─── Success screen ───────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.6, repeat: 3 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(6,214,160,0.15)', border: '2px solid rgba(6,214,160,0.3)' }}>
            <CheckCircle size={40} style={{ color: '#06D6A0' }} />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Report Submitted!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your manager will review it and provide feedback soon.</p>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Redirecting to history...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">

      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
        <ArrowLeft size={15} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Weekly Report Editor
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Document your progress, blockers, and plans for the week
            </p>
          </div>
          {/* Word count pill */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl"
            style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
            <TrendingUp size={15} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{totalWords} words</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: 150+</p>
            </div>
            {/* Mini progress ring */}
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke="#7C3AED"
                strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 11}`}
                strokeDashoffset={`${2 * Math.PI * 11 * (1 - progress / 100)}`}
                transform="rotate(-90 14 14)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
            </svg>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ─── LEFT: Main Editor ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Goal Selector */}
            <div className="rounded-3xl p-5 space-y-3"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)', opacity: 0.8 }}>
                Reporting For
              </label>
              {goalsLoading ? (
                <div className="h-12 rounded-2xl shimmer-loading" />
              ) : goals.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)' }}>
                  <AlertTriangle size={16} style={{ color: '#FFB703' }} />
                  <p className="text-sm" style={{ color: '#FFB703' }}>
                    No active goals found. Ask your manager to assign goals first.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedGoal}
                  onChange={e => setSelectedGoal(e.target.value)}
                  className="input-base"
                  style={{ cursor: 'pointer' }}>
                  <option value="">Choose a goal to report on...</option>
                  {goals.map(g => (
                    <option key={g._id} value={g._id}>
                      {g.title} — {g.status} {g.deadline ? `(Due ${formatDate(g.deadline)})` : ''}
                    </option>
                  ))}
                </select>
              )}

              {/* Goal metadata pill */}
              {selectedGoalObj && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-wrap"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Target size={14} style={{ color: '#7C3AED' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedGoalObj.title}</span>
                  {selectedGoalObj.points && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}>
                      {selectedGoalObj.points} pts
                    </span>
                  )}
                  {selectedGoalObj.deadline && (
                    <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={11} /> Due {formatDate(selectedGoalObj.deadline)}
                    </span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 flex-wrap">
              {sections.map(s => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200"
                  style={activeSection === s.key
                    ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }
                    : { background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                  {s.label.split(' ')[0]} {s.label.split(' ').slice(1).join(' ')}
                  {/* Completion dot */}
                  {form[s.key as keyof typeof form].replace(/<[^>]*>/g, '').trim().length > 10 && (
                    <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full align-middle" style={{ background: '#06D6A0' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Quill Editor for active section */}
            {sections.map(s => (
              <div key={s.key} style={{ display: activeSection === s.key ? 'block' : 'none' }}>
                <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                  <div className="px-4 py-3 text-xs font-semibold"
                    style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    {s.label}
                  </div>
                  <ReactQuill
                    theme="snow"
                    value={form[s.key as keyof typeof form]}
                    onChange={(val) => setForm(f => ({ ...f, [s.key]: val }))}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder={s.placeholder}
                    style={{ minHeight: '220px' }}
                  />
                </div>
              </div>
            ))}

            {/* File Attachments */}
            <div className="rounded-3xl p-5 space-y-3"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)', opacity: 0.8 }}>
                  Attachments
                </label>
                <label className="cursor-pointer text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>
                  <Paperclip size={14} /> {uploadingFile ? 'Uploading...' : 'Attach File'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachments.map(att => (
                    <div key={att._id} className="flex items-center justify-between p-2 rounded-xl" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{att.originalName}</span>
                      </div>
                      <button onClick={() => removeAttachment(att._id)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <X size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              size="lg"
              className="w-full !h-14 text-base">
              <Send size={18} /> Submit Weekly Report
            </Button>
          </div>

          {/* ─── RIGHT: Sidebar ─── */}
          <div className="space-y-4">

            {/* Completion status */}
            <Card>
              <CardHeader><CardTitle>Report Completeness</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                {sections.map(s => {
                  const text = form[s.key as keyof typeof form].replace(/<[^>]*>/g, '').trim()
                  const words = text.split(/\s+/).filter(Boolean).length
                  const pct = Math.min(100, Math.round((words / 40) * 100))
                  const done = words >= 40
                  return (
                    <div key={s.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: done ? '#06D6A0' : 'var(--text-muted)' }}>
                          {done ? '✓ ' : ''}{s.label.split(' ').slice(1).join(' ')}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{words}/40w</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-2)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: done ? '#06D6A0' : 'var(--primary)' }} />
                      </div>
                    </div>
                  )
                })}
              </CardBody>
            </Card>

            {/* Writing tips */}
            <Card>
              <CardHeader><CardTitle>Writing Guide</CardTitle></CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {tips.map(({ icon: Icon, text, color }) => (
                    <li key={text} className="flex items-start gap-3">
                      <Icon size={14} style={{ color, marginTop: 2, flexShrink: 0 }} />
                      <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{text}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {/* Reminder box */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#A78BFA' }}>💡 Pro Tip</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Aim for 150+ words across all sections. Detailed reports lead to better feedback and higher scores from your manager.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
