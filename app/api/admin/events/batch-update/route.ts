import { NextRequest } from 'next/server'
import { eventsServiceServer } from '@/lib/events-firebase-server'
import { requireAdmin } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'

// Endpoint para operaciones batch en eventos (solo admins)
export const POST = requireAdmin(async (request: NextRequest, authResult) => {
  try {
    const body = await request.json()
    const { operation, eventIds, updates } = body

    if (!operation) {
      return new Response(
        JSON.stringify({ error: 'Operation is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let result;

    switch (operation) {
      case 'mark_all_draft':
        result = await markAllEventsAsDraft()
        break;
        
      case 'mark_selected_draft':
        if (!eventIds || !Array.isArray(eventIds)) {
          return new Response(
            JSON.stringify({ error: 'eventIds array is required for this operation' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        result = await markSelectedEventsAsDraft(eventIds)
        break;
        
      case 'batch_update':
        if (!eventIds || !Array.isArray(eventIds) || !updates) {
          return new Response(
            JSON.stringify({ error: 'eventIds and updates are required for batch update' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        result = await batchUpdateEvents(eventIds, updates)
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in batch update:', error)
    return new Response(
      JSON.stringify({ error: 'Error performing batch operation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function markAllEventsAsDraft(): Promise<{ success: boolean, updatedCount: number, message: string }> {
  try {
    console.log('🔄 Iniciando proceso para marcar todos los eventos como draft...')
    
    // Obtener todos los eventos desde Firestore directamente
    const eventsSnapshot = await adminDb.collection('events').get()
    const allEvents = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      draft: doc.data().draft || false
    }))
    console.log(`📊 Procesando ${allEvents.length} eventos`)
    
    let updatedCount = 0
    const batchPromises = []
    
    for (const event of allEvents) {
      // Solo actualizar si no es draft
      if (!event.draft) {
        const updatePromise = eventsServiceServer.updateEvent(event.id, { 
          draft: true 
        })
        batchPromises.push(updatePromise)
        updatedCount++
        console.log(`📝 Marcando como draft: ${event.title}`)
      }
    }
    
    if (batchPromises.length > 0) {
      await Promise.all(batchPromises)
      console.log(`✅ Actualizados ${updatedCount} eventos como draft`)
    }
    
    return {
      success: true,
      updatedCount,
      message: `${updatedCount} eventos marcados como draft exitosamente`
    }
    
  } catch (error) {
    console.error('❌ Error marcando eventos como draft:', error)
    throw error
  }
}

async function markSelectedEventsAsDraft(eventIds: string[]): Promise<{ success: boolean, updatedCount: number, message: string }> {
  try {
    console.log(`🔄 Marcando ${eventIds.length} eventos seleccionados como draft...`)
    
    let updatedCount = 0
    const batchPromises = []
    
    for (const eventId of eventIds) {
      // Validar formato del eventId
      if (!/^[a-zA-Z0-9_-]+$/.test(eventId) || eventId.length > 200) {
        console.warn(`⚠️  Saltando evento con ID inválido: ${eventId}`)
        continue
      }
      
      const updatePromise = eventsServiceServer.updateEvent(eventId, { 
        draft: true 
      }).then(result => {
        if (result) {
          updatedCount++
          console.log(`📝 Marcado como draft: ${eventId}`)
        }
      }).catch(error => {
        console.warn(`⚠️  Error actualizando ${eventId}:`, error.message)
      })
      
      batchPromises.push(updatePromise)
    }
    
    await Promise.all(batchPromises)
    console.log(`✅ Actualizados ${updatedCount} eventos como draft`)
    
    return {
      success: true,
      updatedCount,
      message: `${updatedCount} eventos marcados como draft exitosamente`
    }
    
  } catch (error) {
    console.error('❌ Error marcando eventos seleccionados como draft:', error)
    throw error
  }
}

async function batchUpdateEvents(eventIds: string[], updates: any): Promise<{ success: boolean, updatedCount: number, message: string }> {
  try {
    console.log(`🔄 Actualizando ${eventIds.length} eventos con batch update...`)
    
    // Validar updates permitidos
    const allowedFields = ['draft', 'title', 'snippet', 'category', 'tags', 'eventDate', 'organizer', 'municipality', 'department']
    const filteredUpdates: any = {}
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid updates provided')
    }
    
    let updatedCount = 0
    const batchPromises = []
    
    for (const eventId of eventIds) {
      // Validar formato del eventId
      if (!/^[a-zA-Z0-9_-]+$/.test(eventId) || eventId.length > 200) {
        console.warn(`⚠️  Saltando evento con ID inválido: ${eventId}`)
        continue
      }
      
      const updatePromise = eventsServiceServer.updateEvent(eventId, filteredUpdates)
        .then(result => {
          if (result) {
            updatedCount++
            console.log(`📝 Actualizado: ${eventId}`)
          }
        }).catch(error => {
          console.warn(`⚠️  Error actualizando ${eventId}:`, error.message)
        })
      
      batchPromises.push(updatePromise)
    }
    
    await Promise.all(batchPromises)
    console.log(`✅ Actualizados ${updatedCount} eventos`)
    
    return {
      success: true,
      updatedCount,
      message: `${updatedCount} eventos actualizados exitosamente`
    }
    
  } catch (error) {
    console.error('❌ Error en batch update:', error)
    throw error
  }
}