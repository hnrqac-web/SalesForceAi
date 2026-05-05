'use client'

import { useState, useMemo } from 'react'
import { useAuditorias } from '@/hooks/useAuditorias'
import { AuditDetailSheet } from '@/components/AuditDetailSheet'
import { Auditoria } from '@/types/auditoria'
import { getStatus, getStatusColor, getSentimentColor, getScoreColor, formatDate, getInitials } from '@/lib/utils'
import { Search, Filter, Calendar, User, Loader2 } from 'lucide-react'

export default function AuditoriasPage() {
  const { data, isLoading, error } = useAuditorias()
  const [selected, setSelected] = useState<Auditoria | null>(null)
  const [filterVendedor, setFilterVendedor] = useState('')
  const [filterData, setFilterData] = useState('')
  const [filterCliente, setFilterCliente] = useState('')

  const vendedores = useMemo(() => [...new Set(data.map((a) => a.vendedor_name))], [data])

  const filtered = useMemo(() => data.filter((a) => {
    const matchV = !filterVendedor || a.vendedor_name === filterVendedor
    const matchD = !filterData || a.created_at.startsWith(filterData)
    const matchC = !filterCliente || a.cliente_name.toLowerCase().includes(filterCliente.toLowerCase())
    return matchV && matchD && matchC
  }), [data, filterVendedor, filterData, filterCliente])

  return (
    <div className="flex flex-col h-full">
      <div className="px-7 pt-6 pb-4 border-b border-slate-800 flex justify-between items-end bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Feed de Auditoria</h1>
          <p className="text-xs text-slate-500 mt-0.5">Acompanhe as conversas analisadas pela IA em tempo real</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative group">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-300 pl-9 pr-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
              value={filterVendedor}
              onChange={(e) => setFilterVendedor(e.target.value)}
            >
              <option value="">Todos os vendedores</option>
              {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          
          <div className="relative group">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="date"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-300 pl-9 pr-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-300 pl-9 pr-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              value={filterCliente}
              onChange={(e) => setFilterCliente(e.target.value)}
            />
          </div>
        </div>

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
                  ? [...Array(6)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-6 py-5">
                            <div className="h-2.5 bg-slate-800 rounded-full w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((a) => {
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
                          <td className="px-6 py-5">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                              {a.cliente_name}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">WhatsApp Chat</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400">
                                {getInitials(a.vendedor_name)}
                              </div>
                              <span className="text-[11px] text-slate-300 font-medium">{a.vendedor_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[11px] text-slate-500 font-medium">
                            {formatDate(a.created_at)}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${statusCls}`}>
                              {status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${sentimentCls}`}>
                              {a.lead_sentiment.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`text-base font-black tracking-tighter ${scoreCls}`}>
                              {a.ai_score.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
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
          {filtered.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-800 rounded-full mb-3 text-slate-600">
                <Filter size={20} />
              </div>
              <p className="text-xs text-slate-500">Nenhuma auditoria encontrada para os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>

      <AuditDetailSheet auditoria={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
