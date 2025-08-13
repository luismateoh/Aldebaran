import { NextRequest, NextResponse } from 'next/server'
import { eventsServiceServer } from '@/lib/events-firebase-server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Iniciando exportación de eventos a Excel...')

    // Obtener todos los eventos (incluyendo históricos)
    const allEvents = await eventsServiceServer.getAllEventsForExport()
    console.log(`📋 Obtenidos ${allEvents.length} eventos para exportar`)

    // Preparar datos para Excel
    const excelData = allEvents.map(event => {
      // Calcular estado del evento
      const eventDate = new Date(event.eventDate || '2024-01-01')
      const today = new Date()
      let estado = 'Desconocido'
      
      if (event.draft) {
        estado = 'Borrador'
      } else if (event.status === 'cancelled') {
        estado = 'Cancelado'
      } else if (event.status === 'archived') {
        estado = 'Archivado'
      } else if (eventDate < today) {
        estado = 'Finalizado'
      } else {
        estado = 'Próximo'
      }

      return {
        'ID': event.id || '',
        'Título': event.title || '',
        'Fecha del Evento': event.eventDate || '',
        'Municipio': event.municipality || '',
        'Departamento': event.department || '',
        'Estado': estado,
        'Categoría': event.category || '',
        'Organizador': event.organizer || '',
        'Distancias': Array.isArray(event.distances) ? event.distances.join(', ') : (event.distances || ''),
        'Precio': event.price || event.registrationFee || '',
        'Sitio Web': event.website || event.registrationUrl || '',
        'Descripción': event.description || event.snippet || '',
        'Altitud': event.altitude || '',
        'Es Borrador': event.draft ? 'Sí' : 'No',
        'Autor': event.author || '',
        'Fecha de Publicación': event.publishDate || '',
        'Fecha de Cierre Inscripciones': event.registrationDeadline || '',
        'Tags': Array.isArray(event.tags) ? event.tags.join(', ') : (event.tags || ''),
        'Likes': event.likesCount || 0,
        'Interesados': event.interestedCount || 0,
        'Asistentes': event.attendeesCount || 0,
        'Fecha de Creación': event.createdAt ? new Date(event.createdAt).toISOString().split('T')[0] : '',
        'Última Actualización': event.updatedAt ? new Date(event.updatedAt).toISOString().split('T')[0] : ''
      }
    })

    console.log(`📝 Datos preparados: ${excelData.length} filas`)

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Configurar anchos de columnas
    const columnWidths = [
      { wch: 15 }, // ID
      { wch: 40 }, // Título
      { wch: 12 }, // Fecha del Evento
      { wch: 20 }, // Municipio
      { wch: 20 }, // Departamento
      { wch: 12 }, // Estado
      { wch: 15 }, // Categoría
      { wch: 25 }, // Organizador
      { wch: 20 }, // Distancias
      { wch: 15 }, // Precio
      { wch: 30 }, // Sitio Web
      { wch: 50 }, // Descripción
      { wch: 10 }, // Altitud
      { wch: 10 }, // Es Borrador
      { wch: 20 }, // Autor
      { wch: 15 }, // Fecha de Publicación
      { wch: 20 }, // Fecha de Cierre Inscripciones
      { wch: 30 }, // Tags
      { wch: 8 },  // Likes
      { wch: 12 }, // Interesados
      { wch: 12 }, // Asistentes
      { wch: 15 }, // Fecha de Creación
      { wch: 18 }  // Última Actualización
    ]
    worksheet['!cols'] = columnWidths

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos')

    // Generar archivo Excel
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    })

    const now = new Date()
    const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD
    const filename = `eventos-aldebaran-${timestamp}.xlsx`

    console.log(`✅ Archivo Excel generado: ${filename}`)

    // Retornar archivo Excel
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ Error exportando eventos:', error)
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