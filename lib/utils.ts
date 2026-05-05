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

export function calcROI(criticalCount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(criticalCount * 1200)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function extractTranscriptLines(
  transcript: string
): { from: 'v' | 'c'; msg: string }[] {
  const lines = transcript.split('\n').filter((l) => l.trim())
  return lines.map((line) => {
    if (line.startsWith('Vendedor:')) {
      return { from: 'v' as const, msg: line.replace('Vendedor:', '').trim() }
    }
    return { from: 'c' as const, msg: line.replace('Cliente:', '').trim() }
  })
}

export function getAverageScore(auditorias: Auditoria[]): number {
  if (!auditorias.length) return 0
  const sum = auditorias.reduce((acc, a) => acc + a.ai_score, 0)
  return Math.round((sum / auditorias.length) * 10) / 10
}
