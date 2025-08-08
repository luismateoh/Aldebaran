import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { FirebaseEventData, EventData } from '../types'

const EVENTS_COLLECTION = 'events'

export class EventsService {
  private eventsRef = collection(db, EVENTS_COLLECTION)

  async getAllEvents(): Promise<EventData[]> {
    try {
      console.log('🔍 Obteniendo eventos desde Firebase...')
      
      // Obtener todos los eventos
      const snapshot = await getDocs(this.eventsRef)
      
      console.log(`📊 Encontrados ${snapshot.docs.length} eventos en Firebase`)
      
      const events = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      // Filtrar solo eventos futuros Y publicados (no borradores)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Establecer a inicio del día para incluir eventos de hoy
      
      const futureEvents = events.filter(event => {
        if (!event.eventDate) return false
        const eventDate = new Date(event.eventDate)
        // Excluir eventos en borrador y solo mostrar eventos futuros
        return eventDate >= today && !event.draft
      })
      
      // Ordenar por fecha ascendente (próximos primero)
      const sortedEvents = futureEvents.sort((a, b) => {
        const dateA = new Date(a.eventDate || '2024-01-01')
        const dateB = new Date(b.eventDate || '2024-01-01')
        return dateA.getTime() - dateB.getTime()
      })
      
      console.log(`✅ ${futureEvents.length} eventos futuros encontrados y ordenados`)
      return sortedEvents
    } catch (error) {
      console.error('❌ Error fetching events:', error)
      throw error
    }
  }

  // Obtener un evento específico por ID
  async getEventById(id: string): Promise<EventData> {
    try {
      console.log(`🔍 Obteniendo evento con ID: ${id}`)
      
      const docRef = doc(this.eventsRef, id)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        throw new Error(`Evento con ID ${id} no encontrado`)
      }
      
      const eventData = this.transformFirestoreDoc(docSnap)
      console.log(`✅ Evento encontrado: ${eventData.title}`)
      
      return eventData
    } catch (error) {
      console.error(`❌ Error obteniendo evento ${id}:`, error)
      throw error
    }
  }

  async createEvent(eventData: Omit<EventData, 'id'>): Promise<EventData> {
    try {
      const docRef = await addDoc(this.eventsRef, {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: eventData.status || 'published'
      })
      
      const newDoc = await getDoc(docRef)
      return this.transformFirestoreDoc(newDoc)
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async updateEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      const updatedDoc = await getDoc(docRef)
      return updatedDoc.exists() ? this.transformFirestoreDoc(updatedDoc) : null
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      return false
    }
  }

  async searchEvents(searchTerm: string): Promise<EventData[]> {
    try {
      // Firestore no tiene full-text search nativo, usaremos array-contains para tags
      const q = query(
        this.eventsRef,
        where('status', '==', 'published'),
        orderBy('eventDate', 'desc')
      )
      const snapshot = await getDocs(q)
      
      // Filtrar en el cliente por ahora (en producción usar Algolia o similar)
      return snapshot.docs
        .map(doc => this.transformFirestoreDoc(doc))
        .filter(event => 
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    } catch (error) {
      console.error('Error searching events:', error)
      throw error
    }
  }

  // Listener en tiempo real
  subscribeToEvents(callback: (events: EventData[]) => void): () => void {
    console.log('🔔 Iniciando listener de eventos en tiempo real...')
    
    return onSnapshot(this.eventsRef, (snapshot) => {
      console.log(`📡 Listener activado: ${snapshot.docs.length} eventos`)
      
      const events = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      // Filtrar solo eventos futuros Y publicados (no borradores)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const futureEvents = events.filter(event => {
        if (!event.eventDate) return false
        const eventDate = new Date(event.eventDate)
        // Excluir eventos en borrador y solo mostrar eventos futuros
        return eventDate >= today && !event.draft
      })
      
      // Ordenar por fecha ascendente (próximos primero)
      const sortedEvents = futureEvents.sort((a, b) => {
        const dateA = new Date(a.eventDate || '2024-01-01')
        const dateB = new Date(b.eventDate || '2024-01-01')
        return dateA.getTime() - dateB.getTime()
      })
      
      callback(sortedEvents)
    }, (error) => {
      console.error('❌ Error en listener de Firebase:', error)
    })
  }

  private transformFirestoreDoc(doc: any): EventData {
    const data = doc.data()
    
    // Manejar fecha del evento de manera más robusta
    let eventDate = ''
    const rawDate = data.eventDate || data.date
    if (rawDate) {
      // Si es un Timestamp de Firestore
      if (rawDate instanceof Timestamp) {
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

    return {
      id: doc.id,
      title: data.title || '',
      author: data.author || 'Luis Hincapie',
      publishDate: data.publishDate || new Date().toISOString().split('T')[0],
      draft: data.draft || data.status === 'draft',
      category: data.category || 'Running',
      tags: data.tags || [data.category?.toLowerCase() || 'running'],
      snippet: data.snippet || data.description?.substring(0, 150) || '',
      altitude: data.altitude || '1000m',
      eventDate: eventDate,
      organizer: data.organizer || '',
      registrationDeadline: data.registrationDeadline || '',
      registrationFeed: data.registrationFeed || data.registrationFee || data.price || '',
      website: data.website || '',
      distances: data.distances || [],
      cover: data.cover || '',
      department: data.department || '',
      municipality: data.municipality || '',
      contentHtml: data.description || data.contentHtml || '',
      status: data.status || 'published',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString())
    }
  }
}

export const eventsService = new EventsService()

// Mantener compatibilidad con funciones existentes
export const getAllEvents = () => eventsService.getAllEvents()
export const getEventById = (id: string) => eventsService.getEventById(id)
export const createEvent = (eventData: Omit<EventData, 'id'>) => eventsService.createEvent(eventData)
export const updateEvent = (id: string, updates: Partial<EventData>) => eventsService.updateEvent(id, updates)
export const deleteEvent = (id: string) => eventsService.deleteEvent(id)

// Aliases para compatibilidad
export const getSortedEventsData = getAllEvents
export const getEventData = getEventById