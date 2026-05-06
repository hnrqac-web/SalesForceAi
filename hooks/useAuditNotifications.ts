'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { Auditoria } from '@/types/auditoria'
import { useSellerNames } from './useSellerNames'

export function useAuditNotifications() {
  const queryClient = useQueryClient()
  const { getSellerDisplayName } = useSellerNames()
  const isFirstLoad = useRef(true)
  const channelId = useRef(`notif-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // Aguarda 3s para não disparar na carga inicial
    const timer = setTimeout(() => {
      isFirstLoad.current = false
    }, 3000)

    const channel = supabase
      .channel(channelId.current)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auditorias' },
        (payload) => {
          if (isFirstLoad.current) return

          // Atualiza a tabela invisivelmente sempre que houver INSERT ou UPDATE
          queryClient.invalidateQueries({ queryKey: ['auditorias'] })

          // Exibir Toast Notification APENAS para novos atendimentos (INSERT)
          if (payload.eventType === 'INSERT') {
            const audit = payload.new as Auditoria
            const score = audit.ai_score
            const cliente = audit.cliente_name || 'Novo cliente'
            const vendedor = getSellerDisplayName(audit.vendedor_name)

            if (score < 5) {
              toast.error(`🚨 Lead Crítico — ${cliente}`, {
                description: `${vendedor} · Score: ${score?.toFixed(1)}/10 · Atenção imediata necessária`,
                duration: 8000,
                action: { label: 'Ver', onClick: () => window.location.href = '/auditorias' },
              })
            } else if (score < 7) {
              toast.warning(`⚠️ Atenção — ${cliente}`, {
                description: `${vendedor} · Score: ${score?.toFixed(1)}/10`,
                duration: 5000,
              })
            } else {
              toast.success(`✅ Nova auditoria — ${cliente}`, {
                description: `${vendedor} · Score: ${score?.toFixed(1)}/10`,
                duration: 4000,
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      clearTimeout(timer)
      supabase.removeChannel(channel)
    }
  }, [queryClient, getSellerDisplayName])
}
