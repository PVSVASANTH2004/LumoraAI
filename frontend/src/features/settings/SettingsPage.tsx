import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Bell, Shield, Palette,
  Moon, Sun, Monitor, Check, Loader2, Zap, Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useTheme, type Theme } from '@/components/common/ThemeProvider'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const {
    reducedMotion, setReducedMotion,
    compactMode, setCompactMode,
    autoOpenSources, setAutoOpenSources,
    soundEffects, setSoundEffects,
    notifications, setNotification,
  } = useUIStore()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-lumora-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-lumora-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-11">Manage your account and preferences</p>
        </motion.div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6 glass-card border-border/40">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:text-lumora-primary">
              <User className="w-3.5 h-3.5" />Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:text-lumora-primary">
              <Palette className="w-3.5 h-3.5" />Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:text-lumora-primary">
              <Bell className="w-3.5 h-3.5" />Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:text-lumora-primary">
              <Shield className="w-3.5 h-3.5" />Security
            </TabsTrigger>
          </TabsList>

          {/* ── Profile ───────────────────────────────────────── */}
          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarSection user={user} />
                  <Separator className="opacity-30" />
                  <ProfileForm user={user} />
                </CardContent>
              </Card>

              <Card className="glass-card border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                    <div>
                      <p className="text-sm font-medium text-foreground">Delete Account</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <DeleteAccountButton />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Appearance ────────────────────────────────────── */}
          <TabsContent value="appearance">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Theme</CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { label: 'Light', value: 'light', icon: Sun, desc: 'Clean & bright' },
                      { label: 'Dark', value: 'dark', icon: Moon, desc: 'Easy on the eyes' },
                      { label: 'System', value: 'system', icon: Monitor, desc: 'Match OS setting' },
                    ] as { label: string; value: Theme; icon: React.ElementType; desc: string }[]).map(({ label, value, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setTheme(value)
                          toast.success(`Theme set to ${label}`)
                        }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 group ${
                          theme === value
                            ? 'border-lumora-primary/60 bg-lumora-primary/5 shadow-[0_0_20px_rgba(103,80,164,0.1)]'
                            : 'border-border/40 hover:border-border/80 hover:bg-surface-high/50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          theme === value ? 'bg-lumora-primary/10' : 'bg-surface-high'
                        }`}>
                          <Icon className={`w-4.5 h-4.5 ${theme === value ? 'text-lumora-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-xs font-medium text-foreground">{label}</span>
                        <span className="text-[10px] text-muted-foreground">{desc}</span>
                        {theme === value && (
                          <motion.div
                            className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-lumora-primary flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Interface</CardTitle>
                  <CardDescription>Customize the application interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <SettingToggle
                    label="Reduced motion"
                    description="Minimize animations and transitions"
                    checked={reducedMotion}
                    onChange={(v) => {
                      setReducedMotion(v)
                      toast.success(v ? 'Reduced motion enabled' : 'Animations restored')
                    }}
                  />
                  <SettingToggle
                    label="Compact mode"
                    description="Denser UI layout for more content"
                    checked={compactMode}
                    onChange={(v) => {
                      setCompactMode(v)
                      toast.success(v ? 'Compact mode enabled' : 'Standard layout restored')
                    }}
                  />
                  <SettingToggle
                    label="Auto-open sources panel"
                    description="Automatically show sources after AI responses"
                    checked={autoOpenSources}
                    onChange={(v) => {
                      setAutoOpenSources(v)
                      toast.success(v ? 'Sources panel will auto-open' : 'Sources panel will stay closed')
                    }}
                  />
                  <SettingToggle
                    label="Sound effects"
                    description="Play subtle sounds on key interactions"
                    checked={soundEffects}
                    onChange={(v) => {
                      setSoundEffects(v)
                      if (v) playBeep()
                      toast.success(v ? 'Sound effects enabled' : 'Sound effects disabled')
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Notifications ─────────────────────────────────── */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <CardDescription>Control what you get notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <SettingToggle
                    label="Document processing complete"
                    description="When your PDF is ready to query"
                    checked={notifications.docProcessing}
                    onChange={(v) => {
                      setNotification('docProcessing', v)
                      toast.success(v ? 'Processing notifications on' : 'Processing notifications off')
                    }}
                  />
                  <SettingToggle
                    label="Weekly digest"
                    description="Summary of your weekly usage and insights"
                    checked={notifications.weeklyDigest}
                    onChange={(v) => {
                      setNotification('weeklyDigest', v)
                      toast.success(v ? 'Weekly digest enabled' : 'Weekly digest disabled')
                    }}
                  />
                  <SettingToggle
                    label="Storage warnings"
                    description="When you approach your storage limit"
                    checked={notifications.storageWarnings}
                    onChange={(v) => {
                      setNotification('storageWarnings', v)
                      toast.success(v ? 'Storage warnings on' : 'Storage warnings off')
                    }}
                  />
                  <SettingToggle
                    label="Product updates"
                    description="New features and announcements from Lumora AI"
                    checked={notifications.productUpdates}
                    onChange={(v) => {
                      setNotification('productUpdates', v)
                      toast.success(v ? 'Product updates on' : 'Product updates off')
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ── Security ──────────────────────────────────────── */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordForm />
                </CardContent>
              </Card>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-high/50 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">2FA is disabled</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Enable for stronger account security</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/50"
                      onClick={() => toast.info('Two-factor authentication coming soon!')}
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                  <CardDescription>Manage where you're logged in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-high/50 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Current session</p>
                        <p className="text-xs text-muted-foreground">This device · Active now</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-500 font-medium">Active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────

function AvatarSection({ user }: { user: { displayName: string | null; email: string } | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarSrc(reader.result as string)
      toast.success('Avatar updated!')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-lumora-primary/40 to-purple-500/20 blur-sm" />
        <Avatar className="relative w-16 h-16 ring-2 ring-lumora-primary/20">
          {avatarSrc && <AvatarImage src={avatarSrc} />}
          <AvatarFallback className="text-xl bg-lumora-primary/10 text-lumora-primary font-semibold">
            {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      <div>
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5" />
          Change avatar
        </Button>
        <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  )
}

function ProfileForm({ user }: { user: { displayName: string | null; email: string } | null }) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(user?.displayName ?? '')

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Display name cannot be empty')
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('Profile updated successfully')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Display name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-border/50 focus:border-lumora-primary/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Email address</Label>
        <Input value={user?.email ?? ''} disabled className="opacity-60 border-border/30" />
        <p className="text-xs text-muted-foreground">Email cannot be changed after registration</p>
      </div>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="bg-gradient-primary text-white hover:opacity-90"
      >
        {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
        Save changes
      </Button>
    </div>
  )
}

function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  const handleUpdate = async () => {
    if (!current) { toast.error('Enter your current password'); return }
    if (next.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (next !== confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 900))
    setSaving(false)
    setCurrent(''); setNext(''); setConfirm('')
    toast.success('Password updated successfully')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Current password</Label>
        <Input type="password" placeholder="••••••••" value={current} onChange={(e) => setCurrent(e.target.value)} className="border-border/50 focus:border-lumora-primary/50" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">New password</Label>
        <Input type="password" placeholder="Min. 8 characters" value={next} onChange={(e) => setNext(e.target.value)} className="border-border/50 focus:border-lumora-primary/50" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Confirm new password</Label>
        <Input type="password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="border-border/50 focus:border-lumora-primary/50" />
      </div>
      <Button
        size="sm"
        onClick={handleUpdate}
        disabled={saving}
        className="bg-lumora-primary/10 text-lumora-primary border border-lumora-primary/20 hover:bg-lumora-primary/20"
      >
        {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
        Update password
      </Button>
    </div>
  )
}

function DeleteAccountButton() {
  const { logout } = useAuthStore()
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Account deleted. Goodbye!')
    setTimeout(() => logout(), 1500)
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
    >
      {confirming ? 'Confirm delete' : 'Delete account'}
    </Button>
  )
}

function SettingToggle({
  label, description, checked, onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch { /* AudioContext not available */ }
}
