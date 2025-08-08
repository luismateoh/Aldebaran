import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function PUT(request: NextRequest) {
  try {
    console.log('📡 API /api/events/update - Verificando autenticación...')

    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)

    const body = await request.json()
    const { eventId, eventData } = body

    if (!eventId || !eventData) {
      return NextResponse.json({ error: 'ID de evento y datos requeridos' }, { status: 400 })
    }

    console.log(`📡 API /api/events/update - Actualizando evento ${eventId}`)

    // Actualizar evento directamente en Firebase usando Admin SDK
    const updatedEvent = await eventsServiceAdmin.updateEvent(eventId, eventData)
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    console.log(`✅ API /api/events/update - Evento actualizado: ${updatedEvent.title}`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Evento actualizado exitosamente',
      event: updatedEvent,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in events/update:', error)
    return NextResponse.json({ 
      error: 'Error actualizando evento en Firebase',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}