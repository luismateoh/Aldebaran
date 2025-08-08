import { NextRequest } from 'next/server'
import { userInteractionsServiceServer } from '@/lib/user-interactions-firebase-server'
import { requireAuth } from '@/lib/auth-server'

// Obtener perfil del usuario
export const GET = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const profile = await userInteractionsServiceServer.getUserProfile(authResult.user.uid)
    
    if (!profile) {
      // Crear perfil básico si no existe
      await userInteractionsServiceServer.createOrUpdateUserProfile(authResult.user.uid, {
        email: authResult.user.email || '',
        displayName: authResult.user.email || 'Usuario'
      })
      
      const newProfile = await userInteractionsServiceServer.getUserProfile(authResult.user.uid)
      return new Response(
        JSON.stringify(newProfile),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify(profile),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting user profile:', error)
    return new Response(
      JSON.stringify({ error: 'Error obteniendo perfil' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Actualizar perfil del usuario
export const PUT = requireAuth(async (request: NextRequest, authResult) => {
  try {
    if (!authResult.user?.uid) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const updates = await request.json()
    
    await userInteractionsServiceServer.createOrUpdateUserProfile(authResult.user.uid, updates)
    
    const updatedProfile = await userInteractionsServiceServer.getUserProfile(authResult.user.uid)
    
    return new Response(
      JSON.stringify(updatedProfile),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating user profile:', error)
    return new Response(
      JSON.stringify({ error: 'Error actualizando perfil' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})