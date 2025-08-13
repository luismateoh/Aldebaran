import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/stats - Verificando autenticación...')

    // Verify admin authentication
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)
    console.log('📡 API /api/stats - Obteniendo estadísticas del sistema...')

    // Get events stats
    const eventsStats = await eventsServiceAdmin.getEventsStats()
    
    // Get proposals count
    let proposalsCount = 0
    try {
      const proposals = await proposalsServiceAdmin.getAllProposals()
      proposalsCount = proposals.length
    } catch (proposalsError) {
      console.log('❌ Error obteniendo propuestas para stats:', proposalsError)
      // No fallar por esto, simplemente usar 0
    }

    const stats = {
      // Events stats from Firebase
      totalEvents: eventsStats.totalEvents,
      publishedEvents: eventsStats.publishedEvents,
      draftEvents: eventsStats.draftEvents,
      cancelledEvents: eventsStats.cancelledEvents,
      deletedEvents: 0, // Firebase no usa soft delete por ahora
      
      // Proposals count
      proposals: proposalsCount,
      
      // Meta info
      status: 'connected',
      lastUpdated: new Date().toISOString(),
      source: 'firebase'
    }

    console.log('✅ API /api/stats - Estadísticas obtenidas:', stats)

    return NextResponse.json({ 
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error in stats API:', error)
    return NextResponse.json({ 
      error: 'Error obteniendo estadísticas del sistema',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}