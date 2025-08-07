import { NextRequest, NextResponse } from 'next/server'
import { eventsService } from '@/lib/events-firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 })
    }

    console.log(`📡 API /api/events/detail - Obteniendo evento ${eventId} desde Firebase...`)

    // Obtener evento directamente desde Firebase
    const event = await eventsService.getEventById(eventId)
    
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