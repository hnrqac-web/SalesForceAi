import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type SchemaSupport = {
  hasClienteJid: boolean
  hasTranscriptCompleto: boolean
  hasStatus: boolean
}

type SellerIdentity = {
  primaryName: string
  aliases: string[]
}

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

function normalizeInstancesResponse(data: any) {
  if (Array.isArray(data)) return data
  return data?.instances || data?.data || data?.response || []
}

function normalizeCollection(data: any) {
  if (Array.isArray(data)) return data
  return data?.messages || data?.data || data?.response || data?.response?.data || []
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => !!value))]
}

function normalizeDigits(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits || null
}

function normalizeClientJid(value: string | null | undefined) {
  if (!value) return null
  const raw = value.trim()
  return raw.split('@')[0].replace(/\D/g, '') || null
}

function normalizeClientName(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
  return normalized || null
}

function buildSellerIdentity(inst: any): SellerIdentity {
  const name = inst.instanceName || inst.name || inst.instance?.instanceName || inst.instance?.name
  const owner = inst.owner || inst.instance?.owner || inst.data?.owner || inst.connection?.owner || inst.instance?.data?.owner
  const sellerNumber = typeof owner === 'string' ? normalizeDigits(owner) : null
  return {
    primaryName: sellerNumber || name,
    aliases: uniqueStrings([sellerNumber, name]),
  }
}

function extractMessageText(message: any) {
  return (
    message?.message?.conversation ||
    message?.message?.extendedTextMessage?.text ||
    message?.message?.imageMessage?.caption ||
    message?.message?.videoMessage?.caption ||
    message?.message?.documentMessage?.caption ||
    message?.message?.audioMessage?.caption ||
    message?.content ||
    message?.text ||
    (message?.message?.audioMessage ? '(Áudio)' : '') ||
    (message?.message?.locationMessage ? 'Localização enviada' : '') ||
    (message?.message?.contactMessage ? 'Contato compartilhado' : '')
  )
}

async function fetchEvolution(baseUrl: string, apiKey: string, endpoint: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      ...(init?.headers || {}),
    },
  })

  const data = await parseResponse(response)
  return { response, data }
}

async function columnExists(supabase: any, column: string) {
  const { error } = await supabase.from('auditorias').select(`id,${column}`).limit(1)
  return !error
}

async function detectSchemaSupport(supabase: any): Promise<SchemaSupport> {
  const [hasClienteJid, hasTranscriptCompleto, hasStatus] = await Promise.all([
    columnExists(supabase, 'cliente_jid'),
    columnExists(supabase, 'transcript_completo'),
    columnExists(supabase, 'status'),
  ])

  return { hasClienteJid, hasTranscriptCompleto, hasStatus }
}

