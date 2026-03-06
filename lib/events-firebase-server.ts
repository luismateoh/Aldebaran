import { adminDb } from './firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { FirebaseEventData, EventData } from '@/types'

const EVENTS_COLLECTION = 'events'
const INVALID_EVENT_DATE_SENTINEL = new Date(1900, 0, 1)

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

  private normalizeText(value: unknown): string {
    if (typeof value !== 'string') return ''

    return value
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/ÃÁ/g, 'Á')
      .replace(/Ã‰/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã“/g, 'Ó')
      .replace(/Ãš/g, 'Ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã‘/g, 'Ñ')
      .replace(/Â/g, '')
      .replace(/MARAT\s*[\?�]\s*N/gi, 'MARATÓN')
      .replace(/Marat\s*[\?�]\s*n/g, 'Maratón')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private isLowValueDescription(value: string): boolean {
    const normalized = this.normalizeText(value).toLowerCase()
    return normalized.includes('evento cargado') &&
      normalized.includes('fuente visual proporcionada') &&
      normalized.includes('verificar detalles oficiales')
  }

  private sanitizeForClient(value: unknown): unknown {
    const date = this.toDate(value)
    if (date) return date.toISOString()

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeForClient(item))
    }

    if (value && typeof value === 'object') {
      const output: Record<string, unknown> = {}
      for (const [key, rawValue] of Object.entries(value as Record<string, unknown>)) {
        output[key] = this.sanitizeForClient(rawValue)
      }
      return output
    }

    return value
  }

  private toTimestampDate(value: unknown): Date | null {
    if (!value) return null

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value
    }

    if (value instanceof Timestamp) {
      const date = value.toDate()
      return isNaN(date.getTime()) ? null : date
    }

    if (typeof value === 'object') {
      const rawValue = value as {
        toDate?: () => Date
        _seconds?: number
        _nanoseconds?: number
        seconds?: number
        nanoseconds?: number
      }

      if (typeof rawValue.toDate === 'function') {
        const date = rawValue.toDate()
        if (date instanceof Date && !isNaN(date.getTime())) {
          return date
        }
      }

      const seconds = rawValue._seconds ?? rawValue.seconds
      const nanoseconds = rawValue._nanoseconds ?? rawValue.nanoseconds ?? 0

      if (typeof seconds === 'number') {
        const date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000))
        return isNaN(date.getTime()) ? null : date
      }
    }

    return null
  }

  private toDate(value: unknown): Date | null {
    const timestampDate = this.toTimestampDate(value)
    if (timestampDate) return timestampDate

    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value)
      return isNaN(parsed.getTime()) ? null : parsed
    }

    return null
  }

  private toDateOnly(value: unknown): string {
    const date = this.toDate(value)
    return date ? date.toISOString().split('T')[0] : ''
  }

  private toIsoOrNull(value: unknown): string | null {
    const date = this.toDate(value)
    return date ? date.toISOString() : null
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
        const dateA = this.parseEventDate(a.eventDate || '') || INVALID_EVENT_DATE_SENTINEL
        const dateB = this.parseEventDate(b.eventDate || '') || INVALID_EVENT_DATE_SENTINEL
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
        const dateA = this.parseEventDate(a.eventDate || '') || INVALID_EVENT_DATE_SENTINEL
        const dateB = this.parseEventDate(b.eventDate || '') || INVALID_EVENT_DATE_SENTINEL
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
    const sanitizedData = this.sanitizeForClient(data) as Record<string, unknown>

    const eventDate = this.toDateOnly(data.eventDate || data.date)
    const publishDate = this.toDateOnly(data.publishDate) || this.toDateOnly(new Date())
    const registrationDeadline =
      typeof data.registrationDeadline === 'string'
        ? data.registrationDeadline
        : this.toDateOnly(data.registrationDeadline)
    sanitizedData.distancesVerificationAt = this.toIsoOrNull(data.distancesVerificationAt)
    sanitizedData.locationValidatedAt = this.toIsoOrNull(data.locationValidatedAt)
    const title = this.normalizeText(data.title)
    const description = this.normalizeText(data.description)
    const contentHtml = this.normalizeText(data.contentHtml)
    const cleanDescription = this.isLowValueDescription(description) ? '' : description
    const cleanContentHtml = this.isLowValueDescription(contentHtml) ? '' : contentHtml
    const rawSnippet = this.normalizeText(data.snippet)
    const snippet = this.isLowValueDescription(rawSnippet)
      ? ''
      : (rawSnippet || cleanDescription.substring(0, 150) || '')

    return {
      id: doc.id,
      ...sanitizedData,
      title,
      description: cleanDescription,
      snippet,
      contentHtml: cleanContentHtml || cleanDescription,
      municipality: this.normalizeText(data.municipality),
      department: this.normalizeText(data.department),
      publishDate,
      eventDate,
      registrationDeadline,
      createdAt: this.toIsoOrNull(data.createdAt) || new Date().toISOString(),
      updatedAt: this.toIsoOrNull(data.updatedAt) || new Date().toISOString()
    } as EventData
  }
}

export const eventsServiceServer = new EventsServiceServer()