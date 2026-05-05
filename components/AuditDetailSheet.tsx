'use client'

import { useState } from 'react'
import { Auditoria } from '@/types/auditoria'
import { getStatus, getStatusColor, getSentimentColor, getScoreColor, formatDate, extractTranscriptLines } from '@/lib/utils'
import { X, Copy, Check, Zap } from 'lucide-react'

interface Props {
  auditoria: Auditoria | null
  onClose: () => void
}

const pontosFortes = (score: number) =>
  score >= 6
    ? ['Boa abertura e personalização da conversa com o cliente', 'Identificou corretamente a dor e necessidade do lead', 'Manteve tom consultivo durante todo o atendimento']
    : ['Respondeu às perguntas do cliente com objetividade', 'Demonstrou conhecimento básico do produto', 'Foi cordial e educado durante a conversa']

const falhasScript = (score: number) =>
  score >= 6
    ? ['Não criou senso de urgência para fechar a conversa', 'Não tratou adequadamente a objeção de preço', 'Não fez uma pergunta de fechamento direta']
    : ['Postura passiva — não conduziu a conversa', 'Não apresentou benefícios relevantes para o perfil', 'Não propôs próximo passo concreto ao cliente']

export function AuditDetailSheet({ auditoria, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  if (!auditoria) return null

  const lines = extractTranscriptLines(auditoria.transcript)
  const status = getStatus(auditoria.ai_score)
  const statusCls = getStatusColor(auditoria.ai_score)
  const sentimentCls = getSentimentColor(auditoria.lead_sentiment)
  const scoreCls = getScoreColor(auditoria.ai_score)

  const handleCopy = () => {
    navigator.clipboard.writeText(auditoria.next_step_suggestion).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-[520px] bg-slate-900 border-l border-slate-800 h-full overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-50">
              <Zap size={14} className="text-cyan-400" />
              Raio-X da Auditoria
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{auditoria.cliente_name} · {formatDate(auditoria.created_at)}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-200">
            <X size={13} />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center mb-4">
            <div className={`text-4xl font-bold ${scoreCls}`}>{auditoria.ai_score}</div>
            <div className="text-[11px] text-slate-500 mb-2">Score IA de Qualidade</div>
            <div className="flex justify-center gap-2">
              <span className={`text-[11px] px-2 py-0.5 rounded border ${statusCls}`}>{status}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded border ${sentimentCls}`}>{auditoria.lead_sentiment}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Cliente', value: auditoria.cliente_name },
              { label: 'Vendedor', value: auditoria.vendedor_name },
              { label: 'Data', value: formatDate(auditoria.created_at) },
              { label: 'Canal', value: 'WhatsApp' },
            ].map((m) => (
              <div key={m.label} className="bg-slate-800 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">{m.label}</div>
                <div className="text-xs font-medium text-slate-200">{m.value}</div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Transcrição da Conversa</div>
          <div className="bg-slate-800 rounded-xl p-3 mb-4 space-y-2.5">
            {lines.map((line, i) => (
              <div key={i} className={`flex gap-2 ${line.from === 'v' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 ${line.from === 'v' ? 'bg-blue-800 text-blue-200' : 'bg-slate-700 text-slate-300'}`}>
                  {line.from === 'v' ? auditoria.vendedor_name[0] : auditoria.cliente_name[0]}
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">{line.from === 'v' ? auditoria.vendedor_name : auditoria.cliente_name}</div>
                  <div className={`text-xs px-3 py-1.5 rounded-xl leading-relaxed ${line.from === 'v' ? 'bg-blue-900/40 border border-blue-500/20 text-blue-100 rounded-tr-none' : 'bg-slate-700 border border-slate-600 text-slate-200 rounded-tl-none'}`}>
                    {line.msg}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">AI Insights</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="text-xs font-semibold text-emerald-400 mb-2">✓ Pontos Fortes</div>
              {pontosFortes(auditoria.ai_score).map((p, i) => (
                <div key={i} className="flex gap-2 mb-1.5 text-[11px] text-slate-400 leading-snug">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="text-xs font-semibold text-red-400 mb-2">✕ Falhas de Script</div>
              {falhasScript(auditoria.ai_score).map((f, i) => (
                <div key={i} className="flex gap-2 mb-1.5 text-[11px] text-slate-400 leading-snug">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Coaching Direto</div>
          <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">💬 Sugestão de Próxima Mensagem</div>
            <p className="text-xs text-blue-100 leading-relaxed mb-3 italic">{auditoria.next_step_suggestion}</p>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado!' : 'Copiar mensagem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
