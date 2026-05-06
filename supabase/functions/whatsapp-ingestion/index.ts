import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const N8N_WEBHOOK_URL = 'https://salesforceai.app.n8n.cloud/webhook/ia-trigger' 

type SchemaSupport = {
  hasClienteJid: boolean
  hasTranscriptCompleto: boolean
  hasStatus: boolean
  hasLastAiTrigger: boolean
}

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function pickFirstBoolean(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'boolean') return value
  }
  return null
}

function extractMessageText(body: any) {
  const data = body?.data || {}
  const messageObj = data?.message || body?.message || {}

  return (
    messageObj?.conversation ||
    messageObj?.extendedTextMessage?.text ||
    messageObj?.imageMessage?.caption ||
    messageObj?.videoMessage?.caption ||
    messageObj?.audioMessage?.caption ||
    messageObj?.documentMessage?.caption ||
    messageObj?.text ||
    data?.text ||
    data?.content ||
    data?.body ||
    body?.content ||
    body?.text ||
    (messageObj?.pollCreationMessage ? `Enquete: ${messageObj.pollCreationMessage.name}` : '') ||
    (messageObj?.locationMessage ? 'Localização enviada' : '') ||
    (messageObj?.contactMessage ? 'Contato compartilhado' : '') ||
    (messageObj?.audioMessage ? 'Mensagem de voz' : '')
  )
}

function extractRemoteJid(body: any) {
  return pickFirstString(
    body?.data?.key?.remoteJid,
    body?.data?.remoteJid,
    body?.data?.jid,
    body?.key?.remoteJid,
    body?.remoteJid,
    body?.jid
  ) || ''
}

function extractFromMe(body: any, eventName: string) {
  return pickFirstBoolean(
    body?.data?.key?.fromMe,
    body?.data?.fromMe,
    body?.key?.fromMe,
    body?.fromMe
  ) ?? eventName.includes('send')
}

function buildTranscriptLine(message: string, fromMe: boolean) {
  return `${fromMe ? 'Vendedor' : 'Cliente'}: ${message}`
}

async function columnExists(supabase: any, column: string) {
  const { error } = await supabase.from('auditorias').select(`id,${column}`).limit(1)
  return !error
}

async function detectSchemaSupport(supabase: any): Promise<SchemaSupport> {
  const [hasClienteJid, hasTranscriptCompleto, hasStatus, hasLastAiTrigger] = await Promise.all([
    columnExists(supabase, 'cliente_jid'),
    columnExists(supabase, 'transcript_completo'),
    columnExists(supabase, 'status'),
    columnExists(supabase, 'last_ai_trigger'),
  ])

  return { hasClienteJid, hasTranscriptCompleto, hasStatus, hasLastAiTrigger }
}

async function upsertAuditoria(
  supabase: any,
  schemaSupport: SchemaSupport,
  vendedorName: string,
  clienteName: string,
  clienteJid: string,
  transcriptLine: string
) {
  const selectColumns = ['id', 'cliente_name', 'transcript']
  if (schemaSupport.hasClienteJid) selectColumns.push('cliente_jid')
  if (schemaSupport.hasStatus) selectColumns.push('status')
  if (schemaSupport.hasTranscriptCompleto) selectColumns.push('transcript_completo')
  if (schemaSupport.hasLastAiTrigger) selectColumns.push('last_ai_trigger')

  const { data: existingRows, error: selectError } = await supabase
    .from('auditorias')
    .select(selectColumns.join(','))
    .eq('vendedor_name', vendedorName)
    .order('created_at', { ascending: false })
    .limit(50)

  if (selectError) throw selectError

  const cleanJid = clienteJid.split('@')[0]
  const existing = (existingRows || []).find((row: any) => {
    const jidMatches = schemaSupport.hasClienteJid && row.cliente_jid && [row.cliente_jid, `${row.cliente_jid}@s.whatsapp.net`].includes(clienteJid)
    const nameMatches = row.cliente_name === clienteName
    const statusMatches = !schemaSupport.hasStatus || !row.status || row.status === 'aberto'
    return statusMatches && (jidMatches || nameMatches)
  })

  const currentTranscript = existing?.transcript || ''
  const nextTranscript = currentTranscript ? `${currentTranscript}\n${transcriptLine}` : transcriptLine

  const payload: Record<string, unknown> = {
    cliente_name: clienteName || cleanJid,
    vendedor_name: vendedorName,
    transcript: nextTranscript,
    ai_score: 0,
    ai_summary: 'Conversa capturada do WhatsApp. Aguardando análise.',
    next_step_suggestion: 'Revise a conversa recebida para gerar a análise comercial.',
    lead_sentiment: 'Neutro',
  }

  if (schemaSupport.hasClienteJid) payload.cliente_jid = cleanJid
  if (schemaSupport.hasTranscriptCompleto) {
    const currentTranscriptCompleto = existing?.transcript_completo || ''
    payload.transcript_completo = currentTranscriptCompleto ? `${currentTranscriptCompleto}\n${transcriptLine}` : transcriptLine
  }
  if (schemaSupport.hasStatus && !existing) payload.status = 'aberto'

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('auditorias')
      .update(payload)
      .eq('id', existing.id)

    if (updateError) throw updateError
    return {
      auditoriaId: existing.id,
      lastAiTrigger: existing.last_ai_trigger || null,
    }
  }

  const { data: insertedRows, error: insertError } = await supabase
    .from('auditorias')
    .insert(payload)
    .select(schemaSupport.hasLastAiTrigger ? 'id,last_ai_trigger' : 'id')
    .limit(1)

  if (insertError) throw insertError

  return {
    auditoriaId: insertedRows?.[0]?.id,
    lastAiTrigger: insertedRows?.[0]?.last_ai_trigger || null,
  }
}

