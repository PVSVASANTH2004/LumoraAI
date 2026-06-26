import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, MessageSquare, BookOpen,
  History, Upload, ChevronLeft, ChevronRight,
  LogOut, Search, Settings, Sparkles,
} from 'lucide-react'
import Logo from '@/components/common/Logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/collections', icon: BookOpen, label: 'Collections' },
  { to: '/history', icon: History, label: 'History' },
]

interface NavItemProps {
  to: string
  icon: React.ElementType
  label: string
  collapsed: boolean
}

function SidebarNavItem({ to, icon: Icon, label, collapsed }: NavItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === to || pathname.startsWith(to + '/')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          className={cn(
            'relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 w-full group overflow-hidden',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
          )}
        >
          {/* Active sliding background */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(207,188,255,0.12) 0%, rgba(147,197,253,0.06) 100%)',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'rgba(207,188,255,0.18)',
              }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}

          {/* Hover background */}
          {!isActive && (
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-white/[0.04]" />
          )}

          {/* Icon */}
          <div className={cn(
            'relative z-10 flex items-center justify-center w-5 h-5 shrink-0 transition-all duration-200',
            isActive
              ? 'text-lumora-primary drop-shadow-[0_0_8px_rgba(207,188,255,0.6)]'
              : 'text-muted-foreground group-hover:text-foreground/80',
          )}>
            <Icon className="w-4.5 h-4.5" />
          </div>

          {/* Label */}
          {!collapsed && (
            <span className={cn(
              'relative z-10 flex-1 truncate transition-colors duration-200',
              isActive ? 'text-lumora-primary font-medium' : 'text-muted-foreground group-hover:text-foreground/80',
            )}>
              {label}
            </span>
          )}

          {/* Active dot */}
          {isActive && !collapsed && (
            <motion.div
              className="relative z-10 w-1.5 h-1.5 rounded-full bg-lumora-primary"
              style={{ boxShadow: '0 0 8px rgba(207,188,255,0.9)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
          )}
        </NavLink>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
      )}
    </Tooltip>
  )
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setUploadModalOpen, setCommandPaletteOpen } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <TooltipProvider delayDuration={150}>
      <motion.aside
        className="h-full flex flex-col z-30 shrink-0 relative"
        animate={{ width: sidebarCollapsed ? 68 : 248 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Ambient glow top */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(207,188,255,0.06) 0%, transparent 70%)' }}
        />

        {/* ── Header ─────────────────────────────────────────── */}
        <div className={cn(
          'flex items-center h-14 px-3 shrink-0',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        )}>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Logo size="sm" showText />
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Logo size="sm" showText={false} />
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 h-px shrink-0 bg-border/40" />

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="px-2.5 pt-3 pb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-xl text-sm transition-all duration-200',
                  'text-muted-foreground/70 hover:text-foreground/80',
                  sidebarCollapsed
                    ? 'justify-center p-2.5 hover:bg-white/[0.04]'
                    : 'px-3 py-2 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]',
                )}
              >
                <Search className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left text-xs">Search...</span>
                    <kbd className="text-[10px] bg-white/5 border border-white/[0.08] rounded-md px-1.5 py-0.5 font-mono">
                      ⌘K
                    </kbd>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {sidebarCollapsed && <TooltipContent side="right">Search (⌘K)</TooltipContent>}
          </Tooltip>
        </div>

        {/* ── Section label ──────────────────────────────────── */}
        {!sidebarCollapsed && (
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest">
            Menu
          </p>
        )}

        {/* ── Nav items ──────────────────────────────────────── */}
        <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* ── Upload Button ──────────────────────────────────── */}
        <div className="px-2.5 py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setUploadModalOpen(true)}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  'text-white relative overflow-hidden group',
                  sidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                )}
                style={{
                  background: 'linear-gradient(135deg, rgba(207,188,255,0.25) 0%, rgba(147,197,253,0.15) 100%)',
                  border: '1px solid rgba(207,188,255,0.2)',
                }}
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(207,188,255,0.35) 0%, rgba(147,197,253,0.2) 100%)' }}
                />
                <Upload className="relative z-10 w-4 h-4 shrink-0 text-lumora-primary" />
                {!sidebarCollapsed && (
                  <span className="relative z-10 text-lumora-primary">Upload Document</span>
                )}
              </button>
            </TooltipTrigger>
            {sidebarCollapsed && <TooltipContent side="right">Upload Document</TooltipContent>}
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="mx-3 h-px shrink-0 bg-border/40" />

        {/* ── User Footer ────────────────────────────────────── */}
        <div className={cn(
          'flex items-center gap-2.5 px-2.5 py-3 shrink-0',
          sidebarCollapsed && 'flex-col gap-2',
        )}>
          {/* Avatar with glow ring */}
          <div className="relative shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-lumora-primary/30 to-purple-500/10 blur-sm" />
            <Avatar className="relative w-7 h-7 ring-1 ring-lumora-primary/20">
              <AvatarFallback className="text-[11px] font-semibold bg-lumora-primary/10 text-lumora-primary">
                {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground/90 truncate leading-tight">
                {user?.displayName ?? 'User'}
              </p>
              <p className="text-[10px] text-muted-foreground/60 truncate">{user?.email}</p>
            </div>
          )}

          {/* Action icons */}
          <div className={cn('flex items-center gap-0.5', sidebarCollapsed && 'flex-col')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => cn(
                    'p-1.5 rounded-lg transition-all duration-150',
                    isActive
                      ? 'text-lumora-primary bg-lumora-primary/10'
                      : 'text-muted-foreground/60 hover:text-foreground/80 hover:bg-white/[0.05]',
                  )}
                >
                  <Settings className="w-3.5 h-3.5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Ambient glow bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(207,188,255,0.04) 0%, transparent 70%)' }}
        />

        {/* Expand handle when collapsed */}
        {sidebarCollapsed && (
          <motion.button
            onClick={toggleSidebar}
            className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors z-10"
            style={{
              background: 'var(--glass-card-bg)',
              border: '1px solid var(--sidebar-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-3 h-3" />
          </motion.button>
        )}
      </motion.aside>
    </TooltipProvider>
  )
}
