import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Target, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { goalService } from '../../services/goalService'
import { userService } from '../../services/userService'

const steps = [
  { id: 1, label: 'Goal Details', icon: Target },
  { id: 2, label: 'Assign Interns', icon: Users },
  { id: 3, label: 'Set Deadline', icon: Calendar },
]

export default function GoalWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [interns, setInterns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', points: 50, week: 1,
    assignedTo: [] as string[], deadline: '',
  })

  useEffect(() => {
    userService.getInterns()
      .then(r => setInterns(r.data.data || r.data))
      .catch(() => toast.error('Failed to load interns'))
  }, [])

  const toggleIntern = (id: string) => {
    setForm(f => ({
      ...f,
      assignedTo: f.assignedTo.includes(id)
        ? f.assignedTo.filter(x => x !== id)
        : [...f.assignedTo, id],
    }))
  }

  const handleSubmit = async () => {
    if (!form.title || !form.deadline || form.assignedTo.length === 0) {
      toast.error('Please complete all required fields')
      return
    }
    setLoading(true)
    try {
      await goalService.createGoal(form)
      toast.success(`Goal assigned to ${form.assignedTo.length} intern(s) 🎯`)
      navigate('/manager/interns')
    } catch {
      toast.error('Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primaryText">Create Weekly Goal</h2>
        <p className="text-sm text-muted mt-1">A 3-step process to set clear, measurable goals for your interns</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map(({ id, label, icon: Icon }, i) => (
          <div key={id} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${step >= id ? 'text-primary-600 dark:text-primary-400' : 'text-muted'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${step > id ? 'bg-success text-white' : step === id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {step > id ? <CheckCircle size={14} /> : <Icon size={14} />}
              </div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > id ? 'bg-success' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        <Card>
          <CardBody className="pt-6 space-y-4">
            {step === 1 && (
              <>
                <Input label="Goal Title *" placeholder="e.g., Build a RESTful API with Express.js" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary dark:text-gray-200">Description</label>
                  <textarea
                    placeholder="Describe what the intern should accomplish..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="input-base resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-secondary dark:text-gray-200">Points</label>
                    <input type="number" min="10" max="100" step="5" value={form.points} onChange={e => setForm({ ...form, points: +e.target.value })} className="input-base" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-secondary dark:text-gray-200">Week Number</label>
                    <input type="number" min="1" max="52" value={form.week} onChange={e => setForm({ ...form, week: +e.target.value })} className="input-base" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <p className="text-sm font-medium text-secondary dark:text-gray-200 mb-3">Select Interns *</p>
                <div className="space-y-2">
                  {interns.map(intern => (
                    <label key={intern._id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.assignedTo.includes(intern._id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border dark:border-gray-700 hover:border-primary-300'}`}>
                      <input type="checkbox" checked={form.assignedTo.includes(intern._id)} onChange={() => toggleIntern(intern._id)} className="w-4 h-4 accent-primary-500" />
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">{intern.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-primaryText">{intern.name}</p>
                        <p className="text-xs text-muted">{intern.department}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {form.assignedTo.length > 0 && <p className="text-xs text-primary-500 font-medium mt-2">{form.assignedTo.length} intern(s) selected</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-secondary dark:text-gray-200">Deadline *</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-base" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">Review Summary</p>
                  <p className="text-sm text-secondary dark:text-gray-400"><strong>Title:</strong> {form.title}</p>
                  <p className="text-sm text-secondary dark:text-gray-400"><strong>Interns:</strong> {form.assignedTo.length} selected</p>
                  <p className="text-sm text-secondary dark:text-gray-400"><strong>Points:</strong> {form.points}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              {step > 1 ? (
                <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>
              ) : <div />}
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !form.title}>Next Step</Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={loading}>Create Goal 🎯</Button>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}
