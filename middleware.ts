import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteger rutas /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    console.log('🛡️ Middleware: Verificando acceso a ruta admin...')
    
    // Verificar si hay token (sin validar JWT aquí)
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('admin_token')?.value

    if (!token) {
      console.log('❌ Middleware: No se encontró token, redirigiendo a login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('✅ Middleware: Token encontrado, permitiendo acceso (validación en client-side)')
    
    // Permitir acceso - la validación real del JWT se hace en el client-side
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}