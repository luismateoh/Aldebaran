import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

// En desarrollo, usar variables de entorno mock
// En producción, Vercel configura automáticamente POSTGRES_URL
const isProd = process.env.NODE_ENV === 'production'

export const db = isProd 
  ? drizzle(sql, { schema })
  : createMockDb()

// Mock DB para desarrollo
function createMockDb() {
  console.log('🔧 Usando mock database para desarrollo')
  
  // Mock simple que devuelve datos de ejemplo
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([]),
        limit: () => Promise.resolve([]),
        orderBy: () => Promise.resolve([])
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: 1 }])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([])
        })
      })
    }),
    delete: () => ({
      where: () => Promise.resolve([])
    })
  }
  
  return mockDb as any
}

// Funciones de utilidad para eventos
export const eventQueries = {
  async getAllEvents() {
    if (!isProd) {
      // En desarrollo, continuar usando archivos MD
      return null // Fallback a sistema actual
    }
    
    try {
      return await db.select().from(schema.events)
        .where(schema.events.draft.eq(false))
        .orderBy(schema.events.eventDate)
    } catch (error) {
      console.error('Error fetching events from DB:', error)
      return null // Fallback a sistema actual
    }
  },

  async getEventById(eventId: string) {
    if (!isProd) return null
    
    try {
      const result = await db.select().from(schema.events)
        .where(schema.events.eventId.eq(eventId))
        .limit(1)
      return result[0] || null
    } catch (error) {
      console.error('Error fetching event by ID:', error)
      return null
    }
  },

  async createEvent(eventData: schema.NewEvent) {
    if (!isProd) {
      console.log('🔧 Mock: Event would be created in production')
      return { id: Date.now(), eventId: eventData.eventId }
    }
    
    try {
      const result = await db.insert(schema.events)
        .values(eventData)
        .returning()
      return result[0]
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  async incrementViews(eventId: string) {
    if (!isProd) return 1
    
    try {
      await db.update(schema.events)
        .set({ views: sql`${schema.events.views} + 1` })
        .where(schema.events.eventId.eq(eventId))
      return 1
    } catch (error) {
      console.error('Error incrementing views:', error)
      return 0
    }
  }
}

// Funciones de utilidad para comentarios
export const commentQueries = {
  async getCommentsByEventId(eventId: string) {
    if (!isProd) return [] // Fallback a sistema actual
    
    try {
      return await db.select().from(schema.comments)
        .where(schema.comments.eventId.eq(eventId))
        .orderBy(schema.comments.createdAt)
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  },

  async createComment(commentData: schema.NewComment) {
    if (!isProd) {
      console.log('🔧 Mock: Comment would be created in production')
      return { id: Date.now(), ...commentData }
    }
    
    try {
      const result = await db.insert(schema.comments)
        .values(commentData)
        .returning()
      
      // Incrementar contador de comentarios en el evento
      await db.update(schema.events)
        .set({ commentsCount: sql`${schema.events.commentsCount} + 1` })
        .where(schema.events.eventId.eq(commentData.eventId))
      
      return result[0]
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }
}

// Funciones para propuestas
export const proposalQueries = {
  async createProposal(proposalData: schema.NewEventProposal) {
    if (!isProd) {
      console.log('🔧 Mock: Proposal would be created in production')
      return { id: Date.now(), ...proposalData }
    }
    
    try {
      const result = await db.insert(schema.eventProposals)
        .values(proposalData)
        .returning()
      return result[0]
    } catch (error) {
      console.error('Error creating proposal:', error)
      throw error
    }
  },

  async getPendingProposals() {
    if (!isProd) return []
    
    try {
      return await db.select().from(schema.eventProposals)
        .where(schema.eventProposals.status.eq('pending'))
        .orderBy(schema.eventProposals.submittedAt)
    } catch (error) {
      console.error('Error fetching proposals:', error)
      return []
    }
  }
}