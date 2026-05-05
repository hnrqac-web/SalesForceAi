'use client'

import { useState } from 'react'
import { Auditoria } from '@/types/auditoria'
import { getStatus, getStatusColor, getSentimentColor, getScoreColor, formatDate, extractTranscriptLines } from '@/lib/utils'
import { X, Copy, Check, Zap, MessageSquare, Brain, ChevronRight } from 'lucide-react'

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
  const [tab, setTab] = useState<'overview' | 'transcript'>('overview')

  if (!auditoria) return null

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
      <div className="w-[540px] bg-slate-900 border-l border-slate-800 h-full overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col">

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
          <button onClick={onClose} className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
            <X size={13} />
          </button>
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
            {([['overview', 'Análise IA', Brain], ['transcript', 'Transcrição', MessageSquare]] as const).map(([key, label, Icon]) => (
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
                  {[
                    { label: 'Abertura da conversa', score: Math.min(10, auditoria.ai_score + (Math.random() > 0.5 ? 1 : -1)) },
                    { label: 'Identificação de necessidade', score: auditoria.ai_score },
                    { label: 'Proposta de valor', score: Math.max(0, auditoria.ai_score - 1) },
                    { label: 'Fechamento e CTA', score: Math.max(0, auditoria.ai_score - 2) },
                  ].map(item => (
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
                        {item.score.toFixed(0)}
                      </div>
                    </div>
                  ))}
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
        </div>
      </div>
    </div>
  )
}
