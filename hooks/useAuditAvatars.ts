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

export function useAuditAvatars(auditorias: Auditoria[]) {
  const [sellerAvatars, setSellerAvatars] = useState<Record<string, string>>({})
  const [clientAvatars, setClientAvatars] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

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

        setSellerAvatars(nextSellerAvatars)
        setClientAvatars(nextClientAvatars)
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
