'use client'

import { useState } from 'react'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'

const integrationFields = [
  { label: 'Supabase URL', key: 'supabaseUrl', placeholder: 'https://xxxxxxxx.supabase.co' },
  { label: 'Supabase Anon Key', key: 'supabaseKey', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
  { label: 'Evolution API URL', key: 'evolutionUrl', placeholder: 'http://seu-servidor:8080' },
  { label: 'n8n Webhook URL', key: 'n8nUrl', placeholder: 'https://n8n.seudominio.io/webhook/...' },
  { label: 'Gemini API Key', key: 'geminiKey', placeholder: 'AIzaSy...' },
]

export default function SettingsPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <div className="px-7 pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50">Configurações</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gerencie perfil e integrações da plataforma</p>
      </div>

      <div className="p-7 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Perfil do Administrador</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nome completo', value: 'Gestor Silva' },
              { label: 'Email', value: 'gestor@empresa.com.br' },
              { label: 'Empresa', value: 'TSplus Brasil' },
              { label: 'Cargo', value: 'Consultor Comercial' },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[10px] text-slate-500 mb-1">{f.label}</div>
                <input
                  type="text"
                  defaultValue={f.value}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors">
            Salvar alterações
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-sm font-semibold mb-4">Chaves de Integração</div>
          <div className="space-y-3">
            {integrationFields.map((f) => (
              <div key={f.key}>
                <div className="text-[10px] text-slate-500 mb-1">{f.label}</div>
                <div className="flex gap-2">
                  <input
                    type={showKeys[f.key] ? 'text' : 'password'}
                    placeholder={f.placeholder}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 px-3 py-2 text-xs font-mono outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => toggle(f.key)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showKeys[f.key] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-500/8 border border-amber-500/25 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1">
              <AlertTriangle size={12} />
              Atenção — Segurança
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Nunca exponha chaves sensíveis no frontend em produção. Use variáveis de ambiente e Edge Functions do Supabase quando necessário. Configure as chaves via arquivo <code className="bg-slate-800 px-1 rounded">.env.local</code> localmente.
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-sm font-semibold mb-3">Sobre o Produto</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Versão', value: '1.0.0' },
              { label: 'Ambiente', value: 'Produção' },
              { label: 'Stack', value: 'Next.js + Supabase' },
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
