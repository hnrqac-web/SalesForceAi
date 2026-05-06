'use client'

import { useEffect, useMemo, useState } from 'react'
import { evolutionService } from '@/lib/evolution'

const SELLER_MAP_STORAGE_KEY = '@salesforce-ai:seller-map'

function normalizeDigits(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits || null
}

function looksLikeTechnicalSellerName(value: string | null | undefined) {
  if (!value) return false
  return /^admin-\d+$/i.test(value) || /^\d{8,}$/.test(value)
}

function loadCachedSellerMap() {
  if (typeof window === 'undefined') return {}

  try {
    const cached = window.localStorage.getItem(SELLER_MAP_STORAGE_KEY)
    if (!cached) return {}

    const parsed = JSON.parse(cached)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function useSellerNames() {
  const [sellerMap, setSellerMap] = useState<Record<string, string>>(loadCachedSellerMap)

  useEffect(() => {
    let active = true

    async function loadInstances() {
      try {
        const instances = await evolutionService.getInstances()
        if (!active) return

        const nextMap: Record<string, string> = {}
        instances.forEach((inst: any) => {
          const displayName = inst.displayName || inst.profileName || null
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

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SELLER_MAP_STORAGE_KEY, JSON.stringify(nextMap))
        }

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

      const mappedName = sellerMap[name] || sellerMap[normalizeDigits(name || '') || '']
      if (mappedName) return mappedName

      if (looksLikeTechnicalSellerName(name)) {
        return 'Carregando vendedor...'
      }

      return name
    },
    [sellerMap]
  )

  return { sellerMap, getSellerDisplayName }
}
