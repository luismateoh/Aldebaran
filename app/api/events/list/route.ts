import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/events/list - Verificando autenticación...')

    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)
    console.log('📡 API /api/events/list - Obteniendo eventos desde Firebase...')

    // Cargar eventos directamente desde Firebase usando Admin SDK
    const events = await eventsServiceAdmin.getAllEvents()

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