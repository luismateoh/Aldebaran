import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Verificar token de admin
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, eventData } = body

    if (!eventId || !eventData) {
      return NextResponse.json({ error: 'ID de evento y datos requeridos' }, { status: 400 })
    }

    // Usar la URL correcta para desarrollo local
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${process.env.PORT || 3000}`

    // Actualizar evento en el sistema híbrido (Blob Storage)
    const response = await fetch(`${baseUrl}/api/hybrid-storage`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'update_event',
        eventId,
        eventData
      })
    })

    if (!response.ok) {
      throw new Error(`Error updating event: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true,
      message: 'Evento actualizado exitosamente',
      event: data.event,
      source: 'blob_storage'
    })

  } catch (error) {
    console.error('Error in events/update:', error)
    return NextResponse.json({ 
      error: 'Error actualizando evento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}