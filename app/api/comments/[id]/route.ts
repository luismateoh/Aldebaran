import { NextRequest, NextResponse } from 'next/server'
import { commentsServiceServer } from '@/lib/comments-firebase-server'
import { requireAuth } from '@/lib/auth-server'

// Endpoint para actualizar un comentario (solo admin)
export const PUT = requireAuth(async (request: NextRequest, authResult) => {
  try {
    // Verificar que el usuario sea admin
    if (!authResult.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extraer el ID del comentario de la URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const commentId = pathSegments[pathSegments.length - 1]

    // Validaciones de seguridad para PUT
    if (!commentId || commentId.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!/^[a-zA-Z0-9]+$/.test(commentId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const updates = await request.json()
    
    if (!updates.content && updates.hidden === undefined) {
      return new Response(
        JSON.stringify({ error: 'content or hidden status is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const updatedComment = await commentsServiceServer.updateComment(commentId, updates)
    
    if (!updatedComment) {
      return new Response(
        JSON.stringify({ error: 'Comment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify(updatedComment),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating comment:', error)
    return new Response(
      JSON.stringify({ error: 'Error updating comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Endpoint para eliminar un comentario (solo admin)
export const DELETE = requireAuth(async (request: NextRequest, authResult) => {
  try {
    // Verificar que el usuario sea admin
    if (!authResult.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Extraer el ID del comentario de la URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const commentId = pathSegments[pathSegments.length - 1]

    // Validaciones de seguridad para DELETE
    if (!commentId || commentId.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!/^[a-zA-Z0-9]+$/.test(commentId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid comment ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const success = await commentsServiceServer.deleteComment(commentId)
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Comment not found or could not be deleted' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ message: 'Comment deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error deleting comment:', error)
    return new Response(
      JSON.stringify({ error: 'Error deleting comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})