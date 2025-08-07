import { NextRequest, NextResponse } from 'next/server'
import { eventsService } from '@/lib/events-firebase'

export async function PATCH(request: NextRequest) {
  try {
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

    console.log(`📡 API /api/events/status - Actualizando evento ${eventId} a estado ${status}`)

    // Actualizar estado del evento directamente en Firebase
    const updatedEvent = await eventsService.updateEvent(eventId, { status })
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    console.log(`✅ API /api/events/status - Estado actualizado: ${updatedEvent.title}`)
    
    return NextResponse.json({ 
      success: true,
      message: `Estado del evento actualizado a: ${status}`,
      event: updatedEvent,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in events/status:', error)
    return NextResponse.json({ 
      error: 'Error actualizando estado del evento en Firebase',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}