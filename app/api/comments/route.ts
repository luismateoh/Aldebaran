import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ruta donde se guardan los comentarios (en desarrollo)
const COMMENTS_DIR = path.join(process.cwd(), 'data', 'comments')

// Asegurar que existe el directorio
if (!fs.existsSync(COMMENTS_DIR)) {
  fs.mkdirSync(COMMENTS_DIR, { recursive: true })
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  eventId: string
}

// GET - Obtener comentarios de un evento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'EventId requerido' }, { status: 400 })
    }

    const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
    
    if (!fs.existsSync(commentsFile)) {
      return NextResponse.json({ comments: [] })
    }

    const commentsData = fs.readFileSync(commentsFile, 'utf8')
    const comments: Comment[] = JSON.parse(commentsData)
    
    // Ordenar por fecha (más recientes primero)
    comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error loading comments:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Agregar nuevo comentario
export async function POST(request: NextRequest) {
  try {
    const { eventId, author, content } = await request.json()
    
    // Validaciones
    if (!eventId || !author || !content) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    if (author.trim().length < 2) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
    }

    if (content.trim().length < 5) {
      return NextResponse.json({ error: 'El comentario debe tener al menos 5 caracteres' }, { status: 400 })
    }

    // Filtro básico de contenido (opcional)
    const badWords = ['spam', 'fake', 'scam']
    const contentLower = content.toLowerCase()
    if (badWords.some(word => contentLower.includes(word))) {
      return NextResponse.json({ error: 'Contenido no permitido' }, { status: 400 })
    }

    const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
    
    // Cargar comentarios existentes
    let comments: Comment[] = []
    if (fs.existsSync(commentsFile)) {
      const commentsData = fs.readFileSync(commentsFile, 'utf8')
      comments = JSON.parse(commentsData)
    }

    // Crear nuevo comentario
    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: author.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      eventId
    }

    // Agregar al inicio (más reciente primero)
    comments.unshift(newComment)
    
    // Limitar a 100 comentarios por evento (opcional)
    if (comments.length > 100) {
      comments = comments.slice(0, 100)
    }

    // Guardar comentarios
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      comment: newComment,
      message: 'Comentario agregado exitosamente'
    })
  } catch (error) {
    console.error('Error saving comment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar comentario (opcional, para moderación)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const commentId = searchParams.get('commentId')
    
    if (!eventId || !commentId) {
      return NextResponse.json({ error: 'EventId y CommentId requeridos' }, { status: 400 })
    }

    const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
    
    if (!fs.existsSync(commentsFile)) {
      return NextResponse.json({ error: 'Comentarios no encontrados' }, { status: 404 })
    }

    const commentsData = fs.readFileSync(commentsFile, 'utf8')
    let comments: Comment[] = JSON.parse(commentsData)
    
    // Filtrar el comentario a eliminar
    const initialLength = comments.length
    comments = comments.filter(comment => comment.id !== commentId)
    
    if (comments.length === initialLength) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
    }

    // Guardar comentarios actualizados
    fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2))
    
    return NextResponse.json({ 
      success: true,
      message: 'Comentario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
