// Ejemplo de migración a Vercel KV - NO EJECUTAR AÚN
// Descomenta este código cuando tengas Vercel KV configurado

// import { kv } from '@vercel/kv'
// import { NextRequest, NextResponse } from 'next/server'

// interface Comment {
//   id: string
//   author: string
//   content: string
//   timestamp: string
//   eventId: string
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const eventId = searchParams.get('eventId')
    
//     if (!eventId) {
//       return NextResponse.json({ error: 'EventId requerido' }, { status: 400 })
//     }

//     // Obtener comentarios de Vercel KV
//     const comments = await kv.lrange(`comments:${eventId}`, 0, 99) || []
    
//     return NextResponse.json({ comments })
//   } catch (error) {
//     console.error('Error loading comments:', error)
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { eventId, author, content } = await request.json()
    
//     // Validaciones (mismo código)
//     if (!eventId || !author || !content) {
//       return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
//     }

//     const newComment: Comment = {
//       id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       author: author.trim(),
//       content: content.trim(),
//       timestamp: new Date().toISOString(),
//       eventId
//     }

//     // Guardar en Vercel KV
//     await kv.lpush(`comments:${eventId}`, JSON.stringify(newComment))
    
//     // Limitar a 100 comentarios por evento
//     await kv.ltrim(`comments:${eventId}`, 0, 99)
    
//     return NextResponse.json({ 
//       success: true, 
//       comment: newComment,
//       message: 'Comentario agregado exitosamente'
//     })
//   } catch (error) {
//     console.error('Error saving comment:', error)
//     return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
//   }
// }

console.log('Archivo de migración a Vercel KV - Lee docs/comments-setup.md para instrucciones')
