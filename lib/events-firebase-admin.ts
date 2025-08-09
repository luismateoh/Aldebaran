import { getFirestore, FieldValue, Timestamp, CollectionReference, DocumentData } from 'firebase-admin/firestore'
import './firebase-admin'
import type { EventData } from '@/types'

const EVENTS_COLLECTION = 'events'

class EventsServiceAdmin {
  private db: ReturnType<typeof getFirestore>
  private eventsRef: CollectionReference<DocumentData>

  constructor() {
    this.db = getFirestore()
    this.eventsRef = this.db.collection(EVENTS_COLLECTION)
  }

  private transformFirestoreDoc(doc: any): EventData {
    const data = doc.data()
    
    // Manejar fecha del evento de manera más robusta
    let eventDate = ''
    const rawDate = data.eventDate || data.date
    if (rawDate) {
      // Si es un Timestamp de Firestore
      if (rawDate.toDate && typeof rawDate.toDate === 'function') {
        eventDate = rawDate.toDate().toISOString().split('T')[0]
      }
      // Si es una fecha en string
      else if (typeof rawDate === 'string' && rawDate.trim()) {
        const parsedDate = new Date(rawDate)
        if (!isNaN(parsedDate.getTime())) {
          eventDate = parsedDate.toISOString().split('T')[0]
        }
      }
    }
    
    // Manejar publishDate
    let publishDate = data.publishDate
    if (!publishDate) {
      publishDate = new Date().toISOString().split('T')[0]
    } else if (publishDate.toDate && typeof publishDate.toDate === 'function') {
      publishDate = publishDate.toDate().toISOString().split('T')[0]
    }

    return {
      id: doc.id,
      title: data.title || '',
      author: data.author || 'Luis Hincapie',
      publishDate: publishDate,
      draft: data.draft || data.status === 'draft',
      category: data.category || 'Running',
      tags: data.tags || [data.category?.toLowerCase() || 'running'],
      snippet: data.snippet || data.description?.substring(0, 150) || '',
      altitude: data.altitude || '1000m',
      eventDate: eventDate,
      organizer: data.organizer || '',
      registrationDeadline: data.registrationDeadline || '',
      registrationFee: data.registrationFee || data.registrationFeed || data.price || '',
      website: data.website || '',
      distances: Array.isArray(data.distances) ? data.distances : [],
      cover: data.cover || '',
      department: data.department || '',
      municipality: data.municipality || '',
      description: data.description || data.contentHtml || '',
      status: data.status || 'published',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }
  }

  // Get all events with optional filtering
  async getAllEvents(): Promise<EventData[]> {
    try {
      console.log('🔍 Obteniendo eventos desde Firebase Admin...')
      
      const snapshot = await this.eventsRef.get()
      console.log(`📊 Encontrados ${snapshot.size} eventos en Firebase`)
      
      const events: EventData[] = []
      snapshot.forEach(doc => {
        const eventData = this.transformFirestoreDoc(doc)
        events.push(eventData)
      })
      
      return events
    } catch (error) {
      console.error('❌ Error fetching events with Admin SDK:', error)
      throw error
    }
  }

  // Get a specific event by ID
  async getEventById(id: string): Promise<EventData | null> {
    try {
      console.log(`🔍 Obteniendo evento con ID: ${id}`)
      
      const docRef = this.eventsRef.doc(id)
      const docSnap = await docRef.get()
      
      if (!docSnap.exists) {
        console.log(`❌ Evento con ID ${id} no encontrado`)
        return null
      }
      
      const eventData = this.transformFirestoreDoc(docSnap)
      console.log(`✅ Evento encontrado: ${eventData.title}`)
      console.log('📊 Datos del evento transformado:', {
        id: eventData.id,
        title: eventData.title,
        eventDate: eventData.eventDate,
        municipality: eventData.municipality,
        department: eventData.department,
        organizer: eventData.organizer,
        category: eventData.category,
        distances: eventData.distances,
        registrationFee: eventData.registrationFee,
        website: eventData.website,
        altitude: eventData.altitude,
        cover: eventData.cover,
        description: eventData.description?.substring(0, 100) || 'Sin descripción'
      })
      
      return eventData
    } catch (error) {
      console.error(`❌ Error obteniendo evento ${id}:`, error)
      throw error
    }
  }

  // Create a new event
  async createEvent(eventData: Omit<EventData, 'id'>): Promise<EventData> {
    try {
      console.log(`📝 Creando nuevo evento: ${eventData.title}`)
      
      const docRef = await this.eventsRef.add({
        ...eventData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: eventData.status || 'published'
      })
      
      const newDoc = await docRef.get()
      const newEvent = this.transformFirestoreDoc(newDoc)
      
      console.log(`✅ Evento creado con ID: ${newEvent.id}`)
      return newEvent
    } catch (error) {
      console.error('❌ Error creating event with Admin SDK:', error)
      throw error
    }
  }

  // Update an existing event
  async updateEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
    try {
      console.log(`📝 Actualizando evento ${id} con Admin SDK`)
      
      const docRef = this.eventsRef.doc(id)
      
      // Check if document exists first
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        console.log(`❌ Evento con ID ${id} no encontrado`)
        return null
      }
      
      // Update the document
      await docRef.update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      })
      
      console.log(`✅ Evento ${id} actualizado exitosamente`)
      
      // Get and return the updated document
      const updatedDoc = await docRef.get()
      return this.transformFirestoreDoc(updatedDoc)
    } catch (error) {
      console.error('❌ Error updating event with Admin SDK:', error)
      throw error
    }
  }

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Eliminando evento ${id}`)
      
      const docRef = this.eventsRef.doc(id)
      await docRef.delete()
      
      console.log(`✅ Evento ${id} eliminado exitosamente`)
      return true
    } catch (error) {
      console.error('❌ Error deleting event with Admin SDK:', error)
      return false
    }
  }

  // Update event status
  async updateEventStatus(id: string, status: 'draft' | 'published' | 'cancelled'): Promise<EventData | null> {
    try {
      console.log(`📝 Actualizando estado del evento ${id} a ${status}`)
      
      return await this.updateEvent(id, { 
        status,
        draft: status === 'draft'
      })
    } catch (error) {
      console.error('❌ Error updating event status with Admin SDK:', error)
      throw error
    }
  }
}

// Export singleton instance
export const eventsServiceAdmin = new EventsServiceAdmin()