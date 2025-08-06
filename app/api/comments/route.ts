import { NextRequest, NextResponse } from 'next/server'
import { commentsService } from '@/lib/comments-firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }
    
    const comments = await commentsService.getCommentsByEventId(eventId)
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const commentData = await request.json()
    
    if (!commentData.eventId || !commentData.author || !commentData.content) {
      return NextResponse.json(
        { error: 'eventId, author, and content are required' },
        { status: 400 }
      )
    }
    
    const newComment = await commentsService.createComment(commentData)
    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    )
  }
}
