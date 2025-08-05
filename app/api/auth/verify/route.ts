import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    const authHeader = request.headers.get('authorization')
    const tokenToVerify = token || authHeader?.replace('Bearer ', '')
    
    if (!tokenToVerify) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }
    
    console.log('🔍 API Verify: Verificando token...')
    
    // Usar la misma clave secreta que el login y middleware
    const secretKey = process.env.ADMIN_PASSWORD || 'LuchoRex'
    
    try {
      const decoded = jwt.verify(tokenToVerify, secretKey)
      console.log('✅ API Verify: Token válido')
      
      return NextResponse.json({ 
        valid: true,
        decoded,
        message: 'Token is valid' 
      })
    } catch (jwtError) {
      console.log('❌ API Verify: Token inválido:', jwtError.message)
      return NextResponse.json({ 
        valid: false,
        error: 'Invalid token' 
      }, { status: 401 })
    }
    
  } catch (error) {
    console.error('💥 API Verify: Error del servidor:', error)
    return NextResponse.json({ 
      error: 'Server error' 
    }, { status: 500 })
  }
}