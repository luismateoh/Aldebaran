import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Ruta donde se guardan los comentarios (solo desarrollo)
const COMMENTS_DIR = path.join(process.cwd(), 'data', 'comments')

// Asegurar que existe el directorio (solo en desarrollo)
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(COMMENTS_DIR)) {
  fs.mkdirSync(COMMENTS_DIR, { recursive: true })
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  eventId: string
}

// Simulación de base de datos en memoria para producción (temporal)
// En una implementación real, usarías Vercel KV, Supabase, o Firebase
const PRODUCTION_COMMENTS: Map<string, Comment[]> = new Map()

// Comentarios iniciales de demo
const DEMO_COMMENTS: Record<string, Comment[]> = {
  "2025-sep-8_bogota_carreradelamujer": [
    {
      id: "demo1",
      author: "Ana Corredora",
      content: "¡Excelente carrera! Gran organización y ambiente increíble. Ya estoy entrenando para el próximo año.",
      timestamp: "2024-08-03T10:30:00Z",
      eventId: "2025-sep-8_bogota_carreradelamujer"
    },
    {
      id: "demo2", 
      author: "Carlos Fitness",
      content: "Mi primera carrera de 5K y quedé súper motivado. El recorrido por Bogotá fue hermoso.",
      timestamp: "2024-08-03T09:15:00Z",
      eventId: "2025-sep-8_bogota_carreradelamujer"
    }
  ]
}

// Inicializar comentarios de demo en producción
if (process.env.NODE_ENV === 'production') {
  Object.entries(DEMO_COMMENTS).forEach(([eventId, comments]) => {
    PRODUCTION_COMMENTS.set(eventId, [...comments])
  })
}

// GET - Obtener comentarios de un evento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'EventId requerido' }, { status: 400 })
    }

    let comments: Comment[] = []

    // En producción, usar almacenamiento en memoria (temporal)
    if (process.env.NODE_ENV === 'production') {
      comments = PRODUCTION_COMMENTS.get(eventId) || []
    } else {
      // En desarrollo, usar sistema de archivos
      const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
      
      if (fs.existsSync(commentsFile)) {
        const commentsData = fs.readFileSync(commentsFile, 'utf8')
        comments = JSON.parse(commentsData)
      }
    }
    
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

    // Filtro básico de contenido
    const badWords = ['spam', 'fake', 'scam']
    const contentLower = content.toLowerCase()
    if (badWords.some(word => contentLower.includes(word))) {
      return NextResponse.json({ error: 'Contenido no permitido' }, { status: 400 })
    }

    // Crear nuevo comentario
    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: author.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      eventId
    }

    if (process.env.NODE_ENV === 'production') {
      // En producción, usar almacenamiento en memoria (temporal)
      const existingComments = PRODUCTION_COMMENTS.get(eventId) || []
      const updatedComments = [newComment, ...existingComments]
      
      // Limitar a 50 comentarios por evento
      if (updatedComments.length > 50) {
        updatedComments.splice(50)
      }
      
      PRODUCTION_COMMENTS.set(eventId, updatedComments)
    } else {
      // En desarrollo, usar sistema de archivos
      const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
      
      let comments: Comment[] = []
      if (fs.existsSync(commentsFile)) {
        const commentsData = fs.readFileSync(commentsFile, 'utf8')
        comments = JSON.parse(commentsData)
      }

      comments.unshift(newComment)
      
      if (comments.length > 100) {
        comments = comments.slice(0, 100)
      }

      fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2))
    }
    
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

// DELETE - Eliminar comentario (solo desarrollo)
export async function DELETE(request: NextRequest) {
  try {
    // En producción, retornar error
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        error: 'Funcionalidad no disponible en producción',
        demo: true
      }, { status: 403 })
    }

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
