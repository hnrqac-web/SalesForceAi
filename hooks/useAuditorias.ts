'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Auditoria } from '@/types/auditoria'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockAuditorias } from '@/lib/mockData'

// Canal global único — garante apenas 1 subscription ativa para toda a app
let globalChannelSetup = false

export function useAuditorias() {
  const queryClient = useQueryClient()
  // ID único por instância do hook para evitar conflito de canal
  const channelId = useRef(`auditorias-${Math.random().toString(36).slice(2)}`)

  const { data, isLoading, error } = useQuery({
    queryKey: ['auditorias'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return mockAuditorias as Auditoria[]
      }

      const { data: rows, error: err } = await supabase
        .from('auditorias')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) {
        console.error('Erro ao buscar auditorias:', err)
        return [] as Auditoria[]
      }

      return rows as Auditoria[]
    },
    initialData: !isSupabaseConfigured ? mockAuditorias as Auditoria[] : undefined,
    retry: isSupabaseConfigured ? 3 : false,
    // Refetch a cada 3s para garantir atualização automática ultra rápida
    refetchInterval: isSupabaseConfigured ? 3000 : false,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(channelId.current) // Nome único por instância
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auditorias' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['auditorias'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return {
    data: data || [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['auditorias'] }),
  }
}
