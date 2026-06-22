import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import api from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import LogoImage from '../../assets/Logo.png'

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await api.put('/auth/change-password', { newPassword: password })
      toast.success('Password changed successfully! 🔐')
      updateUser({ isPasswordChanged: true })
      navigate('/profile-setup')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden auth-bg">

      {/* Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', borderRadius:'50%' }} />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)', borderRadius:'50%' }} />
      
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LogoImage} alt="InternPulse" className="h-14 object-contain" />
        </div>

        <div className="rounded-3xl p-8" style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Secure Your Account</h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(248,248,255,0.4)' }}>
              Set a personal password to protect your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefixIcon={<Lock size={16} />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat your password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              prefixIcon={<ShieldCheck size={16} />}
              error={confirm && password !== confirm ? 'Passwords do not match' : ''}
            />
            <Button type="submit" className="w-full !h-12 mt-2 text-base" isLoading={loading}>
              Update Password <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(248,248,255,0.2)' }}>
          🔒 Your password is encrypted end-to-end
        </p>
      </motion.div>
    </div>
  )
}