async function maybeTriggerAi(supabase: any, schemaSupport: SchemaSupport, auditoriaId: string | null, clienteNome: string, vendedorNome: string, lastAiTrigger: string | null) {
  if (!auditoriaId) return

  if (schemaSupport.hasLastAiTrigger && lastAiTrigger) {
    const diffSeconds = (Date.now() - new Date(lastAiTrigger).getTime()) / 1000
    if (Number.isFinite(diffSeconds) && diffSeconds <= 5) {
      return
    }
  }

  if (schemaSupport.hasLastAiTrigger) {
    const { error } = await supabase
      .from('auditorias')
      .update({ last_ai_trigger: new Date().toISOString() })
      .eq('id', auditoriaId)

    if (error) {
      console.error('[Webhook] Falha ao marcar trigger da IA:', error)
    }
  }

  fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auditoria_id: auditoriaId,
      cliente_name: clienteNome,
      vendedor_name: vendedorNome,
    }),
  }).catch((err) => console.error(err))
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
    const allowedEvents = ['messages.upsert', 'messages_upsert', 'send_message', 'send.message']
    
    if (!allowedEvents.includes(eventName)) {
      return new Response(JSON.stringify({ status: 'ignored', event: eventName }), { status: 200 })
    }

    const data = body.data || {}
    const message = extractMessageText(body)

    if (!message && eventName !== 'send_message') {
      console.log('[Webhook] Mensagem vazia ignorada')
      return new Response(JSON.stringify({ status: 'no_message' }), { status: 200 })
    }

    const fromMe = extractFromMe(body, eventName)
    const remoteJid = extractRemoteJid(body)

    console.log(`[Webhook] Evento: ${eventName}, de: ${remoteJid}, fromMe: ${fromMe}`)
    
    if (!remoteJid) {
       console.log('[Webhook] JID ausente ignorado')
       return new Response(JSON.stringify({ status: 'no_jid' }), { status: 200 })
    }

    const clienteId = remoteJid.split('@')[0] || 'Desconhecido'
    const vendedorNome = extractSellerName(body)
    
    // Se for o vendedor iniciando, não teremos o pushName do cliente no webhook
    const clienteNome = pickFirstString(data?.pushName, data?.pushname, body?.pushName, body?.pushname) || clienteId
    const transcriptLine = buildTranscriptLine(message || (fromMe ? 'Mensagem enviada pelo vendedor' : 'Mensagem recebida'), fromMe)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const schemaSupport = await detectSchemaSupport(supabase)
    const { auditoriaId, lastAiTrigger } = await upsertAuditoria(
      supabase,
      schemaSupport,
      vendedorNome,
      clienteNome,
      remoteJid,
      transcriptLine
    )

    await maybeTriggerAi(supabase, schemaSupport, auditoriaId, clienteNome, vendedorNome, lastAiTrigger)

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
