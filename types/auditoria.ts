export type Auditoria = {
  id: string
  created_at: string
  vendedor_name: string
  cliente_name: string
  cliente_jid?: string
  transcript: string
  transcript_completo?: string
  ai_score: number
  ai_summary: string
  next_step_suggestion: string
  lead_sentiment: string
  status?: 'aberto' | 'concluido' | string

  // Novos campos de análise comportamental (opcionais para retrocompatibilidade)
  customer_intent?: string
  objection_type?: string
  urgency_level?: string
  buying_stage?: string
  trust_level?: string
  price_sensitivity?: string
  decision_power?: string
  
  risk_reason?: string
  recommended_action?: string
  risk_level?: string
  
  behavioral_score?: number
  intent_score?: number
  urgency_score?: number
  trust_score?: number
  probability_to_close?: number
  
  media_type?: string
  
  extracted_entities?: Record<string, any>
  ai_behavior_analysis?: Record<string, any>
  
  explicit_objections?: string[]
  hidden_objections?: string[]
  positive_signals?: string[]
  negative_signals?: string[]
  
  seller_strengths?: string[]
  seller_script_failures?: string[]
  
  copy_ready_message?: string
  suggested_followup_timing?: string
}

export type AuditoriaStatus = 'Alta Qualidade' | 'Atenção' | 'Risco Crítico'

export type VendedorStats = {
  name: string
  initials: string
  scoreMedia: number
  totalAuditorias: number
  cor: string
}
