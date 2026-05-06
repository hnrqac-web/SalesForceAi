'use client'

import { useEffect, useMemo, useState } from 'react'
import { evolutionService } from '@/lib/evolution'

function normalizeDigits(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits || null
}

export function useSellerNames() {
  const [sellerMap, setSellerMap] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    async function loadInstances() {
      try {
        const instances = await evolutionService.getInstances()
        if (!active) return

        const nextMap: Record<string, string> = {}
        instances.forEach((inst: any) => {
          const displayName = inst.profileName || null
          if (!displayName) return

          const rawNames = [
            inst.name,
            inst.instanceName,
            inst.owner,
            inst.ownerJid,
            inst.number,
            normalizeDigits(inst.owner),
            normalizeDigits(inst.ownerJid),
            normalizeDigits(inst.number),
          ].filter(Boolean)

          rawNames.forEach((rawName) => {
            nextMap[String(rawName)] = displayName
          })
        })

        setSellerMap(nextMap)
      } catch (error) {
        console.error('Failed to load seller names', error)
      }
    }

    loadInstances()

    return () => {
      active = false
    }
  }, [])

  const getSellerDisplayName = useMemo(
    () => (name?: string | null) => {
      if (!name) return '—'
      return sellerMap[name] || sellerMap[normalizeDigits(name || '') || ''] || name
    },
    [sellerMap]
  )

  return { sellerMap, getSellerDisplayName }
}
