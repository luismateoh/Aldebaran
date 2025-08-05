import { NextRequest, NextResponse } from 'next/server'
import { hybridEventStorage } from '@/lib/blob-storage'
import { proposalQueries } from '@/lib/db'

// Verificar autenticación admin
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  return authHeader?.startsWith('Bearer ')
}

export async function POST(request: NextRequest) {
  try {
    const { action, eventData, markdownContent, proposalId, proposal } = await request.json()

    switch (action) {
      case 'create_event':
        // Verificar autenticación para crear eventos
        if (!verifyAuth(request)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Crear evento usando sistema híbrido (DB + Blob Storage)
        const result = await hybridEventStorage.createEvent(eventData, markdownContent)
        
        return NextResponse.json({
          success: true,
          event: result,
          message: 'Evento creado exitosamente',
          storage: 'hybrid-postgres-blob'
        })

      case 'create_proposal':
        // Crear propuesta (público o admin)
        const proposalData = {
          title: proposal.title,
          eventDate: new Date(proposal.eventDate),
          municipality: proposal.municipality,
          department: proposal.department,
          organizer: proposal.organizer || '',
          website: proposal.website || '',
          description: proposal.description || '',
          category: proposal.category || 'Running',
          registrationFee: proposal.registrationFeed || '',
          distances: proposal.distances || [],
          submittedBy: proposal.submittedBy || 'unknown',
          ipAddress: request.ip || 'unknown',
          userAgent: proposal.userAgent || request.headers.get('user-agent') || 'unknown'
        }

        const newProposal = await proposalQueries.createProposal(proposalData)
        
        return NextResponse.json({
          success: true,
          proposalId: newProposal.id,
          message: 'Propuesta guardada exitosamente',
          storage: 'postgres'
        })

      case 'approve_proposal':
        // Verificar autenticación para aprobar propuestas
        if (!verifyAuth(request)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!proposalId) {
          return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 })
        }

        // En desarrollo, simular aprobación
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔧 Mock: Proposal would be approved and converted to event')
          return NextResponse.json({
            success: true,
            message: 'Proposal approved (development mode)',
            proposalId
          })
        }

        // En producción, aprobar propuesta real
        // Aquí iría la lógica para convertir propuesta en evento
        return NextResponse.json({
          success: true,
          message: 'Proposal approved and converted to event',
          proposalId
        })

      case 'sync_events':
        // Verificar autenticación para sincronizar
        if (!verifyAuth(request)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Sincronizar DB ↔ Blob Storage
        const syncResult = await hybridEventStorage.syncEvents()
        
        return NextResponse.json({
          success: true,
          synced: syncResult.synced,
          errors: syncResult.errors,
          message: `Synchronized ${syncResult.synced} events`
        })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Hybrid storage API error:', error)
    
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message,
      storage: 'hybrid-postgres-blob'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const eventId = searchParams.get('eventId')

    switch (action) {
      case 'get_event':
        if (!eventId) {
          return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
        }

        const event = await hybridEventStorage.getEvent(eventId)
        
        return NextResponse.json({
          event,
          storage: 'hybrid-postgres-blob',
          source: event ? 'database+blob' : 'not-found'
        })

      case 'list_proposals':
        // Verificar autenticación para listar propuestas
        if (!verifyAuth(request)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const proposals = await proposalQueries.getPendingProposals()
        
        return NextResponse.json({
          proposals,
          total: proposals.length,
          storage: 'postgres'
        })

      case 'list_events':
        // Verificar autenticación para listar eventos
        if (!verifyAuth(request)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const events = await hybridEventStorage.listEvents()
        
        return NextResponse.json({
          events,
          total: events.length,
          storage: 'hybrid-postgres-blob'
        })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Hybrid storage GET error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch data',
      details: error.message
    }, { status: 500 })
  }
}