'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuditorias } from '@/hooks/useAuditorias'
import { getScoreColor, getSentimentColor, getInitials, formatDate } from '@/lib/utils'
import { Auditoria } from '@/types/auditoria'
import { Search, X, Zap, Clock, ArrowRight } from 'lucide-react'
import { AuditDetailSheet } from './AuditDetailSheet'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Auditoria | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data } = useAuditorias()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return []
    const q = query.toLowerCase()
    return data.filter(a =>
      (a.cliente_name || '').toLowerCase().includes(q) ||
      (a.vendedor_name || '').toLowerCase().includes(q) ||
      (a.ai_summary || '').toLowerCase().includes(q) ||
      (a.lead_sentiment || '').toLowerCase().includes(q) ||
      (a.next_step_suggestion || '').toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query, data])

  const recent = useMemo(() => data.slice(0, 5), [data])
  const showRecent = query.length < 2

  if (!isOpen) return null

  function highlight(text: string, q: string) {
    if (!q || !text) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-blue-500/30 text-blue-200 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  function AuditRow({ a, q }: { a: Auditoria; q: string }) {
    return (
      <button
        onClick={() => { setSelected(a); onClose() }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:bg-slate-800/60 transition-colors text-left group rounded-xl"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 flex-shrink-0">
          {getInitials(a.vendedor_name || '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-400 transition-colors truncate">
              {q ? highlight(a.cliente_name || '—', q) : (a.cliente_name || '—')}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 flex-shrink-0">{formatDate(a.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {q ? highlight(a.vendedor_name || '', q) : a.vendedor_name}
            </span>
            {a.ai_summary && (
              <span className="text-[10px] text-slate-600 truncate hidden sm:inline">
                · {q ? highlight(a.ai_summary.slice(0, 60), q) : a.ai_summary.slice(0, 60)}...
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-black ${getScoreColor(a.ai_score)}`}>
            {a.ai_score?.toFixed(1)}
          </span>
          <ArrowRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-start justify-center pt-16 sm:pt-24 px-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in slide-in-from-top-4 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <Search size={16} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por cliente, vendedor, resumo..."
              className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:text-slate-500 text-sm outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors">
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[9px] text-slate-400 dark:text-slate-500 font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] sm:max-h-[480px] overflow-y-auto">
            {showRecent ? (
              <div className="p-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold px-2 py-1.5">
                  <Clock size={10} />
                  Auditorias recentes
                </div>
                {recent.map(a => <AuditRow key={a.id} a={a} q="" />)}
                {recent.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">Nenhuma auditoria encontrada</div>
                )}
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold px-2 py-1.5">
                  <Zap size={10} className="text-blue-400" />
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </div>
                {results.map(a => <AuditRow key={a.id} a={a} q={query} />)}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500">Nenhuma auditoria encontrada para &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 font-mono">↵</kbd> abrir</span>
            <span className="flex items-center gap-1"><kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 font-mono">ESC</kbd> fechar</span>
            <span className="ml-auto">{data.length} auditorias indexadas</span>
          </div>
        </div>
      </div>

      {/* Detail sheet fora do modal */}
      <AuditDetailSheet auditoria={selected} onClose={() => setSelected(null)} />
    </>
  )
}
