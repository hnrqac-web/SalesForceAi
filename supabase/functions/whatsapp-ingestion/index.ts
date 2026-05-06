import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const N8N_WEBHOOK_URL = 'https://salesforceai.app.n8n.cloud/webhook/ia-trigger' 

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function extractSellerName(body: any) {
  const instance = body?.instance
  // Tenta pegar o número do dono da instância (owner) se disponível no body da Evolution API
  // Caso contrário, usa o nome da instância
  const owner = body?.data?.instance?.owner || body?.instance?.owner
  const instanceName = typeof instance === 'string' ? instance : (instance?.name || instance?.instanceName)
  
  // Prioriza o número do dono (owner), removendo caracteres não numéricos
  if (owner) return owner.split('@')[0].replace(/\D/g, '')
  
  return instanceName || 'Vendedor não identificado'
}

serve(async (req) => {
  try {
    const body = await req.json()
    const eventName = (body.event || '').toLowerCase()
    const allowedEvents = ['messages.upsert', 'messages_upsert', 'send_message']
    
    if (!allowedEvents.includes(eventName)) {
      return new Response(JSON.stringify({ status: 'ignored', event: eventName }), { status: 200 })
    }

    const message = body.data?.message?.conversation || 
                    body.data?.message?.extendedTextMessage?.text || 
                    body.data?.message?.imageMessage?.caption ||
                    body.data?.message?.videoMessage?.caption ||
                    body.data?.message?.text || 
                    body.data?.text ||
                    body.data?.content ||
                    body.data?.message?.content ||
                    ''
    if (!message) return new Response(JSON.stringify({ status: 'no_message' }), { status: 200 })

    const fromMe = body.data?.key?.fromMe || body.data?.fromMe || false
    const remoteJid = body.data?.key?.remoteJid || body.data?.remoteJid || ''
    const clienteId = remoteJid.split('@')[0] || 'Desconhecido'
    const vendedorNome = extractSellerName(body)
    
    // Se for o vendedor iniciando, não teremos o pushName do cliente.
    // Usamos o ID (número) como nome temporário se não houver nome.
    const clienteNome = (fromMe ? '' : body.data?.pushName) || clienteId

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: rpcData, error: rpcError } = await supabase.rpc('add_message_to_auditoria', {
      p_cliente_jid: remoteJid,
      p_cliente_name: clienteNome,
      p_vendedor_name: vendedorNome,
      p_message: message,
      p_from_me: fromMe
    })

    if (rpcError) throw rpcError

    const lastTrigger = new Date(rpcData.last_ai_trigger).getTime()
    const now = new Date().getTime()
    const diffSeconds = (now - lastTrigger) / 1000

    if (diffSeconds > 5) {
      await supabase.rpc('mark_ai_triggered', { p_auditoria_id: rpcData.auditoria_id })
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditoria_id: rpcData.auditoria_id,
          cliente_name: clienteNome,
          vendedor_name: vendedorNome
        })
      }).catch(err => console.error(err))
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
