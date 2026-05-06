'use client'

import { useState, useEffect } from 'react'
import { QrCode, Smartphone, RefreshCw, Info, Loader2, AlertCircle, Trash2, X, Edit2, Check, Globe, Link } from 'lucide-react'
import { evolutionService } from '@/lib/evolution'
import { useSellerNames } from '@/hooks/useSellerNames'

export default function WhatsAppSetupPage() {
  const { getInstanceDisplayName, setCustomSellerName } = useSellerNames()
  const [instances, setInstances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [savingWebhook, setSavingWebhook] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const loadInstances = async () => {
    try {
      setLoading(true)
      const data = await evolutionService.getInstances()
      setInstances(data)
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

  const handleSaveWebhook = async () => {
    console.log('--- BOTÃO CLICADO ---');
    setWebhookStatus(null);
    
    if (!webhookUrl) {
      console.log('Erro: URL vazia');
      setWebhookStatus({ type: 'error', message: 'Por favor, cole a URL do n8n.' });
      return;
    }
    
    const instanceName = selectedInstance?.name || selectedInstance?.instanceName || (selectedInstance?.instance && selectedInstance.instance.instanceName);
    console.log('Instância alvo:', instanceName);

    if (!instanceName) {
      setWebhookStatus({ type: 'error', message: 'ID da instância não encontrado.' });
      return;
    }

    setSavingWebhook(true);
    try {
      await evolutionService.setWebhook(instanceName, webhookUrl);
      setWebhookStatus({ type: 'success', message: 'Configurado com sucesso!' });
      console.log('Configuração salva com sucesso no servidor');
    } catch (err: any) {
      console.error('Falha no salvamento:', err);
      const msg = err.details?.message || err.message || 'Erro de conexão.';
      setWebhookStatus({ type: 'error', message: msg });
    } finally {
      setSavingWebhook(false);
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
    setNewName(getInstanceDisplayName(inst))
  }

  const saveName = (inst: any) => {
    setCustomSellerName(inst, newName)
    if (selectedInstance && (selectedInstance.id || selectedInstance.name) === (inst.id || inst.name)) {
      setSelectedInstance({ ...selectedInstance })
    }
    setEditingId(null)
    setNewName('')
  }

  return (
    <div className="relative min-h-screen">
      <div className="px-4 md:px-7 pt-4 md:pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">WhatsApp Setup</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Conecte instâncias da Evolution API para capturar conversas comerciais</p>
        </div>
        <button 
          type="button"
          onClick={loadInstances}
          className="p-2 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white transition-colors cursor-pointer"
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

        {/* ... Restante da lista de instâncias ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Status da Evolution API
              <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${instances.length > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 dark:text-slate-500 bg-slate-500/10 border-slate-500/30'}`}>
                {instances.length > 0 ? 'Online' : 'Vazio'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Instâncias</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{instances.length}</div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Ativas</div>
                <div className="text-xl font-bold text-emerald-400">
                  {instances.filter(i => (i.status === 'open' || i.connectionStatus === 'open')).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center">
            {qrCode ? (
              <div className="text-center">
                <img src={qrCode} className="w-32 h-32 mx-auto rounded-lg border-4 border-white mb-2" />
                <button onClick={() => setQrCode(null)} className="text-[10px] text-slate-400 dark:text-slate-500 underline">Fechar</button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={handleGenerateQr}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                Gerar Nova Conexão
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {instances.map((inst) => {
            const isOpen = inst.status === 'open' || inst.connectionStatus === 'open'
            const name = inst.name || inst.instanceName
            const instanceId = inst.id || name
            return (
              <div key={name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {inst.profilePicUrl ? <img src={inst.profilePicUrl} className="w-full h-full object-cover" /> : <Smartphone className="text-slate-400 dark:text-slate-500" size={20} />}
                  </div>
                  <div>
                    {editingId === instanceId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                        />
                        <button type="button" onClick={() => saveName(inst)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Check size={15} />
                        </button>
                        <button type="button" onClick={() => { setEditingId(null); setNewName('') }} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-50">{getInstanceDisplayName(inst)}</div>
                    )}
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">{formatPhone(inst.ownerJid || inst.owner || inst.number)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => startEditing(inst)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-400 hover:border-amber-500/40 rounded-xl cursor-pointer transition-all"
                    title="Editar nome exibido"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedInstance(inst);
                      setWebhookStatus(null);
                    }}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:border-blue-500/40 rounded-xl cursor-pointer transition-all"
                    title="Configurações e Detalhes"
                  >
                    <Info size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(name)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-500/30 rounded-xl cursor-pointer transition-all"
                    title="Excluir instância"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedInstance && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Configurações da Instância</h3>
              <button onClick={() => setSelectedInstance(null)} className="text-slate-400 dark:text-slate-500 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 block">URL do Webhook n8n</label>
                
                {webhookStatus && (
                  <div className={`mb-3 p-3 rounded-xl text-xs flex items-center gap-2 ${webhookStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {webhookStatus.message}
                  </div>
                )}

                <div className="space-y-3">
                  <input 
                    type="text"
                    placeholder="https://seu-n8n.com/webhook/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      console.log('Clique disparado pelo onClick interno');
                      handleSaveWebhook();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    {savingWebhook ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Webhook'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[11px]">Nome exibido</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingId === (selectedInstance.id || selectedInstance.name) ? newName : getInstanceDisplayName(selectedInstance)}
                      onChange={(e) => {
                        setEditingId(selectedInstance.id || selectedInstance.name)
                        setNewName(e.target.value)
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => saveName(selectedInstance)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-emerald-400 hover:text-emerald-300 rounded-xl transition-colors"
                      title="Salvar nome exibido"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Se vazio, o sistema continua usando automaticamente o nome capturado do WhatsApp.</p>
                </div>
                <div className="flex justify-between text-[11px] items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase">Nome da Instância</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {selectedInstance.name || selectedInstance.instanceName}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase">Vendedor (WhatsApp)</span>
                  <span className="text-blue-400 font-bold">
                    {formatPhone(selectedInstance.ownerJid || selectedInstance.owner || selectedInstance.number)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase">JID do Dono</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                    {selectedInstance.ownerJid || selectedInstance.owner || 'Não disponível'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase">Status</span>
                  <span className={`font-bold ${selectedInstance.status === 'open' || selectedInstance.connectionStatus === 'open' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(selectedInstance.status || selectedInstance.connectionStatus || 'Desconhecido').toUpperCase()}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setSelectedInstance(null)}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
