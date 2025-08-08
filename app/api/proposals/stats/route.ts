import { NextRequest, NextResponse } from 'next/server'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/proposals/stats - Obteniendo estadísticas...')

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await proposalsServiceAdmin.getProposalStats()
    
    return NextResponse.json({ 
      stats,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error getting proposal stats:', error)
    return NextResponse.json({ 
      error: 'Error obteniendo estadísticas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}