'use client'

import { useState, useEffect } from 'react'
import { QrCode, Smartphone, RefreshCw, Info, Loader2, AlertCircle, Trash2, X, Edit2, Check } from 'lucide-react'
import { evolutionService } from '@/lib/evolution'

export default function WhatsAppSetupPage() {
  const [instances, setInstances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

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
      
      const name = result.instance?.instanceName || result.instanceName || result.name
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
      if (selectedInstance?.instanceName === name || selectedInstance?.name === name) setSelectedInstance(null)
    } catch (err) {
      setError('Erro ao excluir instância.')
    }
  }

  const formatPhone = (owner: any) => {
    if (!owner) return 'Número não identificado'
    const strOwner = String(owner)
    const clean = strOwner.split('@')[0].replace(/\D/g, '')
    if (clean.length >= 11) {
      return `+${clean.substring(0, 2)} (${clean.substring(2, 4)}) ${clean.substring(4, 9)}-${clean.substring(9)}`
    }
    return `+${clean}`
  }

  const startEditing = (inst: any) => {
    setEditingId(inst.id || inst.name)
    setNewName(inst.name || inst.instanceName)
  }

  const saveName = () => {
    // Como a API não suporta renomear, aqui poderíamos salvar um "apelido" no Supabase.
    // Por enquanto, vamos apenas simular a interface de sucesso.
    setEditingId(null)
    alert('Funcionalidade de apelido será vinculada ao seu banco de dados Supabase em breve!')
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
              <div className="text-sm font-semibold text-slate-200">Status da Evolution API</div>
              <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${instances.length > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-500 bg-slate-500/10 border-slate-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${instances.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'} inline-block`} />
                {instances.length > 0 ? 'Online' : 'Verificando...'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Instâncias</div>
                <div className="text-xl font-bold text-slate-200">{instances.length}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Ativas</div>
                <div className="text-xl font-bold text-emerald-400">
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
                  <p className="text-[10px] font-bold text-blue-400 animate-pulse uppercase tracking-tighter">Escaneie com seu celular</p>
                  <button onClick={() => setQrCode(null)} className="text-[10px] text-slate-500 hover:text-slate-300 underline">Fechar QR Code</button>
                </div>
              ) : (
                <>
                  <QrCode size={40} className="text-slate-600 mx-auto mb-3" />
                  <div className="text-xs text-slate-500 mb-3">
                    {generating ? 'Iniciando instância...' : 'Gere um novo acesso para auditar'}
                  </div>
                  <button 
                    onClick={handleGenerateQr}
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 mx-auto font-semibold"
                  >
                    {generating ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />}
                    Gerar Nova Conexão
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-4 font-bold flex items-center gap-2">
          <div className="h-px bg-slate-800 flex-1"></div>
          Conexões Ativas
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>
        
        {loading && instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="animate-spin mb-2" />
            <span className="text-xs">Buscando dados no Railway...</span>
          </div>
        ) : instances.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl py-12 text-center">
            <Smartphone size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhuma instância conectada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {instances.map((inst) => {
              const isOpen = inst.status === 'open' || inst.connectionStatus === 'open'
              const name = inst.name || inst.instanceName
              const owner = inst.ownerJid || inst.owner || inst.number
              const isEditing = editingId === (inst.id || inst.name)
              
              return (
                <div key={name} className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between group hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {inst.profilePicUrl ? (
                        <img src={inst.profilePicUrl} alt={name} className="w-12 h-12 rounded-full border-2 border-slate-800 object-cover" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${isOpen ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'} border-2 border-slate-800 flex items-center justify-center text-xs font-bold uppercase`}>
                          {name.substring(0, 2)}
                        </div>
                      )}
                      {isOpen && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input 
                              autoFocus
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveName()}
                              className="bg-slate-950 border border-blue-500 rounded px-2 py-0.5 text-sm text-slate-200 outline-none"
                            />
                            <button onClick={saveName} className="text-emerald-400 hover:text-emerald-300"><Check size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-bold text-slate-50">{inst.profileName || 'Usuário WhatsApp'}</div>
                            <button 
                              onClick={() => startEditing(inst)}
                              className="p-1 text-slate-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Edit2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="text-[11px] text-slate-500 font-medium px-1.5 py-0.5 bg-slate-800 rounded leading-none">{name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {isOpen ? formatPhone(owner) : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${isOpen ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {isOpen ? 'Conectado' : 'Aguardando'}
                      </div>
                      <div className="text-[9px] text-slate-600">Desde {new Date(inst.createdAt || Date.now()).toLocaleDateString('pt-BR')}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setSelectedInstance(inst)}
                        className="p-2.5 bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 rounded-xl transition-all"
                        title="Detalhes"
                      >
                        <Info size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(name)}
                        className="p-2.5 bg-slate-800/50 border border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes Aprimorado */}
      {selectedInstance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-700">
              <button 
                onClick={() => setSelectedInstance(null)} 
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-10 left-8">
                {selectedInstance.profilePicUrl ? (
                  <img src={selectedInstance.profilePicUrl} className="w-24 h-24 rounded-2xl border-4 border-slate-900 shadow-xl object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-600 shadow-xl">
                    {selectedInstance.profileName?.substring(0, 1) || 'W'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-14 px-8 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-50">{selectedInstance.profileName || 'Usuário WhatsApp'}</h3>
                  <p className="text-slate-400 text-sm mt-1">{formatPhone(selectedInstance.ownerJid || selectedInstance.owner || selectedInstance.number)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${selectedInstance.connectionStatus === 'open' || selectedInstance.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {selectedInstance.connectionStatus || selectedInstance.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800/40 p-4 rounded-2xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">ID da Instância</div>
                  <div className="text-xs text-slate-300 font-mono truncate">{selectedInstance.id || 'N/A'}</div>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-2xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nome Técnico</div>
                  <div className="text-xs text-slate-300">{selectedInstance.name || selectedInstance.instanceName}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs py-2 border-b border-slate-800">
                  <span className="text-slate-500">Integração</span>
                  <span className="text-slate-300 font-semibold">{selectedInstance.integration || 'WHATSAPP-BAILEYS'}</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-slate-800">
                  <span className="text-slate-500">Criada em</span>
                  <span className="text-slate-300 font-semibold">{new Date(selectedInstance.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                {selectedInstance._count && (
                  <div className="flex justify-between text-xs py-2 border-b border-slate-800">
                    <span className="text-slate-500">Total de Mensagens</span>
                    <span className="text-slate-300 font-semibold">{selectedInstance._count.Message?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedInstance(null)}
                className="w-full mt-8 bg-slate-50 hover:bg-white text-slate-900 font-bold py-3 rounded-2xl transition-all shadow-xl shadow-white/5"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
