export type Auditoria = {
  id: string
  created_at: string
  vendedor_name: string
  cliente_name: string
  transcript: string
  ai_score: number
  ai_summary: string
  next_step_suggestion: string
  lead_sentiment: string
}

export type AuditoriaStatus = 'Alta Qualidade' | 'Atenção' | 'Risco Crítico'

export type VendedorStats = {
  name: string
  initials: string
  scoreMedia: number
  totalAuditorias: number
  cor: string
}
