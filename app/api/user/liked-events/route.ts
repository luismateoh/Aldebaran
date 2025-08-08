import { NextRequest } from 'next/server'
import { userInteractionsServiceServer } from '@/lib/user-interactions-firebase-server'
import { eventsServiceServer } from '@/lib/events-firebase-server'
import { requireAuth } from '@/lib/auth-server'

// Obtener eventos que le gustan al usuario
export const GET = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeEventData = searchParams.get('includeEventData') === 'true'

    const eventIds = await userInteractionsServiceServer.getUserLikedEvents(authResult.user.uid)
    
    if (!includeEventData) {
      return new Response(
        JSON.stringify({ eventIds }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener los datos completos de los eventos
    const events = []
    for (const eventId of eventIds) {
      try {
        const event = await eventsServiceServer.getEventById(eventId)
        if (event && !event.draft) { // Solo incluir eventos publicados
          events.push(event)
        }
      } catch (error) {
        // Evento no encontrado o error, continuar con el siguiente
        console.warn(`Event ${eventId} not found or error:`, error)
      }
    }

    // Ordenar por fecha del evento (próximos primero)
    events.sort((a, b) => {
      const dateA = new Date(a.eventDate || '2024-01-01')
      const dateB = new Date(b.eventDate || '2024-01-01')
      return dateA.getTime() - dateB.getTime()
    })
    
    return new Response(
      JSON.stringify({ eventIds, events }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting user liked events:', error)
    return new Response(
      JSON.stringify({ error: 'Error obteniendo eventos favoritos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})