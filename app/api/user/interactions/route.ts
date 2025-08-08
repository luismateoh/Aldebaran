import { NextRequest } from 'next/server'
import { userInteractionsServiceServer } from '@/lib/user-interactions-firebase-server'
import { requireAuth } from '@/lib/auth-server'

// Obtener interacciones del usuario
export const GET = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const interactions = await userInteractionsServiceServer.getUserInteractions(authResult.user.uid)
    
    return new Response(
      JSON.stringify({ interactions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting user interactions:', error)
    return new Response(
      JSON.stringify({ error: 'Error obteniendo interacciones' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Crear o actualizar interacción con evento
export const POST = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const { eventId, attended, interested, registered, notes, rating, completedDate } = body

    // Validaciones básicas
    if (!eventId || typeof eventId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'EventId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validar formato del eventId
    if (!/^[a-zA-Z0-9_-]+$/.test(eventId) || eventId.length > 200) {
      return new Response(
        JSON.stringify({ error: 'EventId inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const interaction = {
      attended: Boolean(attended),
      interested: Boolean(interested), 
      registered: Boolean(registered),
      notes: notes && typeof notes === 'string' ? notes.slice(0, 500) : '',
      rating: rating && typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : null,
      completedDate: completedDate || null
    }

    await userInteractionsServiceServer.setUserEventInteraction(
      authResult.user.uid, 
      eventId, 
      interaction
    )

    // Obtener la interacción actualizada
    const updatedInteraction = await userInteractionsServiceServer.getUserEventInteraction(
      authResult.user.uid, 
      eventId
    )

    return new Response(
      JSON.stringify(updatedInteraction),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error setting user interaction:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid')) {
        return new Response(
          JSON.stringify({ error: 'Datos inválidos' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Error guardando interacción' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})