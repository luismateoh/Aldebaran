import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  // Solo proteger rutas /admin en producción
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // En desarrollo, permitir acceso para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Middleware: Permitiendo acceso en desarrollo')
      return NextResponse.next()
    }
    
    // En producción, verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      jwt.verify(token, process.env.ADMIN_PASSWORD || 'fallback-secret')
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}