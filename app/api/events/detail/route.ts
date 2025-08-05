import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')
    
    // Verificar token de admin
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    if (!eventId) {
      return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 })
    }

    // Usar la URL correcta para desarrollo local
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${process.env.PORT || 3000}`

    // Obtener evento desde el sistema híbrido (Blob Storage)
    const response = await fetch(`${baseUrl}/api/hybrid-storage?action=get_event&eventId=${eventId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
      }
      throw new Error(`Error loading event: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      event: data.event,
      source: 'blob_storage'
    })

  } catch (error) {
    console.error('Error in events/detail:', error)
    return NextResponse.json({ 
      error: 'Error cargando evento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}