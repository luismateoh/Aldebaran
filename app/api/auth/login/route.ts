import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Verificar contraseña con variable de entorno
    const adminPassword = process.env.ADMIN_PASSWORD || 'LuchoRex'
    
    console.log('🔐 Verificando contraseña en servidor...')
    
    if (password !== adminPassword) {
      console.log('❌ Contraseña incorrecta')
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    console.log('✅ Contraseña correcta, generando token...')
    
    // Usar la misma clave que el middleware
    const secretKey = adminPassword
    
    // Generar token JWT
    const token = jwt.sign(
      { admin: true, timestamp: Date.now() },
      secretKey,
      { expiresIn: '24h' }
    )
    
    console.log('🎯 Token generado exitosamente')
    
    return NextResponse.json({ 
      token,
      message: 'Login successful' 
    })
    
  } catch (error) {
    console.error('💥 Error en login:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}