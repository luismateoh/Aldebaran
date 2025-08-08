import { adminDb } from './firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { FirebaseEventData, EventData } from '../types'

const EVENTS_COLLECTION = 'events'

export class EventsServiceServer {
  private eventsRef = adminDb.collection(EVENTS_COLLECTION)

  async getAllEvents(): Promise<EventData[]> {
    try {
      console.log('🔍 Obteniendo eventos desde Firebase...')
      
      const snapshot = await this.eventsRef.get()
      console.log(`📊 Encontrados ${snapshot.docs.length} eventos en Firebase`)
      
      const events = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      // Filtrar solo eventos futuros Y publicados
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const futureEvents = events.filter(event => {
        if (!event.eventDate) return false
        const eventDate = new Date(event.eventDate)
        return eventDate >= today && !event.draft
      })
      
      // Ordenar por fecha ascendente
      const sortedEvents = futureEvents.sort((a, b) => {
        const dateA = new Date(a.eventDate || '2024-01-01')
        const dateB = new Date(b.eventDate || '2024-01-01')
        return dateA.getTime() - dateB.getTime()
      })
      
      console.log(`✅ Devolviendo ${sortedEvents.length} eventos futuros`)
      return sortedEvents
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error)
      throw error
    }
  }

  async getEventById(id: string): Promise<EventData | null> {
    try {
      // Validaciones de seguridad
      if (!id || id.length > 200) {
        throw new Error('Invalid event ID')
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        throw new Error('Invalid event ID format')
      }

      const doc = await this.eventsRef.doc(id).get()
      return doc.exists ? this.transformFirestoreDoc(doc) : null
    } catch (error) {
      console.error('Error getting event by ID:', error)
      return null
    }
  }

  async createEvent(eventData: Omit<FirebaseEventData, 'id'>): Promise<EventData> {
    try {
      // Validaciones básicas
      if (!eventData.title || !eventData.eventDate) {
        throw new Error('Missing required fields')
      }

      const docRef = await this.eventsRef.add({
        ...eventData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
      
      const newDoc = await docRef.get()
      return this.transformFirestoreDoc(newDoc)
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async updateEvent(id: string, updates: Partial<FirebaseEventData>): Promise<EventData | null> {
    try {
      // Validaciones de seguridad
      if (!id || id.length > 200) {
        throw new Error('Invalid event ID')
      }

      const docRef = this.eventsRef.doc(id)
      await docRef.update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      })
      
      const updatedDoc = await docRef.get()
      return updatedDoc.exists ? this.transformFirestoreDoc(updatedDoc) : null
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      // Validaciones de seguridad
      if (!id || id.length > 200) {
        throw new Error('Invalid event ID')
      }

      const docRef = this.eventsRef.doc(id)
      const doc = await docRef.get()
      if (!doc.exists) {
        return false
      }

      await docRef.delete()
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      return false
    }
  }

  async getEventsByCategory(category: string): Promise<EventData[]> {
    try {
      if (!category || category.length > 50) {
        throw new Error('Invalid category')
      }

      const snapshot = await this.eventsRef
        .where('category', '==', category)
        .where('draft', '==', false)
        .orderBy('eventDate', 'asc')
        .get()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return snapshot.docs
        .map(doc => this.transformFirestoreDoc(doc))
        .filter(event => new Date(event.eventDate || '2024-01-01') >= today)
    } catch (error) {
      console.error('Error getting events by category:', error)
      return []
    }
  }

  private transformFirestoreDoc(doc: any): EventData {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      publishDate: data.publishDate instanceof Timestamp ? 
        data.publishDate.toDate().toISOString().split('T')[0] : 
        data.publishDate || new Date().toISOString().split('T')[0],
      eventDate: data.eventDate || '',
      registrationDeadline: data.registrationDeadline || '',
      createdAt: data.createdAt instanceof Timestamp ? 
        data.createdAt.toDate() : 
        data.createdAt || new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? 
        data.updatedAt.toDate() : 
        data.updatedAt || new Date()
    }
  }
}

export const eventsServiceServer = new EventsServiceServer()