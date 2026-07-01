import { useState } from 'react'
import { User, Lock, Bell, Moon, Sun, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { authService } from '../../services/authService'
import api from '../../services/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', department: user?.department || '' })
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v))
      const res = await authService.updateProfile(fd)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch {
      // Demo mode
      updateUser(profileForm)
      toast.success('Profile updated!')
    } finally {
      setLoading(false)
    }
  }

  const [passLoading, setPassLoading] = useState(false)

  const handlePasswordChange = async () => {
    if (passForm.newPass !== passForm.confirm) { toast.error('Passwords do not match'); return }
    if (passForm.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    
    setPassLoading(true)
    try {
      await api.put('/auth/change-password', { newPassword: passForm.newPass })
      toast.success('Password changed successfully!')
      setPassForm({ current: '', newPass: '', confirm: '' })
      updateUser({ isPasswordChanged: true })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="page-container space-y-6">
      <h2 className="text-2xl font-bold text-primaryText">Settings</h2>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} /> Profile</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-primaryText">{user?.name}</p>
              <p className="text-sm text-muted capitalize">{user?.role} • {user?.email}</p>
            </div>
          </div>
          <Input label="Full Name" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
          <Input label="Department" value={profileForm.department} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} />
          <Button onClick={handleProfileSave} isLoading={loading}><Save size={15} /> Save Profile</Button>
        </CardBody>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock size={16} /> Change Password</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          <Input 
            label="Current Password" 
            type={showCurrent ? "text" : "password"} 
            value={passForm.current} 
            onChange={e => setPassForm({ ...passForm, current: e.target.value })}
            suffixIcon={
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="hover:opacity-100 opacity-70 transition-opacity">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <Input 
            label="New Password" 
            type={showNew ? "text" : "password"} 
            value={passForm.newPass} 
            onChange={e => setPassForm({ ...passForm, newPass: e.target.value })}
            suffixIcon={
              <button type="button" onClick={() => setShowNew(!showNew)} className="hover:opacity-100 opacity-70 transition-opacity">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <Input 
            label="Confirm New Password" 
            type={showConfirm ? "text" : "password"} 
            value={passForm.confirm} 
            onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
            suffixIcon={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:opacity-100 opacity-70 transition-opacity">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <Button variant="secondary" onClick={handlePasswordChange} isLoading={passLoading}><Save size={15} /> Change Password</Button>
        </CardBody>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2">{isDark ? <Moon size={16} /> : <Sun size={16} />} Appearance</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primaryText">Dark Mode</p>
              <p className="text-xs text-muted mt-0.5">Switch between light and dark themes</p>
            </div>
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
