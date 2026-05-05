'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type UserProfile = {
  id: string
  email: string
  full_name: string
  company: string
  role: string
  phone: string
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Tenta buscar na tabela profiles (se existir)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        company: profileData?.company || user.user_metadata?.company || '',
        role: profileData?.role || user.user_metadata?.role || '',
        phone: profileData?.phone || user.user_metadata?.phone || '',
      })
    } catch (err) {
      // Fallback: usa apenas dados do auth
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          company: user.user_metadata?.company || '',
          role: user.user_metadata?.role || '',
          phone: user.user_metadata?.phone || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email'>>) => {
    if (!profile) return
    setSaving(true)
    setError(null)
    try {
      // Atualiza user_metadata no Supabase Auth
      const { error: authErr } = await supabase.auth.updateUser({
        data: updates,
      })
      if (authErr) throw authErr

      // Tenta upsert na tabela profiles
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: profile.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      // Ignora erro de tabela inexistente (código 42P01)
      if (profileErr && !profileErr.message.includes('does not exist')) {
        console.warn('profiles table upsert:', profileErr.message)
      }

      setProfile((prev) => prev ? { ...prev, ...updates } : prev)
      return { success: true }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
      return { success: false, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  return { profile, loading, saving, error, updateProfile, reload: loadProfile }
}
