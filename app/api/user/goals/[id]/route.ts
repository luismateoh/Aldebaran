import { NextRequest } from 'next/server'
import { userInteractionsServiceServer } from '@/lib/user-interactions-firebase-server'
import { requireAuth } from '@/lib/auth-server'

// Actualizar meta específica
export const PUT = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extraer ID de la URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const goalId = pathSegments[pathSegments.length - 1]

    if (!goalId || goalId.length > 100) {
      return new Response(
        JSON.stringify({ error: 'ID de meta inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const updates = await request.json()
    const { title, description, category, targetValue, targetUnit, targetDate, status, currentProgress } = updates

    // Validaciones básicas
    if (title && title.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Título muy largo' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (description && description.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Descripción muy larga' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const validStatuses = ['active', 'completed', 'paused']
    if (status && !validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Estado inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const filteredUpdates = {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(category && { category }),
      ...(targetValue !== undefined && { targetValue }),
      ...(targetUnit && { targetUnit }),
      ...(targetDate && { targetDate }),
      ...(status && { status }),
      ...(currentProgress !== undefined && { currentProgress })
    }

    if (status === 'completed' && !filteredUpdates.completedAt) {
      filteredUpdates.completedAt = new Date()
    }

    const updatedGoal = await userInteractionsServiceServer.updateUserGoal(
      authResult.user.uid,
      goalId,
      filteredUpdates
    )

    if (!updatedGoal) {
      return new Response(
        JSON.stringify({ error: 'Meta no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(updatedGoal),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating goal:', error)
    return new Response(
      JSON.stringify({ error: 'Error actualizando meta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Eliminar meta específica
export const DELETE = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extraer ID de la URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const goalId = pathSegments[pathSegments.length - 1]

    if (!goalId || goalId.length > 100) {
      return new Response(
        JSON.stringify({ error: 'ID de meta inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const success = await userInteractionsServiceServer.deleteUserGoal(
      authResult.user.uid,
      goalId
    )

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Meta no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Meta eliminada correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error deleting goal:', error)
    return new Response(
      JSON.stringify({ error: 'Error eliminando meta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})