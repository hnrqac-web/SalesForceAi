import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const N8N_WEBHOOK_URL = 'https://salesforceai.app.n8n.cloud/webhook/ia-trigger' 

// Mapeamento manual de instâncias para nomes (Sempre funciona)
const INSTANCE_MAP: Record<string, string> = {
  'Admin-965': 'Henrique Alves',
  'admin-965': 'Henrique Alves'
};

serve(async (req) => {
  try {
    const body = await req.json()
    const eventName = (body.event || '').toLowerCase()
    
    if (eventName !== 'messages.upsert' && eventName !== 'messages_upsert') {
      return new Response(JSON.stringify({ status: 'ignored' }), { status: 200 })
    }

    const message = body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text || ''
    if (!message) return new Response(JSON.stringify({ status: 'no_message' }), { status: 200 })

    const fromMe = body.data?.key?.fromMe || false
    const remoteJid = body.data?.key?.remoteJid || '';
    const clienteId = remoteJid.split('@')[0] || 'Desconhecido';
    
    // Identifica o vendedor usando o mapeamento ou o pushName se disponível
    const instanciaKey = body.instance || body.instanceName || '';
    const vendedorNome = INSTANCE_MAP[instanciaKey] || (fromMe ? (body.data?.pushName || instanciaKey) : instanciaKey);

    // O nome do cliente é o pushName ou o número (ID)
    const clienteNome = fromMe ? clienteId : (body.data?.pushName || clienteId);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: rpcData, error: rpcError } = await supabase.rpc('add_message_to_auditoria', {
      p_cliente_name: clienteNome,
      p_vendedor_name: vendedorNome,
      p_message: message,
      p_from_me: fromMe
    })

    if (rpcError) throw rpcError

    const lastTrigger = new Date(rpcData.last_ai_trigger).getTime()
    const now = new Date().getTime()
    const diffSeconds = (now - lastTrigger) / 1000

    // Análise em Tempo Real (5 segundos)
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
      }).catch(err => console.error('Erro n8n:', err))
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
