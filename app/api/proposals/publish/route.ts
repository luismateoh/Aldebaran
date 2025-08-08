import { NextRequest, NextResponse } from 'next/server'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 API /api/proposals/publish - Publicando propuesta como evento...')

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { proposalId } = await request.json()
    
    if (!proposalId) {
      return NextResponse.json({ error: 'ID de propuesta requerido' }, { status: 400 })
    }

    // Obtener la propuesta
    const proposal = await proposalsServiceAdmin.getProposalById(proposalId)
    
    if (!proposal) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    }

    if (proposal.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Solo se pueden publicar propuestas aprobadas' 
      }, { status: 400 })
    }

    // Convertir propuesta a formato de evento
    const eventData = {
      title: proposal.title,
      eventDate: proposal.eventDate,
      municipality: proposal.municipality,
      department: proposal.department,
      organizer: proposal.organizer,
      website: proposal.website || '',
      description: proposal.description,
      distances: proposal.distances,
      registrationFee: proposal.registrationFee || '',
      category: proposal.category,
      status: 'published' as const,
      author: authResult.user?.email || 'Admin',
      altitude: '1000m', // Valor por defecto
      cover: '',
      tags: [proposal.category.toLowerCase(), proposal.municipality.toLowerCase(), 'atletismo'],
      snippet: proposal.description.substring(0, 150)
    }

    // Crear el evento
    const newEvent = await eventsServiceAdmin.createEvent(eventData)

    console.log(`✅ Evento creado desde propuesta: ${newEvent.id}`)

    return NextResponse.json({ 
      success: true,
      event: newEvent,
      message: `Propuesta "${proposal.title}" publicada como evento exitosamente`
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error publishing proposal as event:', error)
    return NextResponse.json({ 
      error: 'Error publicando propuesta como evento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}