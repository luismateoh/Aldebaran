import { NextRequest } from 'next/server'
import { userInteractionsServiceServer } from '@/lib/user-interactions-firebase-server'
import { requireAuth } from '@/lib/auth-server'

// Toggle like en un evento
export const POST = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract eventId from URL path
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const eventId = pathSegments[pathSegments.length - 2] // The segment before 'like'
    
    // Validaciones de seguridad
    if (!eventId || eventId.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Invalid event ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validar formato del eventId (solo caracteres seguros)
    if (!/^[a-zA-Z0-9_-]+$/.test(eventId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario no esté haciendo spam de requests
    const userId = authResult.user.uid
    if (!userId || userId.length > 128) {
      return new Response(
        JSON.stringify({ error: 'Invalid user ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await userInteractionsServiceServer.toggleEventLike(eventId, authResult.user.uid)
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error toggling event like:', error)
    
    // Manejo específico de errores
    if (error instanceof Error) {
      if (error.message === 'Rate limit exceeded') {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      if (error.message.includes('Invalid')) {
        return new Response(
          JSON.stringify({ error: 'Invalid request parameters' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Error toggling like' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Obtener estado de like y conteo para un evento
export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const resolvedParams = await params
    const eventId = resolvedParams.id

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'Event ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener conteo de likes
    const likesCount = await userInteractionsServiceServer.getEventLikesCount(eventId)
    
    // Si hay userId, verificar si le dio like
    let isLiked = false
    if (userId) {
      isLiked = await userInteractionsServiceServer.isEventLikedByUser(eventId, userId)
    }

    return new Response(
      JSON.stringify({ 
        likesCount,
        isLiked,
        eventId 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting event like status:', error)
    return new Response(
      JSON.stringify({ error: 'Error getting like status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}