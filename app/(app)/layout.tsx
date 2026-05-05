'use client'

import { Sidebar } from '@/components/Sidebar'
import { Toaster } from 'sonner'
import { useAuditNotifications } from '@/hooks/useAuditNotifications'

function NotificationProvider() {
  useAuditNotifications()
  return null
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
      <NotificationProvider />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#e2e8f0',
            fontSize: '12px',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  )
}
