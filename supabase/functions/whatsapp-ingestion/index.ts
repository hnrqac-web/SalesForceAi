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
  const instanceName = typeof instance === 'string' ? instance : (instance?.name || instance?.instanceName)
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
                    ''
    if (!message) return new Response(JSON.stringify({ status: 'no_message' }), { status: 200 })

    const fromMe = body.data?.key?.fromMe || false
    const remoteJid = body.data?.key?.remoteJid || ''
    const clienteId = remoteJid.split('@')[0] || 'Desconhecido'
    const vendedorNome = extractSellerName(body)
    // Se for do vendedor, não usamos o pushName (que seria o nome do próprio vendedor) como nome do cliente
    const clienteNome = fromMe ? clienteId : (body.data?.pushName || clienteId)

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
