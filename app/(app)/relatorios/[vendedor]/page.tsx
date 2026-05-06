'use client'

import { useMemo } from 'react'
import { useAuditorias } from '@/hooks/useAuditorias'
import { getAverageScore, getScoreColor, getSentimentColor, getStatusColor, getStatus, formatDate, getInitials } from '@/lib/utils'
import { AuditDetailSheet } from '@/components/AuditDetailSheet'
import { useState } from 'react'
import { Auditoria } from '@/types/auditoria'
import { useParams, useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, TrendingUp, MessageSquare, AlertTriangle, Award, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function VendedorPage() {
  const { vendedor } = useParams<{ vendedor: string }>()
  const router = useRouter()
  const { data: allData, isLoading } = useAuditorias()
  const [selected, setSelected] = useState<Auditoria | null>(null)

  const nome = decodeURIComponent(vendedor)

  const auditorias = useMemo(
    () => allData.filter(a => a.vendedor_name === nome).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
    [allData, nome]
  )

  const avgScore = getAverageScore(auditorias)
  const total = auditorias.length
  const positivos = auditorias.filter(a => ['Positivo', 'Interessado'].includes(a.lead_sentiment)).length
  const criticos = auditorias.filter(a => a.ai_score < 5).length
  const melhor = total > 0 ? Math.max(...auditorias.map(a => a.ai_score)) : 0
  const pior = total > 0 ? Math.min(...auditorias.map(a => a.ai_score)) : 0

  // Gráfico de evolução do score (últimos 15)
  const chartData = useMemo(() =>
    [...auditorias].reverse().slice(-15).map((a, i) => ({
      idx: i + 1,
      score: a.ai_score,
      cliente: a.cliente_name,
      data: formatDate(a.created_at),
    })),
    [auditorias]
  )

  // Distribuição de sentimentos
  const sentimentos = useMemo(() => {
    const groups: Record<string, number> = {}
    auditorias.forEach(a => {
      const key = ['Positivo', 'Interessado'].includes(a.lead_sentiment) ? 'Positivo'
        : ['Neutro', 'Indeciso'].includes(a.lead_sentiment) ? 'Neutro'
        : a.lead_sentiment || 'Indefinido'
      groups[key] = (groups[key] || 0) + 1
    })
    return Object.entries(groups).sort((a, b) => b[1] - a[1])
  }, [auditorias])

  // Sugestões de coaching baseadas no score médio
  const coachingTips = useMemo(() => {
    if (avgScore >= 8) return [
      'Continue com a abordagem consultiva — resultados excelentes!',
      'Compartilhe suas técnicas de abertura com o restante do time.',
      'Foco em upsell e ampliação do ticket médio nas próximas conversas.',
    ]
    if (avgScore >= 6) return [
      'Trabalhe a criação de urgência no fechamento — é o gap mais recorrente.',
      'Pratique scripts de tratamento de objeção de preço.',
      'Revise as conversas com score < 7 para identificar padrões.',
    ]
    return [
      'Prioridade: treinar perguntas abertas para identificar a dor do cliente.',
      'Evite ir direto para o preço — construa valor primeiro.',
      'Revise as conversas críticas com o gestor e monte um plano de ação.',
    ]
  }, [avgScore])

  const initials = getInitials(nome)
  const scoreColor = getScoreColor(avgScore)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    )
  }

  if (total === 0 && !isLoading) {
    return (
      <div className="p-7">
        <button onClick={() => router.push('/relatorios')} className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 mb-6 transition-colors">
          <ArrowLeft size={14} /> Voltar para Relatórios
        </button>
        <div className="py-20 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">Vendedor não encontrado ou sem auditorias.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 md:px-7 pt-4 md:pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur z-10">
        <button
          onClick={() => router.push('/relatorios')}
          className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Voltar para Relatórios
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-blue-600/20">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{nome}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{total} auditorias analisadas</span>
              <span className={`text-xs font-black ${scoreColor}`}>Score médio: {avgScore}/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-7 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Score Médio', val: `${avgScore}/10`, icon: TrendingUp, color: scoreColor },
            { label: 'Total', val: total, icon: MessageSquare, color: 'text-cyan-400' },
            { label: 'Positivos', val: positivos, icon: ThumbsUp, color: 'text-emerald-400' },
            { label: 'Críticos', val: criticos, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Melhor Score', val: `${melhor.toFixed(1)}/10`, icon: Award, color: 'text-amber-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <kpi.icon size={11} className={kpi.color} />
                {kpi.label}
              </div>
              <div className={`text-xl font-black ${kpi.color}`}>{kpi.val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Gráfico de evolução */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">Evolução do Score</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">Últimas {chartData.length} conversas</div>
            <div className="h-[200px]">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="idx" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                      formatter={(val: any, _: any, props: any) => [
                        `${val}/10`, props.payload.cliente || 'Cliente'
                      ]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.data || `Conversa ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e40af' }}
                      activeDot={{ r: 6 }}
                    />
                    {/* Linha de referência */}
                    <Line
                      type="monotone"
                      dataKey={() => 7}
                      stroke="#64748b"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  Mínimo 2 conversas para exibir o gráfico
                </div>
              )}
            </div>
            <div className="text-[9px] text-slate-600 mt-1">— linha tracejada = meta 7.0</div>
          </div>

          {/* Sentimentos + Coaching */}
          <div className="space-y-3">
            {/* Sentimentos */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">Sentimentos dos Leads</div>
              <div className="space-y-2">
                {sentimentos.map(([sent, count]) => (
                  <div key={sent} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 w-16 shrink-0">{sent}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sent === 'Positivo' ? 'bg-emerald-500'
                          : sent === 'Neutro' ? 'bg-slate-500'
                          : sent === 'Negativo' ? 'bg-amber-500'
                          : 'bg-red-500'
                        }`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score range */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">Distribuição de Scores</div>
              <div className="space-y-2">
                {[
                  { label: 'Alta (≥8)', count: auditorias.filter(a => a.ai_score >= 8).length, color: 'bg-blue-500' },
                  { label: 'Atenção (6-8)', count: auditorias.filter(a => a.ai_score >= 6 && a.ai_score < 8).length, color: 'bg-amber-500' },
                  { label: 'Crítico (<6)', count: auditorias.filter(a => a.ai_score < 6).length, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 w-20 shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: total > 0 ? `${(item.count / total) * 100}%` : '0%' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 w-4 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coaching */}
        <div className="bg-gradient-to-br from-blue-950/50 to-slate-900 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider">
            <Award size={13} />
            Plano de Coaching Personalizado
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {coachingTips.map((tip, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[9px] font-black text-blue-400 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-slate-600">
            Baseado no score médio de {avgScore}/10 nas últimas {total} auditorias
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Histórico de Conversas</div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {auditorias.map(a => {
              const statusCls = getStatusColor(a.ai_score)
              const sentCls = getSentimentColor(a.lead_sentiment)
              return (
                <div
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 dark:bg-slate-800/30 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                      {a.cliente_name || '—'}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{a.ai_summary || '—'}</div>
                  </div>
                  <div className="text-[10px] text-slate-600 shrink-0 w-20 text-right">{formatDate(a.created_at)}</div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusCls}`}>
                    {getStatus(a.ai_score).toUpperCase()}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 hidden md:inline ${sentCls}`}>
                    {(a.lead_sentiment || '').toUpperCase()}
                  </span>
                  <div className={`text-sm font-black w-10 text-right shrink-0 ${getScoreColor(a.ai_score)}`}>
                    {a.ai_score?.toFixed(1)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <AuditDetailSheet auditoria={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
