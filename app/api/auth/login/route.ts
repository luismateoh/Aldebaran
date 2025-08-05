import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Verificar contraseña con variable de entorno
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
    }
    
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    // Generar token JWT (usando una clave secreta simple)
    const token = jwt.sign(
      { admin: true, timestamp: Date.now() },
      process.env.ADMIN_PASSWORD || 'fallback-secret',
      { expiresIn: '24h' }
    )
    
    return NextResponse.json({ 
      token,
      message: 'Login successful' 
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}