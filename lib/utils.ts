import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Auditoria, AuditoriaStatus } from '@/types/auditoria'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatus(score: number): AuditoriaStatus {
  if (score >= 8) return 'Alta Qualidade'
  if (score >= 6) return 'Atenção'
  return 'Risco Crítico'
}

export function getStatusColor(score: number): string {
  if (score >= 8) return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  if (score >= 6) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  return 'text-red-400 bg-red-500/10 border-red-500/30'
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-blue-400'
  if (score >= 6) return 'text-amber-400'
  return 'text-red-400'
}

export function getSentimentColor(sentiment: string): string {
  if (['Positivo', 'Interessado'].includes(sentiment))
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  if (['Neutro', 'Indeciso'].includes(sentiment))
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
  if (sentiment === 'Negativo')
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  return 'text-red-400 bg-red-500/10 border-red-500/30'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function calcROI(criticalCount: number, ticketMedio: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(criticalCount * ticketMedio)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function normalizeSpeakerLabel(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\*/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function resolveSpeaker(normalizedLabel: string, normalizedVendedor: string | null, normalizedCliente: string | null) {
  if (normalizedLabel === 'vendedor' || (normalizedVendedor && normalizedLabel === normalizedVendedor)) {
    return 'v' as const
  }

  if (normalizedLabel === 'cliente' || (normalizedCliente && normalizedLabel === normalizedCliente)) {
    return 'c' as const
  }

  return null
}

export function extractTranscriptLines(
  transcript: string,
  vendedorName?: string,
  clienteName?: string
): { from: 'v' | 'c'; msg: string }[] {
  const lines = transcript.split('\n').filter((l) => l.trim())
  const normalizedVendedor = vendedorName ? normalizeSpeakerLabel(vendedorName) : null
  const normalizedCliente = clienteName ? normalizeSpeakerLabel(clienteName) : null

  const parsed: { from: 'v' | 'c'; msg: string }[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    const labelMatch = trimmedLine.match(/^([^:]+):\s*(.*)$/)

    if (!labelMatch) {
      const previous = parsed[parsed.length - 1]
      if (previous) {
        previous.msg = `${previous.msg}\n${trimmedLine}`
      } else {
        parsed.push({ from: 'c' as const, msg: trimmedLine })
      }
      continue
    }

    const [, rawLabel, rawMessage] = labelMatch
    const normalizedLabel = normalizeSpeakerLabel(rawLabel)
    const msg = rawMessage.trim()
    const resolvedSpeaker = resolveSpeaker(normalizedLabel, normalizedVendedor, normalizedCliente)

    if (resolvedSpeaker) {
      parsed.push({ from: resolvedSpeaker, msg })
      continue
    }

    const previous = parsed[parsed.length - 1]
    const fullLine = trimmedLine
    if (previous) {
      previous.msg = `${previous.msg}\n${fullLine}`
    } else {
      parsed.push({ from: 'c' as const, msg: fullLine })
    }
  }

  return parsed
}

export function getAverageScore(auditorias: Auditoria[]): number {
  if (!auditorias.length) return 0
  const sum = auditorias.reduce((acc, a) => acc + a.ai_score, 0)
  return Math.round((sum / auditorias.length) * 10) / 10
}
