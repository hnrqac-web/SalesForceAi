'use client'

import { useState, useMemo } from 'react'
import { useAuditorias } from '@/hooks/useAuditorias'
import { AuditDetailSheet } from '@/components/AuditDetailSheet'
import { Auditoria } from '@/types/auditoria'
import { getStatus, getStatusColor, getSentimentColor, getScoreColor, formatDate, getInitials } from '@/lib/utils'
import { Search, Calendar, User, Loader2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'

const PAGE_SIZE = 15

export default function AuditoriasPage() {
  const { data, isLoading, error } = useAuditorias()
  const [selected, setSelected] = useState<Auditoria | null>(null)
  const [filterVendedor, setFilterVendedor] = useState('')
  const [filterData, setFilterData] = useState('')
  const [filterCliente, setFilterCliente] = useState('')
  const [filterScore, setFilterScore] = useState<'all' | 'alta' | 'atencao' | 'critico'>('all')
  const [page, setPage] = useState(1)

  const vendedores = useMemo(() => [...new Set(data.map((a) => a.vendedor_name))].filter(Boolean), [data])

  const filtered = useMemo(() => {
    return data.filter((a) => {
      if (filterVendedor && a.vendedor_name !== filterVendedor) return false
      if (filterData && !a.created_at.startsWith(filterData)) return false
      if (filterCliente && !(a.cliente_name || '').toLowerCase().includes(filterCliente.toLowerCase())) return false
      if (filterScore === 'alta' && a.ai_score < 8) return false
      if (filterScore === 'atencao' && (a.ai_score < 6 || a.ai_score >= 8)) return false
      if (filterScore === 'critico' && a.ai_score >= 6) return false
      return true
    })
  }, [data, filterVendedor, filterData, filterCliente, filterScore])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasFilters = filterVendedor || filterData || filterCliente || filterScore !== 'all'

  const clearFilters = () => {
    setFilterVendedor('')
    setFilterData('')
    setFilterCliente('')
    setFilterScore('all')
    setPage(1)
  }

  const handleFilter = (setter: (v: any) => void) => (val: any) => {
    setter(val)
    setPage(1)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-7 pt-4 md:pt-6 pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Feed de Auditoria</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLoading ? 'Carregando...' : `${filtered.length} auditoria${filtered.length !== 1 ? 's' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {isLoading && <Loader2 size={16} className="text-blue-500 animate-spin mb-1" />}
      </div>

      <div className="p-4 md:p-7 space-y-4 overflow-y-auto">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-3">
            {/* Vendedor */}
            <div className="relative group">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <select
                className="bg-slate-800 border border-slate-700 rounded-xl text-slate-300 pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                value={filterVendedor}
                onChange={(e) => handleFilter(setFilterVendedor)(e.target.value)}
              >
                <option value="">Todos os vendedores</option>
                {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Data */}
            <div className="relative group">
              <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="date"
                className="bg-slate-800 border border-slate-700 rounded-xl text-slate-300 pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 transition-all"
                value={filterData}
                onChange={(e) => handleFilter(setFilterData)(e.target.value)}
              />
            </div>

            {/* Cliente */}
            <div className="relative group flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-300 pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 transition-all"
                value={filterCliente}
                onChange={(e) => handleFilter(setFilterCliente)(e.target.value)}
              />
            </div>

            {/* Score filter */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
              {([['all', 'Todos'], ['alta', '≥8'], ['atencao', '6–8'], ['critico', '<6']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handleFilter(setFilterScore)(val)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    filterScore === val
                      ? val === 'critico' ? 'bg-red-600 text-white'
                        : val === 'atencao' ? 'bg-amber-600 text-white'
                          : val === 'alta' ? 'bg-blue-600 text-white'
                            : 'bg-slate-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors px-2"
              >
                <X size={12} />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cliente</th>
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vendedor</th>
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Data</th>
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Status IA</th>
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sentimento</th>
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Score</th>
                  <th className="px-6 py-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading && data.length === 0
                  ? [...Array(8)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-6 py-5">
                            <div className="h-2.5 bg-slate-800 rounded-full w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : paginated.map((a) => {
                      const status = getStatus(a.ai_score)
                      const statusCls = getStatusColor(a.ai_score)
                      const sentimentCls = getSentimentColor(a.lead_sentiment)
                      const scoreCls = getScoreColor(a.ai_score)
                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-blue-600/5 group cursor-pointer transition-all duration-200"
                          onClick={() => setSelected(a)}
                        >
                          <td className="px-6 py-4">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                              {a.cliente_name || '—'}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">WhatsApp Chat</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">
                                {getInitials(a.vendedor_name || '?')}
                              </div>
                              <span className="text-[11px] text-slate-300 font-medium">{a.vendedor_name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[11px] text-slate-500 font-medium whitespace-nowrap">
                            {formatDate(a.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${statusCls}`}>
                              {status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${sentimentCls}`}>
                              {(a.lead_sentiment || '').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-base font-black tracking-tighter ${scoreCls}`}>
                              {a.ai_score?.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[10px] font-bold text-slate-600 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">
                              Analisar →
                            </button>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>

          {/* Estado vazio */}
          {filtered.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3 text-slate-600">
                <Filter size={20} />
              </div>
              <p className="text-xs text-slate-500">Nenhuma auditoria encontrada para os filtros selecionados.</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-3 text-xs text-blue-400 hover:underline">
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700"
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
                          p === page ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
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
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700"
                >
                  Próxima <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuditDetailSheet auditoria={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
