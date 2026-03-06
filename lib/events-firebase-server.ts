import { adminDb } from './firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { FirebaseEventData, EventData } from '@/types'

const EVENTS_COLLECTION = 'events'

export class EventsServiceServer {
  private eventsRef = adminDb.collection(EVENTS_COLLECTION)

  private parseEventDate(dateValue?: string): Date | null {
    if (!dateValue) return null

    const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue)
    if (localDateMatch) {
      const year = Number(localDateMatch[1])
      const month = Number(localDateMatch[2])
      const day = Number(localDateMatch[3])
      return new Date(year, month - 1, day)
    }

    const parsed = new Date(dateValue)
    return isNaN(parsed.getTime()) ? null : parsed
  }

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
        const eventDate = this.parseEventDate(event.eventDate)
        return !!eventDate && eventDate >= today && !event.draft
      })
      
      // Ordenar por fecha ascendente
      const sortedEvents = futureEvents.sort((a, b) => {
        const dateA = this.parseEventDate(a.eventDate || '') || new Date(2024, 0, 1)
        const dateB = this.parseEventDate(b.eventDate || '') || new Date(2024, 0, 1)
        return dateA.getTime() - dateB.getTime()
      })
      
      console.log(`✅ Devolviendo ${sortedEvents.length} eventos futuros`)
      return sortedEvents
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error)
      throw error
    }
  }

  async getAllEventsForExport(): Promise<EventData[]> {
    try {
      console.log('📊 Obteniendo TODOS los eventos para exportación...')
      
      const snapshot = await this.eventsRef.get()
      console.log(`📋 Encontrados ${snapshot.docs.length} eventos totales en Firebase`)
      
      const allEvents = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      // Ordenar por fecha descendente (más recientes primero)
      const sortedEvents = allEvents.sort((a, b) => {
        const dateA = this.parseEventDate(a.eventDate || '') || new Date(2024, 0, 1)
        const dateB = this.parseEventDate(b.eventDate || '') || new Date(2024, 0, 1)
        return dateB.getTime() - dateA.getTime()
      })
      
      console.log(`✅ Devolviendo ${sortedEvents.length} eventos totales para exportación`)
      return sortedEvents
    } catch (error) {
      console.error('❌ Error obteniendo eventos para exportación:', error)
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
        .filter(event => {
          const eventDate = this.parseEventDate(event.eventDate || '')
          return !!eventDate && eventDate >= today
        })
    } catch (error) {
      console.error('Error getting events by category:', error)
      return []
    }
  }

  private transformFirestoreDoc(doc: any): EventData {
    const data = doc.data()

    // Manejar fecha del evento de manera robusta
    let eventDate = ''
    const rawDate = data.eventDate || data.date
    if (rawDate) {
      if (rawDate instanceof Timestamp) {
        eventDate = rawDate.toDate().toISOString().split('T')[0]
      } else if (typeof rawDate === 'string' && rawDate.trim()) {
        const parsedDate = new Date(rawDate)
        if (!isNaN(parsedDate.getTime())) {
          eventDate = parsedDate.toISOString().split('T')[0]
        }
      }
    }

    // Manejar publishDate
    let publishDate = data.publishDate
    if (publishDate instanceof Timestamp) {
      publishDate = publishDate.toDate().toISOString().split('T')[0]
    }

    // Manejar distancesVerificationAt para serialización server -> client
    const distancesVerificationAt = data.distancesVerificationAt instanceof Timestamp
      ? data.distancesVerificationAt.toDate().toISOString()
      : (data.distancesVerificationAt || null)

    return {
      id: doc.id,
      title: data.title || '',
      description: data.description || '',
      author: data.author || 'Luis Hincapie',
      publishDate: publishDate || new Date().toISOString().split('T')[0],
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
      contentHtml: data.description || data.contentHtml || '',
      status: data.status || 'published',
      distancesVerifiedBy: data.distancesVerifiedBy || '',
      distancesVerificationStatus: data.distancesVerificationStatus || '',
      distancesVerificationNote: data.distancesVerificationNote || '',
      distancesVerificationAt,
      createdAt: data.createdAt instanceof Timestamp ? 
        data.createdAt.toDate().toISOString() : 
        (data.createdAt || new Date().toISOString()),
      updatedAt: data.updatedAt instanceof Timestamp ? 
        data.updatedAt.toDate().toISOString() : 
        (data.updatedAt || new Date().toISOString())
    }
  }
}

export const eventsServiceServer = new EventsServiceServer()