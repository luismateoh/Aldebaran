import { NextRequest, NextResponse } from 'next/server'
import { commentQueries } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// Detectar si estamos usando Vercel dev (conexiones reales) o next dev (desarrollo local)
const isVercelDev = process.env.VERCEL_ENV || process.env.POSTGRES_URL
const useRealDatabase = process.env.NODE_ENV === 'production' || isVercelDev

// Ruta donde se guardan los comentarios (solo desarrollo local sin conexiones)
const COMMENTS_DIR = path.join(process.cwd(), 'data', 'comments')

// Asegurar que existe el directorio (solo en desarrollo local)
if (!useRealDatabase && !fs.existsSync(COMMENTS_DIR)) {
  fs.mkdirSync(COMMENTS_DIR, { recursive: true })
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  eventId: string
}

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

// GET - Obtener comentarios de un evento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'EventId requerido' }, { status: 400 })
    }

    let comments: Comment[] = []
    let storageUsed = 'unknown'

    if (useRealDatabase) {
      // Usar Postgres (producción o vercel dev)
      try {
        console.log('🔧 Usando Postgres real para comentarios')
        const dbComments = await commentQueries.getCommentsByEventId(eventId)
        comments = dbComments.map(c => ({
          id: c.id.toString(),
          author: c.author,
          content: c.content,
          timestamp: c.createdAt?.toISOString() || new Date().toISOString(),
          eventId: c.eventId
        }))
        storageUsed = 'postgres-real'
      } catch (dbError) {
        console.log('⚠️ Error Postgres, usando fallback:', dbError)
        // Fallback a comentarios demo si Postgres falla
        comments = DEMO_COMMENTS[eventId] || []
        storageUsed = 'demo-fallback'
      }
    } else {
      // En desarrollo local sin conexiones, usar sistema de archivos
      console.log('🔧 Usando archivos locales para comentarios')
      const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
      
      if (fs.existsSync(commentsFile)) {
        const commentsData = fs.readFileSync(commentsFile, 'utf8')
        comments = JSON.parse(commentsData)
        storageUsed = 'local-files'
      } else {
        // Si no existe archivo local, usar comentarios demo
        comments = DEMO_COMMENTS[eventId] || []
        storageUsed = 'demo-local'
      }
    }
    
    // Ordenar por fecha (más recientes primero)
    comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json({ 
      comments,
      storage: storageUsed,
      persistent: useRealDatabase,
      environment: isVercelDev ? 'vercel-dev' : process.env.NODE_ENV
    })
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

    if (useRealDatabase) {
      // Usar Postgres (producción o vercel dev)
      try {
        console.log('🔧 Guardando comentario en Postgres real')
        const dbComment = await commentQueries.createComment({
          eventId,
          author: author.trim(),
          content: content.trim(),
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })
        
        console.log(`✅ Comentario guardado en Postgres para evento ${eventId}`)
        
        return NextResponse.json({ 
          success: true, 
          comment: {
            id: dbComment.id.toString(),
            author: dbComment.author,
            content: dbComment.content,
            timestamp: dbComment.createdAt?.toISOString() || new Date().toISOString(),
            eventId: dbComment.eventId
          },
          message: 'Comentario agregado exitosamente',
          storage: 'postgres-real',
          persistent: true
        })
      } catch (dbError) {
        console.error('❌ Error guardando en Postgres:', dbError)
        return NextResponse.json({ 
          error: 'Error al guardar comentario',
          details: 'Servicio de base de datos temporalmente no disponible'
        }, { status: 503 })
      }
    } else {
      // En desarrollo local, usar sistema de archivos
      console.log('🔧 Guardando comentario en archivos locales')
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
      console.log(`✅ Comentario guardado localmente para evento ${eventId}`)
      
      return NextResponse.json({ 
        success: true, 
        comment: newComment,
        message: 'Comentario agregado exitosamente',
        storage: 'local-files',
        persistent: false
      })
    }
  } catch (error) {
    console.error('Error saving comment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar comentario (solo para admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const commentId = searchParams.get('commentId')
    const adminToken = request.headers.get('authorization')
    
    // Verificar autorización admin
    if (!adminToken || !adminToken.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Autorización requerida para eliminar comentarios'
      }, { status: 401 })
    }
    
    if (!eventId || !commentId) {
      return NextResponse.json({ error: 'EventId y CommentId requeridos' }, { status: 400 })
    }

    if (useRealDatabase) {
      // En producción o vercel dev, usar Postgres
      console.log(`🔧 Eliminando comentario de Postgres: ${commentId}`)
      try {
        await commentQueries.deleteComment(parseInt(commentId))
        console.log(`✅ Comentario eliminado de Postgres: ${commentId}`)
      } catch (dbError) {
        console.error('Error eliminando de Postgres:', dbError)
        return NextResponse.json({ error: 'Error eliminando comentario' }, { status: 500 })
      }
    } else {
      // En desarrollo local, usar sistema de archivos
      const commentsFile = path.join(COMMENTS_DIR, `${eventId}.json`)
      
      if (!fs.existsSync(commentsFile)) {
        return NextResponse.json({ error: 'Comentarios no encontrados' }, { status: 404 })
      }

      const commentsData = fs.readFileSync(commentsFile, 'utf8')
      let comments: Comment[] = JSON.parse(commentsData)
      
      const initialLength = comments.length
      comments = comments.filter(comment => comment.id !== commentId)
      
      if (comments.length === initialLength) {
        return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })
      }

      fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2))
      console.log(`✅ Comentario eliminado localmente: ${commentId}`)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Comentario eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
