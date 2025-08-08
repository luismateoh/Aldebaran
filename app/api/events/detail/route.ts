import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/events/detail - Verificando autenticación...')

    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)
    
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 })
    }

    console.log(`📡 API /api/events/detail - Obteniendo evento ${eventId} desde Firebase...`)

    // Obtener evento directamente desde Firebase usando Admin SDK
    const event = await eventsServiceAdmin.getEventById(eventId)
    
    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }
    
    console.log(`✅ API /api/events/detail - Evento encontrado: ${event.title}`)
    
    return NextResponse.json({ 
      event: event,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in events/detail:', error)
    
    if (error instanceof Error && error.message.includes('no encontrado')) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      error: 'Error cargando evento desde Firebase',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}