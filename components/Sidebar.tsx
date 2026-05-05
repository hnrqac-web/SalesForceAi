'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  FileSearch,
  MessageCircle,
  Settings,
  Activity,
  LogOut,
  User,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/auditorias', label: 'Auditorias', icon: FileSearch },
  { href: '/whatsapp-setup', label: 'WhatsApp Setup', icon: MessageCircle },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const userInitials = user?.email?.split('@')[0].slice(0, 2).toUpperCase() || 'US'

  return (
    <aside className="w-[220px] min-w-[220px] bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Activity size={16} color="white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-50 leading-tight tracking-tight">SalesForce AI</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Auditor</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
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
              <span className={active ? 'font-semibold' : 'font-medium'}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-slate-800">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/50 border border-slate-800/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-inner">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-200 truncate leading-none mb-1">
              {user?.email?.split('@')[0] || 'Usuário'}
            </div>
            <div className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-tighter">
              {user?.email || 'Acessando...'}
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
    </aside>
  )
}
