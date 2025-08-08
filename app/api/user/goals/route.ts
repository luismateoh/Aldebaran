import { NextRequest } from 'next/server'
import { userInteractionsServiceServer } from '@/lib/user-interactions-firebase-server'
import { requireAuth } from '@/lib/auth-server'

interface UserGoal {
  id?: string
  title: string
  description: string
  category: 'distance' | 'time' | 'frequency' | 'event' | 'personal'
  targetValue?: number
  targetUnit?: string
  targetDate?: string
  currentProgress?: number
  status: 'active' | 'completed' | 'paused'
  createdAt?: Date
  completedAt?: Date
}

// Obtener metas del usuario
export const GET = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const goals = await userInteractionsServiceServer.getUserGoals(authResult.user.uid)
    
    return new Response(
      JSON.stringify({ goals }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting user goals:', error)
    return new Response(
      JSON.stringify({ error: 'Error obteniendo metas' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Crear nueva meta
export const POST = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const { title, description, category, targetValue, targetUnit, targetDate } = body

    // Validaciones
    if (!title || !description || !category) {
      return new Response(
        JSON.stringify({ error: 'Título, descripción y categoría son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (title.length > 100 || description.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Título o descripción muy largos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const validCategories = ['distance', 'time', 'frequency', 'event', 'personal']
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Categoría inválida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const goal: UserGoal = {
      title: title.trim(),
      description: description.trim(),
      category,
      targetValue: targetValue || null,
      targetUnit: targetUnit || null,
      targetDate: targetDate || null,
      currentProgress: 0,
      status: 'active'
    }

    const newGoal = await userInteractionsServiceServer.createUserGoal(authResult.user.uid, goal)
    
    return new Response(
      JSON.stringify(newGoal),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating user goal:', error)
    return new Response(
      JSON.stringify({ error: 'Error creando meta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})