async function fetchMessagesForChat(baseUrl: string, apiKey: string, instanceName: string, remoteJid: string) {
  const candidates = [remoteJid, remoteJid.split('@')[0]].filter(Boolean)

  for (const candidate of candidates) {
    for (const nested of [true, false]) {
      const body = nested
        ? { where: { key: { remoteJid: candidate } } }
        : { where: { remoteJid: candidate } }

      const { response, data } = await fetchEvolution(baseUrl, apiKey, `/chat/findMessages/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      if (!response.ok) continue

      const messages = normalizeCollection(data)
      if (Array.isArray(messages) && messages.length > 0) {
        return messages
      }
    }
  }

  return []
}

function formatTranscript(messages: any[]) {
  return [...messages]
    .reverse()
    .map((message) => {
      const text = extractMessageText(message)
      if (!text) return null

      const fromMe = message?.key?.fromMe || message?.fromMe
      return `${fromMe ? 'Vendedor' : 'Cliente'}: ${text}`
    })
    .filter(Boolean)
    .join('\n')
}

async function upsertAuditoria(
  supabase: any,
  schemaSupport: SchemaSupport,
  vendedorIdentity: SellerIdentity,
  clienteName: string,
  clienteJid: string,
  transcript: string
) {
  const selectColumns = ['id', 'cliente_name', 'transcript', 'vendedor_name']
  if (schemaSupport.hasClienteJid) selectColumns.push('cliente_jid')
  if (schemaSupport.hasStatus) selectColumns.push('status')

  let query = supabase
    .from('auditorias')
    .select(selectColumns.join(','))
    .order('created_at', { ascending: false })
    .limit(100)

  if (vendedorIdentity.aliases.length > 0) {
    query = query.in('vendedor_name', vendedorIdentity.aliases)
  } else {
    query = query.eq('vendedor_name', vendedorIdentity.primaryName)
  }

  const { data: existingRows, error: selectError } = await query

  if (selectError) throw selectError

  const cleanJid = normalizeClientJid(clienteJid) || clienteJid.split('@')[0]
  const normalizedClientName = normalizeClientName(clienteName)
  const existing = (existingRows || []).find((row: any) => {
    const rowClientJid = normalizeClientJid(row.cliente_jid)
    const jidMatches = !!cleanJid && !!rowClientJid && rowClientJid === cleanJid
    const rowClientName = normalizeClientName(row.cliente_name)
    const nameMatches = !!normalizedClientName && !!rowClientName && rowClientName === normalizedClientName
    const statusMatches = !schemaSupport.hasStatus || !row.status || String(row.status).toLowerCase() === 'aberto'
    const vendedorMatches = vendedorIdentity.aliases.length === 0 || vendedorIdentity.aliases.includes(row.vendedor_name)
    return vendedorMatches && statusMatches && (jidMatches || nameMatches)
  })

  const payload: Record<string, any> = {
    cliente_name: clienteName || cleanJid,
    vendedor_name: vendedorIdentity.primaryName,
    transcript,
    ai_score: 0,
    ai_summary: 'Conversa sincronizada do WhatsApp. Aguardando análise.',
    next_step_suggestion: 'Revise a conversa sincronizada para gerar a análise comercial.',
    lead_sentiment: 'Neutro',
  }

  if (schemaSupport.hasClienteJid) payload.cliente_jid = cleanJid
  if (schemaSupport.hasTranscriptCompleto) payload.transcript_completo = transcript
  if (schemaSupport.hasStatus && !existing) payload.status = 'aberto'

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('auditorias')
      .update(payload)
      .eq('id', existing.id)

    if (updateError) throw updateError
    return
  }

  const { error: insertError } = await supabase
    .from('auditorias')
    .insert(payload)

  if (insertError) throw insertError
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL
    const evolutionKey = process.env.EVOLUTION_API_KEY
    const authorization = req.headers.get('authorization')

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Configuração do Supabase incompleta. Defina NEXT_PUBLIC_SUPABASE_URL.' },
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

    const supabaseKey = supabaseServiceKey || supabaseAnonKey
    if (!supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase incompleta. Defina SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey && !authorization) {
      return NextResponse.json(
        { error: 'Sessão não encontrada para sincronizar sem service role.' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, supabaseServiceKey ? undefined : {
      global: {
        headers: {
          Authorization: authorization || '',
        },
      },
    })

    const schemaSupport = await detectSchemaSupport(supabase)

    // 1. Busca instâncias
    console.log('[Sync] Buscando instâncias...')
    const { response: instResponse, data: instData } = await fetchEvolution(baseEvolutionUrl, evolutionKey, '/instance/fetchInstances')
    if (!instResponse.ok) {
      console.error('[Sync] Falha ao buscar instâncias:', instData)
      return NextResponse.json(
        { error: 'Falha ao buscar instâncias na Evolution API', details: instData },
        { status: instResponse.status }
      )
    }

    const instances = normalizeInstancesResponse(instData)
    
    console.log(`[Sync] Encontradas ${instances.length} instâncias.`)

    let totalImported = 0
    let totalSkipped = 0

    // Processa todas as instâncias encontradas
    for (const inst of instances) {
      const name = inst.instanceName || inst.name || inst.instance?.instanceName || inst.instance?.name
      const status = inst.status || inst.connectionStatus || inst.instance?.status
      const vendedorIdentity = buildSellerIdentity(inst)
      
      console.log(`[Sync] Processando instância: ${name}, Status: ${status}`)
      
      if (!name) continue;

      // 2. Tenta buscar CHATS
      console.log(`[Sync] Buscando chats para ${name}...`)
      const { response: chatsResponse, data: chatsData } = await fetchEvolution(baseEvolutionUrl, evolutionKey, `/chat/findChats/${name}`, {
        method: 'POST',
        body: JSON.stringify({})
      })

      if (!chatsResponse.ok) {
        console.error(`[Sync] Falha ao buscar chats para ${name}:`, chatsData)
        continue
      }

      let chats = normalizeCollection(chatsData)
      
      // 3. Fallback para CONTATOS se chats estiver vazio
      if (chats.length === 0) {
        console.log(`[Sync] Chats vazios para ${name}, tentando contatos...`)
        const { response: contactsResponse, data: contactsData } = await fetchEvolution(baseEvolutionUrl, evolutionKey, `/chat/findContacts/${name}`, {
          method: 'POST',
          body: JSON.stringify({})
        })

        if (!contactsResponse.ok) {
          console.error(`[Sync] Falha ao buscar contatos para ${name}:`, contactsData)
          continue
        }

        chats = normalizeCollection(contactsData)
      }

      console.log(`[Sync] Encontrados ${chats.length} registros para ${name}`)
      const recentToProcess = chats.slice(0, 20)

      // 4. Processa cada registro
      for (const chat of recentToProcess) {
        const jid = chat.id || chat.remoteJid || chat.jid
        if (!jid) {
          totalSkipped++
          continue
        }

        const clienteNome = chat.name || chat.pushName || jid.split('@')[0]
        
        try {
          const messages = await fetchMessagesForChat(baseEvolutionUrl, evolutionKey, name, jid)
          const transcript = formatTranscript(messages)

          if (!transcript) {
            totalSkipped++
            continue
          }

          await upsertAuditoria(
            supabase,
            schemaSupport,
            vendedorIdentity,
            clienteNome,
            jid,
            transcript
          )

          totalImported++
        } catch (e) {
          console.error(`[Sync] Erro ao processar JID ${jid}:`, e)
          totalSkipped++
        }
      }
    }

    return NextResponse.json({ success: true, imported: totalImported, skipped: totalSkipped })
  } catch (error: any) {
    console.error('[Sync API] Erro:', error)
    return NextResponse.json({ error: error.message || 'Erro interno na sincronização' }, { status: 500 })
  }
}
