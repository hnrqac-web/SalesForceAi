'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfiguracoesPage() {
  const [ticketMedio, setTicketMedio] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [savedOnce, setSavedOnce] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('@salesforce-ai:ticket-medio')
    if (saved) setTicketMedio(saved)
  }, [])

  const handleSave = () => {
    if (!ticketMedio) return
    setIsSaving(true)
    
    // Simulate network delay for UX
    setTimeout(() => {
      localStorage.setItem('@salesforce-ai:ticket-medio', ticketMedio)
      setIsSaving(false)
      setSavedOnce(true)
      toast.success('Configurações salvas com sucesso!')
      setTimeout(() => setSavedOnce(false), 2000)
    }, 500)
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-h-screen overflow-y-auto w-full transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50 flex items-center gap-3">
              <Settings className="text-blue-500" />
              Configurações
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Personalize os parâmetros do sistema para gerar métricas realistas.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Métricas Financeiras</h2>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Ticket Médio (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="Ex: 1200"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 pl-11 pr-4 py-3 outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Usado para calcular a "Receita em Risco" no Dashboard (Total de Leads Críticos × Ticket Médio).
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !ticketMedio}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                savedOnce 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }`}
            >
              {isSaving ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : savedOnce ? (
                <>
                  <Check size={18} /> Salvo
                </>
              ) : (
                <>
                  <Save size={18} /> Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
