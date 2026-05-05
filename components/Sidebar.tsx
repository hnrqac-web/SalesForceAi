'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuditorias } from '@/hooks/useAuditorias'
import {
  LayoutDashboard, FileSearch, MessageCircle,
  Settings, Activity, LogOut, AlertTriangle, BarChart2, Menu, X,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useAuditorias()

  const criticalCount = data.filter(
    a => a.ai_score < 5 || ['Negativo', 'Crítico'].includes(a.lead_sentiment)
  ).length

  // Fecha drawer ao trocar de rota
  useEffect(() => { setIsOpen(false) }, [pathname])

  // Trava scroll do body quando drawer está aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Usuário'

  const userInitials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/auditorias', label: 'Auditorias', icon: FileSearch, badge: criticalCount },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
    { href: '/whatsapp-setup', label: 'WhatsApp', icon: MessageCircle },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ]

  function NavContent({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity size={16} color="white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-50 leading-tight tracking-tight">SalesForce AI</div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Auditor</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Alerta críticos */}
        {criticalCount > 0 && (
          <div className="mx-3 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <AlertTriangle size={13} className="text-red-400 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-red-400">
                {criticalCount} lead{criticalCount > 1 ? 's' : ''} crítico{criticalCount > 1 ? 's' : ''}
              </div>
              <div className="text-[9px] text-red-400/60">Atenção imediata</div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 mt-2">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                <span className={`flex-1 ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-2 border-t border-slate-800">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-inner">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-200 truncate leading-none mb-1">
                {displayName}
              </div>
              <div className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-tighter">
                {user?.email || '...'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-slate-900/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity size={13} color="white" />
          </div>
          <span className="text-sm font-bold text-slate-50 tracking-tight">SalesForce AI</span>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
              {criticalCount}
            </span>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-[220px] min-w-[220px] bg-slate-900 border-r border-slate-800 flex-col h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col h-full animate-in slide-in-from-left duration-200">
            <NavContent onClose={() => setIsOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
