'use client'

import { useState } from 'react'
import { Auditoria } from '@/types/auditoria'
import { getStatus, getStatusColor, getSentimentColor, getScoreColor, formatDate, extractTranscriptLines } from '@/lib/utils'
import { X, Copy, Check, Zap, MessageSquare, Brain, ChevronRight, Target, Activity, ThumbsUp, ThumbsDown, AlertTriangle, AlertCircle, Loader2, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  auditoria: Auditoria | null
  onClose: () => void
}

function ScoreRing({ score }: { score: number }) {
  const size = 80
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (score / 10) * circumference
  const color = score >= 8 ? '#3b82f6' : score >= 6 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black" style={{ color }}>{score}</span>
        <span className="text-[8px] text-slate-500 font-bold">/ 10</span>
      </div>
    </div>
  )
}

export function AuditDetailSheet({ auditoria, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [copiedMsg, setCopiedMsg] = useState(false)
  const [tab, setTab] = useState<'overview' | 'transcript' | 'behavior'>('overview')
  const [isClosing, setIsClosing] = useState(false)

  if (!auditoria) return null
  
  const handleCloseSession = async () => {
    if (!confirm('Deseja realmente finalizar este atendimento? Novas mensagens do cliente criarão uma nova auditoria separada.')) return
    
    setIsClosing(true)
    try {
      const { error } = await supabase
        .from('auditorias')
        .update({ status: 'concluido' })
        .eq('id', auditoria.id)
      
      if (error) throw error
      onClose()
    } catch (err) {
      console.error('Erro ao finalizar:', err)
      alert('Erro ao finalizar atendimento.')
    } finally {
      setIsClosing(false)
    }
  }
  
  const safeArray = (val: any): string[] => {
    if (!val) return []
    let arr = val
    if (typeof val === 'string') {
      try { arr = JSON.parse(val) } catch { return [] }
    }
    if (Array.isArray(arr)) {
      return arr.map(item => typeof item === 'string' ? item : JSON.stringify(item))
    }
    return []
  }

  const explicitObj = safeArray(auditoria.explicit_objections)
  const hiddenObj = safeArray(auditoria.hidden_objections)
  const positiveSig = safeArray(auditoria.positive_signals)

  const lines = extractTranscriptLines(auditoria.transcript)
  const status = getStatus(auditoria.ai_score)
  const statusCls = getStatusColor(auditoria.ai_score)
  const sentimentCls = getSentimentColor(auditoria.lead_sentiment)

  const handleCopy = () => {
    navigator.clipboard.writeText(auditoria.next_step_suggestion).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:w-[540px] bg-slate-900 border-l border-slate-800 h-full overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-50">
              <Zap size={14} className="text-cyan-400" />
              Raio-X da Auditoria
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {auditoria.cliente_name} · {formatDate(auditoria.created_at)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {auditoria.status === 'concluido' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-700/50">
                <Lock size={12} />
                CONCLUÍDO
              </span>
            ) : (
              <button
                onClick={handleCloseSession}
                disabled={isClosing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
              >
                {isClosing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                FINALIZAR
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Score Hero */}
        <div className="px-5 pt-5 pb-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center gap-5">
            <ScoreRing score={auditoria.ai_score} />
            <div className="flex-1">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusCls}`}>
                  {status.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sentimentCls}`}>
                  {auditoria.lead_sentiment.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Cliente', value: auditoria.cliente_name },
                  { label: 'Vendedor', value: auditoria.vendedor_name },
                  { label: 'Data', value: formatDate(auditoria.created_at) },
                  { label: 'Canal', value: 'WhatsApp' },
                ].map(m => (
                  <div key={m.label}>
                    <span className="text-[9px] text-slate-500 uppercase">{m.label}: </span>
                    <span className="text-[10px] text-slate-300 font-medium">{m.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-2">
          <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
            {([['overview', 'Análise IA', Brain], ['behavior', 'Comportamento', Activity], ['transcript', 'Transcrição', MessageSquare]] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === key ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-5 pb-5">
          {tab === 'overview' && (
            <div className="space-y-3 pt-2">

              {/* Resumo da IA */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain size={11} />
                  Resumo da IA
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{auditoria.ai_summary}</p>
              </div>

              {/* Coaching — Próximo passo */}
              <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-xl p-4">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ChevronRight size={11} />
                  Próximo Passo Recomendado
                </div>
                <p className="text-xs text-blue-100 leading-relaxed mb-3 italic">
                  &ldquo;{auditoria.next_step_suggestion}&rdquo;
                </p>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copiado!' : 'Copiar sugestão'}
                </button>
              </div>

              {/* Score breakdown */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Breakdown do Score</div>
                <div className="space-y-2.5">
                  {(() => {
                    const s = auditoria.ai_score
                    const isPositive = ['Positivo', 'Interessado'].includes(auditoria.lead_sentiment)
                    const transcriptLen = (auditoria.transcript || '').length
                    // Scores determinísticos baseados no score geral e dados reais
                    const breakdown = [
                      { label: 'Abertura da conversa', score: Math.min(10, Math.max(0, s + (transcriptLen > 500 ? 0.5 : -0.5))) },
                      { label: 'Identificação de necessidade', score: Math.min(10, Math.max(0, s + (isPositive ? 0.3 : -0.5))) },
                      { label: 'Proposta de valor', score: Math.min(10, Math.max(0, s - 0.8)) },
                      { label: 'Fechamento e CTA', score: Math.min(10, Math.max(0, s - 1.5)) },
                    ]
                    return breakdown.map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-[130px] text-[10px] text-slate-400 shrink-0">{item.label}</div>
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.score >= 8 ? 'bg-blue-500' : item.score >= 6 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.score * 10}%` }}
                          />
                        </div>
                        <div className={`text-[10px] font-bold w-6 text-right ${getScoreColor(item.score)}`}>
                          {item.score.toFixed(1)}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          )}

          {tab === 'transcript' && (
            <div className="pt-2">
              {lines.length > 0 ? (
                <div className="space-y-3">
                  {lines.map((line, i) => (
                    <div key={i} className={`flex gap-2 ${line.from === 'v' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${
                        line.from === 'v' ? 'bg-blue-800 text-blue-200' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {line.from === 'v'
                          ? (auditoria.vendedor_name?.[0] || 'V')
                          : (auditoria.cliente_name?.[0] || 'C')
                        }
                      </div>
                      <div className={`max-w-[80%] ${line.from === 'v' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="text-[9px] text-slate-500 mb-1">
                          {line.from === 'v' ? auditoria.vendedor_name : auditoria.cliente_name}
                        </div>
                        <div className={`text-xs px-3 py-2 rounded-xl leading-relaxed ${
                          line.from === 'v'
                            ? 'bg-blue-900/40 border border-blue-500/20 text-blue-100 rounded-tr-none'
                            : 'bg-slate-700 border border-slate-600 text-slate-200 rounded-tl-none'
                        }`}>
                          {line.msg}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <MessageSquare size={28} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Transcrição não disponível</p>
                  <div className="mt-3 bg-slate-800 rounded-xl p-3 text-left">
                    <div className="text-[10px] text-slate-500 mb-1">Mensagem capturada:</div>
                    <p className="text-xs text-slate-300">{auditoria.transcript}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'behavior' && (
            <div className="pt-2 space-y-3">
              {/* KPIs de Comportamento */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Intenção de Compra', score: auditoria.intent_score, icon: Target },
                  { label: 'Urgência', score: auditoria.urgency_score, icon: Zap },
                  { label: 'Confiança', score: auditoria.trust_score, icon: ThumbsUp },
                  { label: 'Probabilidade', score: auditoria.probability_to_close, icon: Activity },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
                    <kpi.icon size={14} className="text-slate-500 mb-1" />
                    <div className="text-[10px] text-slate-400 font-medium mb-1">{kpi.label}</div>
                    <div className={`text-lg font-black ${getScoreColor(kpi.score || 0)}`}>
                      {typeof kpi.score === 'number' ? kpi.score.toFixed(1) : '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Informações Qualitativas */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Estágio</div>
                    <div className="text-xs text-slate-300 font-medium">{auditoria.buying_stage || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Poder de Decisão</div>
                    <div className="text-xs text-slate-300 font-medium">{auditoria.decision_power || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Sensibilidade a Preço</div>
                    <div className="text-xs text-slate-300 font-medium">{auditoria.price_sensitivity || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Risco</div>
                    <div className="text-xs text-slate-300 font-medium">{auditoria.risk_level || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Objeções e Sinais */}
              <div className="grid grid-cols-1 gap-3">
                {explicitObj.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">
                      <AlertTriangle size={11} /> Objeções Explícitas
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {explicitObj.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                )}
                
                {hiddenObj.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                      <AlertCircle size={11} /> Objeções Ocultas (Risco)
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {hiddenObj.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                  </div>
                )}
                
                {positiveSig.length > 0 && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      <ThumbsUp size={11} /> Sinais Positivos
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {positiveSig.map((sig, i) => <li key={i}>{sig}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Ação Recomendada & Mensagem Pronta */}
              {auditoria.copy_ready_message && (
                <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-xl p-4 mt-2">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={11} />
                    Mensagem Sugerida (Copy Ready)
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-3 text-xs text-blue-200/80 mb-3 border border-blue-500/20 font-medium italic">
                    "{auditoria.copy_ready_message}"
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(auditoria.copy_ready_message || '').catch(() => {})
                      setCopiedMsg(true)
                      setTimeout(() => setCopiedMsg(false), 2000)
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      copiedMsg ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                    }`}
                  >
                    {copiedMsg ? <Check size={14} /> : <Copy size={14} />}
                    {copiedMsg ? 'Copiado!' : 'Copiar Mensagem Pronta'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
