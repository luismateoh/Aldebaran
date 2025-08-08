import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function PATCH(request: NextRequest) {
  try {
    console.log('📡 API /api/events/status - Verificando autenticación...')

    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)

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

    // Actualizar estado del evento directamente en Firebase usando Admin SDK
    const updatedEvent = await eventsServiceAdmin.updateEventStatus(eventId, status)
    
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