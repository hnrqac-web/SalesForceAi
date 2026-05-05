import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se o usuário não estiver logado e tentar acessar uma rota protegida (dentro do grupo (app))
  if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || 
                   req.nextUrl.pathname.startsWith('/auditorias') ||
                   req.nextUrl.pathname.startsWith('/settings') ||
                   req.nextUrl.pathname.startsWith('/whatsapp-setup'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se o usuário estiver logado e tentar acessar o login
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
