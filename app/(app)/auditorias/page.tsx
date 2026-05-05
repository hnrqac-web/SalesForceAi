'use client'

import { useState } from 'react'
import { useAuditorias } from '@/hooks/useAuditorias'
import { AuditDetailSheet } from '@/components/AuditDetailSheet'
import { Auditoria } from '@/types/auditoria'
import { getStatus, getStatusColor, getSentimentColor, getScoreColor, formatDate, getInitials } from '@/lib/utils'
import { Search } from 'lucide-react'

export default function AuditoriasPage() {
  const { data, isLoading, error } = useAuditorias()
  const [selected, setSelected] = useState<Auditoria | null>(null)
  const [filterVendedor, setFilterVendedor] = useState('')
  const [filterData, setFilterData] = useState('')
  const [filterCliente, setFilterCliente] = useState('')

  const vendedores = [...new Set(data.map((a) => a.vendedor_name))]

  const filtered = data.filter((a) => {
    const matchV = !filterVendedor || a.vendedor_name === filterVendedor
    const matchD = !filterData || a.created_at.startsWith(filterData)
    const matchC = !filterCliente || a.cliente_name.toLowerCase().includes(filterCliente.toLowerCase())
    return matchV && matchD && matchC
  })

  return (
    <div>
      <div className="px-7 pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50">Feed de Auditoria</h1>
        <p className="text-xs text-slate-500 mt-0.5">Acompanhe as conversas analisadas pela IA</p>
      </div>

      <div className="p-7">
        {error && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            className="bg-slate-900 border border-slate-700 rounded-lg text-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
            value={filterVendedor}
            onChange={(e) => setFilterVendedor(e.target.value)}
          >
            <option value="">Todos os vendedores</option>
            {vendedores.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <input
            type="date"
            className="bg-slate-900 border border-slate-700 rounded-lg text-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
            value={filterData}
            onChange={(e) => setFilterData(e.target.value)}
          />
          <div className="flex-1 relative min-w-[180px]">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-300 pl-8 pr-3 py-2 text-xs outline-none focus:border-blue-500"
              value={filterCliente}
              onChange={(e) => setFilterCliente(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Cliente', 'Vendedor', 'Data', 'Status', 'Sentimento IA', 'Nota IA', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-slate-800 rounded animate-pulse" />
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
                        className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-colors"
                        onClick={() => setSelected(a)}
                      >
                        <td className="px-4 py-3 text-xs font-medium text-slate-200">{a.cliente_name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-800 flex items-center justify-center text-[8px] font-bold text-blue-200">
                              {getInitials(a.vendedor_name)}
                            </div>
                            <span className="text-xs text-slate-300">{a.vendedor_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.created_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${statusCls}`}>{status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${sentimentCls}`}>{a.lead_sentiment}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${scoreCls}`}>{a.ai_score}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-blue-400 hover:text-blue-300">Ver Raio-X →</span>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>

      <AuditDetailSheet auditoria={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
