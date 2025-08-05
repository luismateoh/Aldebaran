import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Verificar token de admin
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, status } = body

    if (!eventId || !status) {
      return NextResponse.json({ error: 'ID de evento y estado requeridos' }, { status: 400 })
    }

    // Validar estados permitidos
    const allowedStatuses = ['draft', 'published', 'cancelled']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
    }

    // Usar la URL correcta para desarrollo local
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${process.env.PORT || 3000}`

    // Actualizar estado del evento en el sistema híbrido (Blob Storage)
    const response = await fetch(`${baseUrl}/api/hybrid-storage`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'update_event_status',
        eventId,
        status
      })
    })

    if (!response.ok) {
      throw new Error(`Error updating event status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true,
      message: `Estado del evento actualizado a: ${status}`,
      event: data.event,
      source: 'blob_storage'
    })

  } catch (error) {
    console.error('Error in events/status:', error)
    return NextResponse.json({ 
      error: 'Error actualizando estado del evento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}