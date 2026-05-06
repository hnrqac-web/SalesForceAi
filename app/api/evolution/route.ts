import { NextRequest, NextResponse } from 'next/server'

function getEvolutionConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!rawUrl || !apiKey) {
    return {
      error: NextResponse.json(
        { error: 'Configurações da Evolution API ausentes. Defina NEXT_PUBLIC_EVOLUTION_URL e EVOLUTION_API_KEY.' },
        { status: 500 }
      ),
    }
  }

  return {
    apiKey,
    baseUrl: rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl,
  }
}

function normalizeEndpoint(endpoint?: string | null) {
  if (!endpoint?.trim()) return null
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
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

async function proxyRequest(url: string, init: RequestInit) {
  const response = await fetch(url, init)
  const data = await parseResponse(response)

  if (!response.ok) {
    console.error('[Evolution Proxy] Erro da API externa:', data)
    return NextResponse.json(
      {
        error: 'Erro na Evolution API',
        details: data,
        status: response.status,
      },
      { status: response.status }
    )
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const { endpoint, method, body } = await request.json()
    const config = getEvolutionConfig()
    if ('error' in config) return config.error

    const cleanEndpoint = normalizeEndpoint(endpoint)
    if (!cleanEndpoint) {
      return NextResponse.json({ error: 'Endpoint ausente' }, { status: 400 })
    }

    const fullUrl = `${config.baseUrl}${cleanEndpoint}`
    console.log(`[Evolution Proxy] Chamando: ${method || 'POST'} ${fullUrl}`)

    return proxyRequest(fullUrl, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error: any) {
    console.error('[Evolution Proxy] Erro fatal:', error)
    return NextResponse.json({ error: error.message || 'Erro interno no proxy da Evolution API' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const config = getEvolutionConfig()
  if ('error' in config) return config.error

  const cleanEndpoint = normalizeEndpoint(searchParams.get('endpoint'))
  if (!cleanEndpoint) {
    return NextResponse.json({ error: 'Endpoint ausente' }, { status: 400 })
  }

  const url = new URL(`${config.baseUrl}${cleanEndpoint}`)
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      url.searchParams.set(key, value)
    }
  })

  try {
    return proxyRequest(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno no proxy da Evolution API' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const config = getEvolutionConfig()
  if ('error' in config) return config.error

  const cleanEndpoint = normalizeEndpoint(searchParams.get('endpoint'))
  if (!cleanEndpoint) {
    return NextResponse.json({ error: 'Endpoint ausente' }, { status: 400 })
  }

  try {
    return proxyRequest(`${config.baseUrl}${cleanEndpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno no proxy da Evolution API' }, { status: 500 })
  }
}
