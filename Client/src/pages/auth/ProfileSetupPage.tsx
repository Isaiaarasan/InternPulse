import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, CheckCircle, Building, FileText, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import LogoImage from '../../assets/Logo.png'

const steps = [
  { label: 'Password',  done: true },
  { label: 'Profile',   done: false },
  { label: 'Complete',  done: false },
]

export default function ProfileSetupPage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', department: '', bio: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.department) return toast.error('Please specify your department')
    setLoading(true)
    try {
      const res = await api.put('/auth/onboard', { department: form.department, bio: form.bio, name: form.name })
      updateUser({ ...res.data.data, isOnboarded: true })
      toast.success('Welcome to InternPulse! 🚀')
      const dashboardHref =
        user?.role === 'manager' ? '/manager/dashboard' :
        user?.role === 'admin'   ? '/admin/users' : '/intern/dashboard'
      navigate(dashboardHref)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden auth-bg">

      {/* Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius:'50%', transform:'translate(30%,-30%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)', borderRadius:'50%', transform:'translate(-30%,30%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={LogoImage} alt="InternPulse" className="h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white">Welcome aboard! 👋</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(248,248,255,0.45)' }}>
            Let's finish setting up your profile before you dive in.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s.done ? 'text-white' : i === 1 ? 'text-white' : 'text-gray-600'}`}
                style={{
                  background: s.done
                    ? 'linear-gradient(135deg, #06D6A0, #059669)'
                    : i === 1
                    ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                    : 'rgba(48,48,80,0.8)',
                  boxShadow: s.done ? '0 0 10px rgba(6,214,160,0.5)' : i === 1 ? '0 0 10px rgba(124,58,237,0.5)' : 'none',
                }}>
                {s.done ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block"
                style={{ color: s.done ? '#06D6A0' : i === 1 ? '#A78BFA' : 'rgba(248,248,255,0.3)' }}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-8 h-px mx-1" style={{ background: i === 0 ? 'rgba(6,214,160,0.4)' : 'rgba(124,58,237,0.15)' }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleComplete}>
          <div className="rounded-3xl p-8" style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--card-shadow)',
          }}>
            <div className="space-y-5">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                prefixIcon={<User size={16} />}
                hint="Your legal name as it will appear on your certificate"
              />
              <Input
                label="Department / Team"
                placeholder="e.g., Engineering, Marketing, Design"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                prefixIcon={<Building size={16} />}
              />
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'rgba(167,139,250,0.7)' }}>
                  Short Bio <span className="normal-case font-normal ml-1" style={{ color: 'rgba(248,248,255,0.3)' }}>(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-4" style={{ color: 'rgba(124,58,237,0.6)' }}>
                    <FileText size={16} />
                  </span>
                  <textarea
                    className="input-base pl-11 min-h-[100px] resize-none"
                    placeholder="Tell the team a bit about yourself, your skills, and what you're excited to learn..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Button type="submit" className="w-full !h-12 text-base" isLoading={loading}>
              Complete Setup <CheckCircle size={18} />
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
