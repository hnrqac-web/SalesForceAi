import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API para a Evolution API
 * Protege a EVOLUTION_API_KEY de ser exposta no navegador
 */

const EVOLUTION_URL = process.env.NEXT_PUBLIC_EVOLUTION_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { endpoint, method, body } = await request.json();

    if (!EVOLUTION_URL || !API_KEY) {
      return NextResponse.json({ error: 'Configurações da Evolution API ausentes no servidor' }, { status: 500 });
    }

    const response = await fetch(`${EVOLUTION_URL}${endpoint}`, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Erro no Proxy da Evolution API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint não fornecido' }, { status: 400 });
  }

  try {
    if (!EVOLUTION_URL || !API_KEY) {
      return NextResponse.json({ error: 'Configurações da Evolution API ausentes no servidor' }, { status: 500 });
    }

    const response = await fetch(`${EVOLUTION_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
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

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint não fornecido' }, { status: 400 });
  }

  try {
    if (!EVOLUTION_URL || !API_KEY) {
      return NextResponse.json({ error: 'Configurações da Evolution API ausentes no servidor' }, { status: 500 });
    }

    const response = await fetch(`${EVOLUTION_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
      },
    });

    return NextResponse.json({ success: response.ok }, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
