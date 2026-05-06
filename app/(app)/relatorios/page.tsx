'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAuditorias } from '@/hooks/useAuditorias'
import { useSellerNames } from '@/hooks/useSellerNames'
import { getAverageScore, getScoreColor, getSentimentColor, getInitials, formatDate } from '@/lib/utils'
import { Auditoria } from '@/types/auditoria'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import {
  Download, Filter, TrendingUp, TrendingDown,
  Award, Users, BarChart2, Loader2, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'

type Period = '7d' | '30d' | '90d' | 'all'
const PAGE_SIZE = 10

function exportToCSV(rows: Auditoria[], getSellerDisplayName: (name?: string | null) => string) {
  const headers = ['Data', 'Vendedor', 'Cliente', 'Score IA', 'Sentimento', 'Resumo IA', 'Próximo Passo']
  const lines = rows.map(r => [
    formatDate(r.created_at),
    getSellerDisplayName(r.vendedor_name),
    r.cliente_name,
    r.ai_score,
    r.lead_sentiment,
    `"${(r.ai_summary || '').replace(/"/g, "'")}"`,
    `"${(r.next_step_suggestion || '').replace(/"/g, "'")}"`,
  ].join(';'))

  const csv = [headers.join(';'), ...lines].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-auditorias-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const SENTIMENT_COLORS: Record<string, string> = {
  Positivo: '#10b981',
  Interessado: '#10b981',
  Neutro: '#64748b',
  Indeciso: '#64748b',
  Negativo: '#f59e0b',
  Crítico: '#ef4444',
}

export default function RelatoriosPage() {
  const { data: allData, isLoading } = useAuditorias()
  const { getSellerDisplayName } = useSellerNames()
  const [period, setPeriod] = useState<Period>('30d')
  const [vendedor, setVendedor] = useState('')
  const [sentimento, setSentimento] = useState('')
  const [scoreMin, setScoreMin] = useState(0)
  const [page, setPage] = useState(1)

  // Filtro por período
  const periodFiltered = useMemo(() => {
    if (period === 'all') return allData
    const days = { '7d': 7, '30d': 30, '90d': 90 }[period]
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return allData.filter(a => new Date(a.created_at) >= cutoff)
  }, [allData, period])

  // Filtros combinados
  const filtered = useMemo(() => {
    return periodFiltered.filter(a => {
      if (vendedor && a.vendedor_name !== vendedor) return false
      if (sentimento && a.lead_sentiment !== sentimento) return false
      if (a.ai_score < scoreMin) return false
      return true
    })
  }, [periodFiltered, vendedor, sentimento, scoreMin])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Métricas resumo
  const avgScore = getAverageScore(filtered)
  const critical = filtered.filter(a => a.ai_score < 5).length
  const bestScore = filtered.length > 0 ? Math.max(...filtered.map(a => a.ai_score)) : 0

  // Dados por vendedor para gráfico de barras
  const vendedorStats = useMemo(() => {
    const groups = new Map<string, Auditoria[]>()
    filtered.forEach((audit) => {
      const displayName = getSellerDisplayName(audit.vendedor_name)
      groups.set(displayName, [...(groups.get(displayName) || []), audit])
    })

    return [...groups.entries()].map(([fullName, audits]) => ({
      name: fullName.split(' ')[0],
      fullName,
      score: getAverageScore(audits),
      total: audits.length,
      positivos: audits.filter(a => ['Positivo', 'Interessado'].includes(a.lead_sentiment)).length,
    })).sort((a, b) => b.score - a.score)
  }, [filtered, getSellerDisplayName])

  // Dados para pizza de sentimentos
  const sentimentData = useMemo(() => {
    const groups: Record<string, number> = {}
    filtered.forEach(a => {
      const key = ['Positivo', 'Interessado'].includes(a.lead_sentiment) ? 'Positivo'
        : ['Neutro', 'Indeciso'].includes(a.lead_sentiment) ? 'Neutro'
          : a.lead_sentiment
      groups[key] = (groups[key] || 0) + 1
    })
    return Object.entries(groups).map(([name, value]) => ({ name, value }))
  }, [filtered])

  const allVendedores = [...new Set(allData.map(a => a.vendedor_name))].filter(Boolean)
  const allSentimentos = [...new Set(allData.map(a => a.lead_sentiment))].filter(Boolean)

  const PERIOD_OPTS: [Period, string][] = [['7d', '7 dias'], ['30d', '30 dias'], ['90d', '90 dias'], ['all', 'Tudo']]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 md:px-7 pt-4 md:pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sticky top-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Relatórios</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Analytics avançado e exportação de auditorias</p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 size={14} className="text-blue-500 animate-spin" />}
          <button
            onClick={() => exportToCSV(filtered, getSellerDisplayName)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Download size={13} />
            Exportar CSV ({filtered.length})
          </button>
        </div>
      </div>

      <div className="p-4 md:p-7 space-y-5 overflow-y-auto">

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 font-bold">
            <Filter size={11} />
            Filtros
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Período */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
              {PERIOD_OPTS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setPeriod(key); setPage(1) }}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    period === key ? 'bg-blue-600 text-white' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={vendedor}
              onChange={e => { setVendedor(e.target.value); setPage(1) }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all"
            >
              <option value="">Todos os vendedores</option>
              {allVendedores.map(v => <option key={v} value={v}>{getSellerDisplayName(v)}</option>)}
            </select>

            <select
              value={sentimento}
              onChange={e => { setSentimento(e.target.value); setPage(1) }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all"
            >
              <option value="">Todos os sentimentos</option>
              {allSentimentos.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Score mín:</span>
              <input
                type="range" min={0} max={10} step={0.5}
                value={scoreMin}
                onChange={e => { setScoreMin(Number(e.target.value)); setPage(1) }}
                className="w-20 accent-blue-500"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6">{scoreMin}</span>
            </div>

            {(vendedor || sentimento || scoreMin > 0) && (
              <button
                onClick={() => { setVendedor(''); setSentimento(''); setScoreMin(0); setPage(1) }}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-400 transition-colors px-2"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total filtrado', value: filtered.length, icon: BarChart2, color: 'text-blue-400' },
            { label: 'Score médio', value: `${avgScore}/10`, icon: TrendingUp, color: avgScore >= 7 ? 'text-emerald-400' : avgScore >= 5 ? 'text-amber-400' : 'text-red-400' },
            { label: 'Melhor score', value: bestScore > 0 ? `${bestScore.toFixed(1)}/10` : '—', icon: Award, color: 'text-cyan-400' },
            { label: 'Leads críticos', value: critical, icon: TrendingDown, color: 'text-red-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <kpi.icon size={11} className={kpi.color} />
                {kpi.label}
              </div>
              <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Score por vendedor */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Score por Vendedor</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">Média de qualidade no período</div>
            <div className="h-[180px]">
              {vendedorStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendedorStats} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#1e293b' }}
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                      formatter={(val: any, _: any, props: any) => [`${val}/10 (${props.payload.total} aud.)`, props.payload.fullName]}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {vendedorStats.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.score >= 8 ? '#3b82f6' : entry.score >= 6 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  Nenhum dado no período
                </div>
              )}
            </div>
          </div>

          {/* Pizza de sentimentos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Sentimentos</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">Distribuição no período</div>
            <div className="h-[180px]">
              {sentimentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, i) => (
                        <Cell key={i} fill={SENTIMENT_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(val) => <span style={{ fontSize: 10, color: '#94a3b8' }}>{val}</span>}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                  Nenhum dado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ranking de vendedores */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">
            <Users size={13} className="text-blue-400" />
            Ranking de Desempenho
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {vendedorStats.map((v, i) => (
              <Link
                key={v.fullName}
                href={`/relatorios/${encodeURIComponent(v.fullName)}`}
                className="bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 flex items-center gap-3 hover:border-blue-500/30 hover:bg-slate-100 dark:bg-slate-800 transition-all group"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${
                  i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-700'
                }`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 flex-shrink-0">
                  {getInitials(v.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-400 transition-colors truncate flex items-center gap-1">
                    {v.fullName}
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{v.total} auditorias · {v.positivos} positivos</div>
                  <div className="mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        v.score >= 8 ? 'bg-blue-500' : v.score >= 6 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${v.score * 10}%` }}
                    />
                  </div>
                </div>
                <div className={`text-sm font-black flex-shrink-0 ${getScoreColor(v.score)}`}>
                  {v.score.toFixed(1)}
                </div>
              </Link>
            ))}
            {vendedorStats.length === 0 && (
              <div className="col-span-3 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Nenhum dado no período selecionado
              </div>
            )}
          </div>
        </div>

        {/* Tabela completa */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Todas as Auditorias
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">
              {filtered.length} resultados · pág {page}/{Math.max(1, totalPages)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                  {['Data', 'Vendedor', 'Cliente', 'Score', 'Sentimento', 'Resumo IA'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginated.length > 0 ? paginated.map(a => (
                  <tr key={a.id} className="hover:bg-slate-100 dark:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400">
                          {getInitials(getSellerDisplayName(a.vendedor_name) || '?')}
                        </div>
                         <span className="text-[11px] text-slate-700 dark:text-slate-300">{getSellerDisplayName(a.vendedor_name)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-800 dark:text-slate-200 font-medium">{a.cliente_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black ${getScoreColor(a.ai_score)}`}>
                        {a.ai_score?.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        ['Positivo', 'Interessado'].includes(a.lead_sentiment)
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : ['Neutro', 'Indeciso'].includes(a.lead_sentiment)
                            ? 'text-slate-400 dark:text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/30'
                            : a.lead_sentiment === 'Negativo'
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                              : 'text-red-400 bg-red-500/10 border-red-500/30'
                      }`}>
                        {a.lead_sentiment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 dark:text-slate-500 max-w-[260px] truncate">
                      {a.ai_summary || '—'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                      Nenhuma auditoria encontrada com os filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 disabled:opacity-30 transition-colors px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
              >
                <ChevronLeft size={13} /> Anterior
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === page ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 disabled:opacity-30 transition-colors px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
              >
                Próxima <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
