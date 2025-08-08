import { NextRequest, NextResponse } from 'next/server'
import { commentsServiceServer } from '@/lib/comments-firebase-server'
import { requireAuth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const includeHidden = searchParams.get('includeHidden') === 'true'
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }
    
    const comments = await commentsServiceServer.getCommentsByEventId(eventId, includeHidden)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(async (request: NextRequest, authResult) => {
  try {
    const commentData = await request.json()
    
    if (!commentData.eventId || !commentData.content) {
      return new Response(
        JSON.stringify({ error: 'eventId and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Usar el usuario autenticado para el comentario
    const enrichedCommentData = {
      ...commentData,
      author: commentData.author || authResult.user?.email || 'Usuario',
      userId: authResult.user?.uid,
      photoURL: commentData.photoURL // Incluir foto de perfil si se proporciona
    }
    
    const newComment = await commentsServiceServer.createComment(enrichedCommentData)
    return new Response(
      JSON.stringify(newComment),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return new Response(
      JSON.stringify({ error: 'Error creating comment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
