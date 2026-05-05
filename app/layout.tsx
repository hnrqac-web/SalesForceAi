import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SalesForce AI Auditor',
  description: 'Plataforma de Inteligência Comercial e Auditoria de Vendas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  )
}
