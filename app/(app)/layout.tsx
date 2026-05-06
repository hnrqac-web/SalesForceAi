'use client'

import { Sidebar } from '@/components/Sidebar'
import { Toaster } from 'sonner'
import { useAuditNotifications } from '@/hooks/useAuditNotifications'
import { useTheme } from 'next-themes'

function NotificationProvider() {
  useAuditNotifications()
  return null
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
      <NotificationProvider />
      <Toaster
        position="bottom-right"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        toastOptions={{
          style: {
            fontSize: '12px',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  )
}
