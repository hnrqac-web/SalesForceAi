'use client'

import { useState, useEffect, useCallback } from 'react'
import { Auditoria } from '@/types/auditoria'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockAuditorias } from '@/lib/mockData'

export function useAuditorias() {
  const [data, setData] = useState<Auditoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditorias = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setData(mockAuditorias)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const { data: rows, error: err } = await supabase
        .from('auditorias')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setData(rows || [])
      setError(null)
    } catch (err: unknown) {
      console.error('Erro ao buscar auditorias:', err)
      setError('Erro ao carregar auditorias. Usando dados de demonstração.')
      setData(mockAuditorias)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuditorias()

    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('auditorias-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'auditorias' },
        (payload) => {
          setData((prev) => [payload.new as Auditoria, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAuditorias])

  return { data, isLoading, error, refetch: fetchAuditorias }
}
