import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Verificar token de admin (simplificado para desarrollo)
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    // Usar la URL correcta para desarrollo local
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${process.env.PORT || 3000}`

    // Cargar eventos desde el sistema híbrido (Blob Storage)
    const response = await fetch(`${baseUrl}/api/hybrid-storage?action=list_events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      throw new Error(`Error loading events: ${response.status}`)
    }

    const data = await response.json()
    const events = data.events || []

    return NextResponse.json({ 
      events: events,
      total: events.length,
      source: 'blob_storage'
    })

  } catch (error) {
    console.error('Error in events/list:', error)
    return NextResponse.json({ 
      error: 'Error cargando eventos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}