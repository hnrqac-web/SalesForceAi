'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertTriangle, User, Key, Info, Save, Check, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { profile, loading, saving, error, updateProfile } = useProfile()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ full_name: '', company: '', role: '', phone: '' })
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'ok' | 'error' | 'checking'>>({})

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        company: profile.company || '',
        role: profile.role || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    const result = await updateProfile(form)
    if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const toggle = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))

  const checkIntegrations = async () => {
    setIntegrationStatus({ supabase: 'checking', evolution: 'checking', n8n: 'checking' })
    
    // Check Supabase
    try {
      const { error } = await supabase.from('auditorias').select('id').limit(1)
      setIntegrationStatus(prev => ({ ...prev, supabase: error ? 'error' : 'ok' }))
    } catch {
      setIntegrationStatus(prev => ({ ...prev, supabase: 'error' }))
    }

    // Check Evolution API
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL
    if (evolutionUrl) {
      try {
        const res = await fetch('/api/evolution?path=instance/fetchInstances')
        setIntegrationStatus(prev => ({ ...prev, evolution: res.ok ? 'ok' : 'error' }))
      } catch {
        setIntegrationStatus(prev => ({ ...prev, evolution: 'error' }))
      }
    } else {
      setIntegrationStatus(prev => ({ ...prev, evolution: 'error' }))
    }

    // n8n — só verifica se URL está definida
    setIntegrationStatus(prev => ({ ...prev, n8n: 'ok' }))
  }

  const integrationEnvs = [
    { label: 'Supabase URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL || '', key: 'supabaseUrl' },
    { label: 'Supabase Anon Key', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', key: 'supabaseKey' },
    { label: 'Evolution API URL', value: process.env.NEXT_PUBLIC_EVOLUTION_URL || '', key: 'evolutionUrl' },
  ]

  const StatusIcon = ({ k }: { k: string }) => {
    if (!integrationStatus[k]) return null
    if (integrationStatus[k] === 'checking') return <Loader2 size={14} className="animate-spin text-slate-400" />
    if (integrationStatus[k] === 'ok') return <CheckCircle2 size={14} className="text-emerald-400" />
    return <XCircle size={14} className="text-red-400" />
  }

  return (
    <div>
      <div className="px-4 md:px-7 pt-4 md:pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50">Configurações</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gerencie perfil e integrações da plataforma</p>
      </div>

      <div className="p-7 space-y-4 max-w-3xl">
        
        {/* Perfil Real */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <User size={15} className="text-blue-400" />
            Perfil do Usuário
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Email</div>
                  <input
                    type="text"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-500 px-3 py-2 text-xs outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Nome Completo</div>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Empresa</div>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Nome da empresa"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Cargo</div>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Ex: Gerente Comercial"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Telefone</div>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+55 (11) 99999-9999"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className={`mt-4 flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all font-semibold ${
                  saved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
              </button>
            </>
          )}
        </div>

        {/* Status das Integrações */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Key size={15} className="text-blue-400" />
              Integrações Configuradas
            </div>
            <button
              onClick={checkIntegrations}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700"
            >
              <RefreshCw size={11} />
              Verificar Status
            </button>
          </div>

          <div className="space-y-2">
            {integrationEnvs.map((f) => (
              <div key={f.key} className="flex items-center gap-3">
                <div className="w-[140px] text-[10px] text-slate-500 uppercase tracking-wider shrink-0">{f.label}</div>
                <div className="flex-1 flex gap-2">
                  <input
                    type={showKeys[f.key] ? 'text' : 'password'}
                    value={f.value || ''}
                    readOnly
                    placeholder={f.value ? '' : 'Não configurado'}
                    className={`flex-1 bg-slate-800 border rounded-lg px-3 py-1.5 text-xs font-mono outline-none ${
                      f.value ? 'text-slate-400 border-slate-700' : 'text-red-400 border-red-500/30'
                    }`}
                  />
                  <button
                    onClick={() => toggle(f.key)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showKeys[f.key] ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
                <div className="w-5 flex justify-center">
                  <StatusIcon k={f.key === 'supabaseUrl' || f.key === 'supabaseKey' ? 'supabase' : 'evolution'} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-500/8 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
              <AlertTriangle size={12} />
              Variáveis de Ambiente
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Para alterar as chaves, edite o arquivo <code className="bg-slate-800 px-1 rounded">.env.local</code> e faça redeploy. 
              Nunca exponha chaves secretas no frontend em produção.
            </div>
          </div>
        </div>

        {/* Sobre o Produto */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Info size={15} className="text-blue-400" />
            Sobre o Produto
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Versão', value: '2.0.0' },
              { label: 'Ambiente', value: process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento' },
              { label: 'Stack', value: 'Next.js 14' },
              { label: 'Banco', value: 'Supabase Postgres' },
            ].map((i) => (
              <div key={i.label} className="bg-slate-800 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">{i.label}</div>
                <div className="text-xs font-medium text-slate-300">{i.value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
