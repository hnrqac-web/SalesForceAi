import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API Robusto para Evolution API
 */

export async function POST(request: NextRequest) {
  try {
    const { endpoint, method, body } = await request.json();
    
    // Pegamos as variáveis dentro do handler para garantir que pegam o valor atualizado
    const rawUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!rawUrl || !apiKey) {
      return NextResponse.json({ error: 'Configurações da Evolution API (URL ou API_KEY) ausentes na Vercel.' }, { status: 500 });
    }

    // Normaliza a URL para evitar barras duplas
    const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;

    console.log(`[Evolution Proxy] Chamando: ${method} ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Evolution Proxy] Erro da API Externa:', data);
      return NextResponse.json({ 
        error: 'Erro na Evolution API', 
        details: data,
        status: response.status 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Evolution Proxy] Erro Fatal:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Implementar GET e DELETE seguindo a mesma lógica de normalização
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const rawUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!endpoint) return NextResponse.json({ error: 'Endpoint ausente' }, { status: 400 });
  if (!rawUrl || !apiKey) return NextResponse.json({ error: 'Configurações ausentes' }, { status: 500 });

  const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const rawUrl = process.env.NEXT_PUBLIC_EVOLUTION_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!endpoint) return NextResponse.json({ error: 'Endpoint ausente' }, { status: 400 });
  if (!rawUrl || !apiKey) return NextResponse.json({ error: 'Configurações ausentes' }, { status: 500 });

  const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    });
    return NextResponse.json({ success: response.ok }, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
