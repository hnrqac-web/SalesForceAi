const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

function readEnvFile() {
  try {
    return fs.readFileSync('.env', 'utf8')
  } catch {
    return ''
  }
}

function pickEnv(key, envFile) {
  return process.env[key] || ((envFile.match(new RegExp(`^${key}=(.*)$`, 'm')) || [])[1] || '').trim()
}

function normalizeSpeakerLabel(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/\*/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function rewriteTranscript(transcript, vendedorName, clienteName) {
  const normalizedVendedor = normalizeSpeakerLabel(vendedorName)
  const normalizedCliente = normalizeSpeakerLabel(clienteName)

  return String(transcript || '')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const trimmedLine = line.trim()
      const labelMatch = trimmedLine.match(/^([^:]+):\s*(.*)$/)

      if (!labelMatch) {
        return trimmedLine
      }

      const [, rawLabel, rawMessage] = labelMatch
      const normalizedLabel = normalizeSpeakerLabel(rawLabel)
      const msg = rawMessage.trim()

      if (normalizedLabel === 'vendedor' || normalizedLabel === normalizedVendedor) {
        return `Vendedor: ${msg}`
      }

      if (normalizedLabel === 'cliente' || normalizedLabel === normalizedCliente) {
        return `Cliente: ${msg}`
      }

      return `Cliente: ${msg}`
    })
    .join('\n')
}

async function columnExists(supabase, column) {
  const { error } = await supabase.from('auditorias').select(`id,${column}`).limit(1)
  return !error
}

async function main() {
  const envFile = readEnvFile()
  const url = pickEnv('NEXT_PUBLIC_SUPABASE_URL', envFile)
  const key = pickEnv('SUPABASE_SERVICE_ROLE_KEY', envFile) || pickEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', envFile)

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios')
  }

  const supabase = createClient(url, key)
  const hasTranscriptCompleto = await columnExists(supabase, 'transcript_completo')

  const selectColumns = ['id', 'cliente_name', 'vendedor_name', 'transcript']
  if (hasTranscriptCompleto) selectColumns.push('transcript_completo')

  const { data: rows, error } = await supabase
    .from('auditorias')
    .select(selectColumns.join(','))
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) throw error

  let updated = 0

  for (const row of rows || []) {
    const nextTranscript = rewriteTranscript(row.transcript, row.vendedor_name, row.cliente_name)
    const nextTranscriptCompleto = hasTranscriptCompleto
      ? rewriteTranscript(row.transcript_completo || '', row.vendedor_name, row.cliente_name)
      : null

    const changedTranscript = nextTranscript !== String(row.transcript || '')
    const changedTranscriptCompleto = hasTranscriptCompleto && nextTranscriptCompleto !== String(row.transcript_completo || '')

    if (!changedTranscript && !changedTranscriptCompleto) continue

    const payload = { transcript: nextTranscript }
    if (hasTranscriptCompleto) payload.transcript_completo = nextTranscriptCompleto

    const { error: updateError } = await supabase
      .from('auditorias')
      .update(payload)
      .eq('id', row.id)

    if (updateError) throw updateError
    updated++
  }

  console.log(JSON.stringify({ total: (rows || []).length, updated, hasTranscriptCompleto }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
