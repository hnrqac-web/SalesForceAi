'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileSearch,
  MessageCircle,
  Settings,
  Activity,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/auditorias', label: 'Auditorias', icon: FileSearch },
  { href: '/whatsapp-setup', label: 'WhatsApp Setup', icon: MessageCircle },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] min-w-[220px] bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity size={16} color="white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-50 leading-tight">SalesForce AI</div>
            <div className="text-[10px] text-slate-500">Auditor</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-slate-800">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800">
          <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            GS
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">Gestor Silva</div>
            <div className="text-[10px] text-slate-500">Administrador</div>
          </div>
          <LogOut size={13} className="text-slate-500 cursor-pointer hover:text-slate-300" />
        </div>
      </div>
    </aside>
  )
}
