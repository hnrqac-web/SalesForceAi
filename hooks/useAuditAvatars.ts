'use client'

import { useEffect, useMemo, useState } from 'react'
import { evolutionService } from '@/lib/evolution'
import type { Auditoria } from '@/types/auditoria'

function normalizeDigits(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits || null
}

function normalizeJid(value: string | null | undefined) {
  const digits = normalizeDigits(value)
  return digits ? `${digits}@s.whatsapp.net` : null
}

const AVATARS_CACHE_KEY = 'audit_avatars_cache'

interface CachedAvatars {
  seller: Record<string, string>
  client: Record<string, string>
  timestamp: number
}

function getCachedAvatars(): CachedAvatars | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(AVATARS_CACHE_KEY)
    if (!cached) return null
    const parsed = JSON.parse(cached) as CachedAvatars
    if (Date.now() - parsed.timestamp > 1000 * 60 * 30) return null
    return parsed
  } catch {
    return null
  }
}

function saveCachedAvatars(seller: Record<string, string>, client: Record<string, string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AVATARS_CACHE_KEY, JSON.stringify({ seller, client, timestamp: Date.now() }))
  } catch {}
}

export function useAuditAvatars(auditorias: Auditoria[]) {
  const [sellerAvatars, setSellerAvatars] = useState<Record<string, string>>({})
  const [clientAvatars, setClientAvatars] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    const cached = getCachedAvatars()
    if (cached) {
      setSellerAvatars(cached.seller)
      setClientAvatars(cached.client)
    }

    async function loadAvatars() {
      try {
        const instances = await evolutionService.getInstances()
        if (!active) return

        const nextSellerAvatars: Record<string, string> = {}
        instances.forEach((inst: any) => {
          if (!inst.profilePicUrl) return

          const keys = [
            inst.instanceName,
            inst.name,
            inst.owner,
            inst.ownerJid,
            inst.number,
            normalizeDigits(inst.owner),
            normalizeDigits(inst.ownerJid),
            normalizeDigits(inst.number),
          ].filter(Boolean)

          keys.forEach((key) => {
            nextSellerAvatars[String(key)] = inst.profilePicUrl
          })
        })

        const nextClientAvatars: Record<string, string> = {}
        const openInstances = instances.filter((inst: any) => inst.status === 'open' || inst.connectionStatus === 'open')

        for (const inst of openInstances) {
          const instanceName = inst.instanceName || inst.name
          if (!instanceName) continue

          const contacts = await evolutionService.fetchContacts(instanceName)
          if (!active) return

          contacts.forEach((contact: any) => {
            const avatar = contact?.profilePicUrl || contact?.profilePictureUrl || contact?.imgUrl || contact?.picture
            if (!avatar) return

            const contactKeys = [
              contact?.id,
              contact?.remoteJid,
              contact?.jid,
              normalizeDigits(contact?.id),
              normalizeDigits(contact?.remoteJid),
              normalizeDigits(contact?.jid),
            ].filter(Boolean)

            contactKeys.forEach((key) => {
              nextClientAvatars[String(key)] = avatar
            })
          })
        }

        const hasNewData = Object.keys(nextSellerAvatars).length > Object.keys(cached?.seller || {}).length ||
                          Object.keys(nextClientAvatars).length > Object.keys(cached?.client || {}).length

        if (hasNewData || !cached) {
          setSellerAvatars(nextSellerAvatars)
          setClientAvatars(nextClientAvatars)
          saveCachedAvatars(nextSellerAvatars, nextClientAvatars)
        }
      } catch (error) {
        console.error('Failed to load audit avatars', error)
      }
    }

    loadAvatars()

    return () => {
      active = false
    }
  }, [auditorias])

  const getSellerAvatar = useMemo(
    () => (vendedorName?: string | null) => {
      if (!vendedorName) return null
      return sellerAvatars[vendedorName] || sellerAvatars[normalizeDigits(vendedorName) || ''] || null
    },
    [sellerAvatars]
  )

  const getClientAvatar = useMemo(
    () => (auditoria: Auditoria) => {
      const candidates = [
        auditoria.cliente_jid,
        normalizeJid(auditoria.cliente_jid),
        normalizeDigits(auditoria.cliente_jid),
        normalizeJid(auditoria.cliente_name),
        normalizeDigits(auditoria.cliente_name),
      ].filter(Boolean)

      for (const candidate of candidates) {
        if (candidate && clientAvatars[String(candidate)]) {
          return clientAvatars[String(candidate)]
        }
      }

      return null
    },
    [clientAvatars]
  )

  return { getSellerAvatar, getClientAvatar }
}
