import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL
    const evolutionKey = process.env.EVOLUTION_API_KEY

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Busca instâncias
    const instResponse = await fetch(`${evolutionUrl}/instance/fetchInstances`, {
      headers: { 'apikey': evolutionKey! }
    })
    const instData = await instResponse.json()
    const instances = Array.isArray(instData) ? instData : (instData?.data || instData?.response || [])

    let totalImported = 0
    const activeInstances = instances.filter((i: any) => (i.status === 'open' || i.connectionStatus === 'open'))

    for (const inst of activeInstances) {
      const name = inst.instanceName || inst.name
      const owner = inst.owner || inst.instance?.owner
      const vendedorId = owner ? owner.split('@')[0].replace(/\D/g, '') : name

      // 2. Busca chats recentes da instância
      const chatsResponse = await fetch(`${evolutionUrl}/chat/findChats/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionKey! },
        body: JSON.stringify({})
      })
      
      const chatsData = await chatsResponse.json()
      const chats = Array.isArray(chatsData) ? chatsData : (chatsData?.data || chatsData?.response || [])
      const recentChats = chats.slice(0, 15)

      // 3. Processa cada chat
      await Promise.all(recentChats.map(async (chat: any) => {
        const jid = chat.id || chat.remoteJid
        const clienteNome = chat.name || chat.pushName || jid.split('@')[0]
        
        const { error: rpcError } = await supabase.rpc('add_message_to_auditoria', {
          p_cliente_jid: jid,
          p_cliente_name: clienteNome,
          p_vendedor_name: vendedorId,
          p_message: 'Sincronização manual via API',
          p_from_me: true
        })
        
        if (!rpcError) totalImported++
      }))
    }

    return NextResponse.json({ success: true, imported: totalImported })
  } catch (error: any) {
    console.error('[Sync API] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
