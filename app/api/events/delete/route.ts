import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceServer } from '@/lib/events-firebase-server'
import { verifyAdminToken } from '@/lib/auth-server'

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const authResult = await verifyAdminToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' }, 
        { status: 401 }
      )
    }

    const user = authResult.user

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'ID de evento requerido' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Admin ${user.email} eliminando evento ${eventId}`)

    // Eliminar evento
    const deleted = await eventsServiceServer.deleteEvent(eventId)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado o ya eliminado' },
        { status: 404 }
      )
    }

    console.log(`✅ Evento ${eventId} eliminado exitosamente`)

    return NextResponse.json({ 
      success: true, 
      message: 'Evento eliminado exitosamente' 
    })

  } catch (error) {
    console.error('❌ Error eliminando evento:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}