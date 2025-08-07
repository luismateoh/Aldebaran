import { NextRequest, NextResponse } from 'next/server'
import { eventsService } from '@/lib/events-firebase'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/events/list - Obteniendo eventos desde Firebase...')

    // Cargar eventos directamente desde Firebase
    const events = await eventsService.getAllEvents()

    console.log(`✅ API /api/events/list - ${events.length} eventos encontrados`)

    return NextResponse.json({ 
      events: events,
      total: events.length,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in events/list:', error)
    return NextResponse.json({ 
      error: 'Error cargando eventos desde Firebase',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}