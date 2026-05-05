'use client'

import { useState, useEffect } from 'react'
import { QrCode, Smartphone, RefreshCw, Info, Loader2, AlertCircle, Trash2, X } from 'lucide-react'
import { evolutionService } from '@/lib/evolution'

export default function WhatsAppSetupPage() {
  const [instances, setInstances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<any>(null)

  const loadInstances = async () => {
    try {
      setLoading(true)
      const data = await evolutionService.getInstances()
      const list = Array.isArray(data) ? data : data.instances || []
      setInstances(list)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar instâncias. Verifique sua configuração da Evolution API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInstances()
  }, [])

  const handleGenerateQr = async () => {
    setGenerating(true)
    setQrCode(null)
    try {
      const instanceName = `Admin-${Math.floor(Math.random() * 1000)}`
      const result = await evolutionService.createInstance(instanceName)
      
      const name = result.instance?.instanceName || result.instanceName
      if (name) {
        const qrData = await evolutionService.getQrCode(name)
        if (qrData.base64) {
          setQrCode(qrData.base64)
        }
        loadInstances()
      }
    } catch (err: any) {
      const errorMsg = err.details?.message || (typeof err.details === 'string' ? err.details : null) || err.error || JSON.stringify(err.details) || 'Erro desconhecido.'
      setError(`Erro: ${errorMsg}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Deseja realmente excluir a instância ${name}?`)) return
    try {
      await evolutionService.deleteInstance(name)
      loadInstances()
      if (selectedInstance?.instanceName === name) setSelectedInstance(null)
    } catch (err) {
      setError('Erro ao excluir instância.')
    }
  }

  const formatPhone = (owner: string) => {
    if (!owner) return 'Aguardando conexão...'
    // Remove @s.whatsapp.net e limpa
    const clean = owner.split('@')[0]
    // Formato +55 (11) 99999-9999
    if (clean.length >= 11) {
      return `+${clean.substring(0, 2)} (${clean.substring(2, 4)}) ${clean.substring(4, 9)}-${clean.substring(9)}`
    }
    return `+${clean}`
  }

  return (
    <div className="relative min-h-screen">
      <div className="px-7 pt-6 pb-4 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">WhatsApp Setup</h1>
          <p className="text-xs text-slate-500 mt-0.5">Conecte instâncias da Evolution API para capturar conversas comerciais</p>
        </div>
        <button 
          onClick={loadInstances}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Recarregar"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-7">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Status da Evolution API</div>
              <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${instances.length > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-500 bg-slate-500/10 border-slate-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${instances.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'} inline-block`} />
                {instances.length > 0 ? 'Online' : 'Verificando...'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-500">Instâncias Totais</div>
                <div className="text-base font-bold text-slate-200">{instances.length}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-500">Conectadas</div>
                <div className="text-base font-bold text-slate-200">
                  {instances.filter(i => (i.status === 'open' || i.connectionStatus === 'open')).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center w-full min-h-[160px] flex flex-col items-center justify-center">
              {qrCode ? (
                <div className="space-y-3 relative group">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-32 h-32 mx-auto rounded-lg border-4 border-white shadow-2xl" />
                  <p className="text-[10px] font-bold text-blue-400 animate-pulse">Escaneie agora!</p>
                  <button onClick={() => setQrCode(null)} className="text-[10px] text-slate-500 hover:text-slate-300 underline">Fechar</button>
                </div>
              ) : (
                <>
                  <QrCode size={40} className="text-slate-600 mx-auto mb-3" />
                  <div className="text-xs text-slate-500 mb-3">
                    {generating ? 'Gerando QR Code...' : 'Crie uma nova instância para conectar'}
                  </div>
                  <button 
                    onClick={handleGenerateQr}
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Smartphone size={12} />}
                    Nova Instância
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-bold">Suas Instâncias</div>
        
        {loading && instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="animate-spin mb-2" />
            <span className="text-xs">Carregando instâncias...</span>
          </div>
        ) : instances.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl py-12 text-center">
            <Smartphone size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhuma instância encontrada.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {instances.map((inst) => {
              const isOpen = inst.status === 'open' || inst.connectionStatus === 'open'
              const name = inst.instanceName || inst.name
              const owner = inst.owner || inst.number
              
              return (
                <div key={name} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${isOpen ? 'bg-blue-600' : 'bg-slate-700'} flex items-center justify-center text-[10px] font-bold text-white uppercase`}>
                      {name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {formatPhone(owner)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${isOpen ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
                      {isOpen ? 'Conectado' : 'Aguardando'}
                    </span>
                    <button 
                      onClick={() => handleDelete(name)}
                      className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                      onClick={() => setSelectedInstance(inst)}
                      className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 rounded-lg px-3 py-1.5 text-[11px] transition-colors"
                    >
                      <Info size={11} /> Detalhes
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes Simples */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-semibold text-slate-50">Detalhes da Instância</h3>
              <button onClick={() => setSelectedInstance(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome</label>
                  <div className="text-sm text-slate-200">{selectedInstance.instanceName || selectedInstance.name}</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status de Conexão</label>
                  <div className="text-sm text-slate-200 uppercase">{selectedInstance.status || selectedInstance.connectionStatus}</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Número Vinculado</label>
                  <div className="text-sm text-slate-200">{selectedInstance.owner || selectedInstance.number || 'Não vinculado'}</div>
                </div>
                {selectedInstance.profileName && (
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome no Perfil</label>
                    <div className="text-sm text-slate-200">{selectedInstance.profileName}</div>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <button 
                  onClick={() => setSelectedInstance(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-sm transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
