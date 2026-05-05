'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Auditoria } from '@/types/auditoria'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockAuditorias } from '@/lib/mockData'

export function useAuditorias() {
  const queryClient = useQueryClient()

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
        // Fallback para mock em caso de erro se desejado, 
        // mas aqui vamos lançar para o React Query lidar com o erro
        throw err
      }

      return rows as Auditoria[]
    },
    // Se falhar e não estiver configurado, usa mock
    initialData: !isSupabaseConfigured ? mockAuditorias as Auditoria[] : undefined,
    retry: isSupabaseConfigured ? 3 : false,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('auditorias-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auditorias' },
        () => {
          // Invalida a query para buscar dados atualizados
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
    refetch: () => queryClient.invalidateQueries({ queryKey: ['auditorias'] })
  }
}
