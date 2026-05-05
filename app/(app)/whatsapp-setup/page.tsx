'use client'

import { QrCode, Smartphone, RefreshCw, Info } from 'lucide-react'

const instances = [
  { name: 'Celular — Mariana Costa', initials: 'MC', phone: '+55 11 9xxxx-8721', status: 'Conectado', activity: 'há 5 min', bg: 'bg-blue-800', statusCls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { name: 'Celular — Rafael Lima', initials: 'RL', phone: '+55 11 9xxxx-3340', status: 'Conectado', activity: 'há 18 min', bg: 'bg-cyan-800', statusCls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { name: 'Celular — Bruno Almeida', initials: 'BA', phone: 'Aguardando QR Code', status: 'Aguardando', activity: '—', bg: 'bg-violet-800', statusCls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
]

export default function WhatsAppSetupPage() {
  return (
    <div>
      <div className="px-7 pt-6 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50">WhatsApp Setup</h1>
        <p className="text-xs text-slate-500 mt-0.5">Conecte instâncias da Evolution API para capturar conversas comerciais</p>
      </div>

      <div className="p-7">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Status da Evolution API</div>
              <span className="text-[10px] px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Online
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mb-1">Versão: 2.1.4 · Porta: 8080</div>
            <div className="text-[11px] text-slate-500 mb-3">Última sincronização: há 2 min</div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-500">Mensagens hoje</div>
                <div className="text-base font-bold text-slate-200">247</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-500">Instâncias ativas</div>
                <div className="text-base font-bold text-slate-200">2/3</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center w-full">
              <QrCode size={40} className="text-slate-600 mx-auto mb-3" />
              <div className="text-xs text-slate-500 mb-3">QR Code de conexão aparecerá aqui</div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 mx-auto">
                <Smartphone size={12} />
                Gerar QR Code
              </button>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Instâncias Conectadas</div>
        <div className="space-y-2">
          {instances.map((inst) => (
            <div key={inst.name} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${inst.bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {inst.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{inst.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {inst.phone} {inst.activity !== '—' && `· Última atividade: ${inst.activity}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${inst.statusCls}`}>{inst.status}</span>
                <button className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 rounded-lg px-3 py-1.5 text-[11px] transition-colors">
                  {inst.status === 'Aguardando' ? <><RefreshCw size={11} /> Reconectar</> : <><Info size={11} /> Ver detalhes</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
