import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()

  try {
    return JSON.parse(text)
  } catch {
    return { message: text || response.statusText }
  }
}

export async function POST(req: NextRequest) {
  try {
    void req

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL
    const evolutionKey = process.env.EVOLUTION_API_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase incompleta. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      )
    }

    if (!evolutionUrl || !evolutionKey) {
      return NextResponse.json(
        { error: 'Configuração da Evolution API incompleta. Defina NEXT_PUBLIC_EVOLUTION_URL e EVOLUTION_API_KEY.' },
        { status: 500 }
      )
    }

    const baseEvolutionUrl = evolutionUrl.endsWith('/') ? evolutionUrl.slice(0, -1) : evolutionUrl

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Busca instâncias
    console.log('[Sync] Buscando instâncias...')
    const instResponse = await fetch(`${baseEvolutionUrl}/instance/fetchInstances`, {
      headers: { apikey: evolutionKey }
    })
    const instData = await parseResponse(instResponse)
    if (!instResponse.ok) {
      console.error('[Sync] Falha ao buscar instâncias:', instData)
      return NextResponse.json(
        { error: 'Falha ao buscar instâncias na Evolution API', details: instData },
        { status: instResponse.status }
      )
    }

    const instances = Array.isArray(instData) ? instData : (instData?.data || instData?.response || [])
    
    console.log(`[Sync] Encontradas ${instances.length} instâncias.`)

    let totalImported = 0
    // Processa todas as instâncias encontradas
    for (const inst of instances) {
      const name = inst.instanceName || inst.name || inst.instance?.instanceName || inst.instance?.name
      const status = inst.status || inst.connectionStatus || inst.instance?.status
      
      console.log(`[Sync] Processando instância: ${name}, Status: ${status}`)
      
      if (!name) continue;

      const owner = inst.owner || 
                    inst.instance?.owner || 
                    inst.data?.owner || 
                    inst.connection?.owner || 
                    inst.instance?.data?.owner

      const vendedorId = owner ? (typeof owner === 'string' ? owner.split('@')[0].replace(/\D/g, '') : owner) : name

      // 2. Tenta buscar CHATS
      console.log(`[Sync] Buscando chats para ${name}...`)
      const chatsResponse = await fetch(`${baseEvolutionUrl}/chat/findChats/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: evolutionKey },
        body: JSON.stringify({})
      })
      
      const chatsData = await parseResponse(chatsResponse)
      if (!chatsResponse.ok) {
        console.error(`[Sync] Falha ao buscar chats para ${name}:`, chatsData)
        continue
      }

      let chats = Array.isArray(chatsData) ? chatsData : (chatsData?.data || chatsData?.response || [])
      
      // 3. Fallback para CONTATOS se chats estiver vazio
      if (chats.length === 0) {
        console.log(`[Sync] Chats vazios para ${name}, tentando contatos...`)
        const contactsResponse = await fetch(`${baseEvolutionUrl}/chat/findContacts/${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: evolutionKey },
          body: JSON.stringify({})
        })

        const contactsData = await parseResponse(contactsResponse)
        if (!contactsResponse.ok) {
          console.error(`[Sync] Falha ao buscar contatos para ${name}:`, contactsData)
          continue
        }

        chats = Array.isArray(contactsData) ? contactsData : (contactsData?.data || contactsData?.response || [])
      }

      console.log(`[Sync] Encontrados ${chats.length} registros para ${name}`)
      const recentToProcess = chats.slice(0, 20)

      // 4. Processa cada registro
      for (const chat of recentToProcess) {
        const jid = chat.id || chat.remoteJid || chat.jid
        if (!jid) continue;

        const clienteNome = chat.name || chat.pushName || jid.split('@')[0]
        
        try {
          const { error: rpcError } = await supabase.rpc('add_message_to_auditoria', {
            p_cliente_jid: jid,
            p_cliente_name: clienteNome,
            p_vendedor_name: vendedorId,
            p_message: 'Sincronização manual (Resiliente)',
            p_from_me: true
          })
          
          if (!rpcError) totalImported++
        } catch (e) {
          console.error(`[Sync] Erro ao processar JID ${jid}:`, e)
        }
      }
    }

    return NextResponse.json({ success: true, imported: totalImported })
  } catch (error: any) {
    console.error('[Sync API] Erro:', error)
    return NextResponse.json({ error: error.message || 'Erro interno na sincronização' }, { status: 500 })
  }
}
