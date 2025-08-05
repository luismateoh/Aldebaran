import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import { eq, desc } from 'drizzle-orm'
// Import the actual schema instead of redefining it
import { comments, eventProposals } from './db/schema'

// Database connection
export const db = drizzle(sql)

// Comment queries
export const commentQueries = {
  async getCommentsByEventId(eventId: string) {
    try {
      return await db.select().from(comments).where(eq(comments.eventId, eventId)).orderBy(desc(comments.createdAt))
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  },

  async createComment(data: {
    eventId: string
    author: string
    content: string
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      const result = await db.insert(comments).values(data).returning()
      return result[0]
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  },

  async deleteComment(id: number) {
    try {
      await db.delete(comments).where(eq(comments.id, id))
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }
}

// Proposal queries (now using the correct eventProposals table)
export const proposalQueries = {
  async getPendingProposals() {
    try {
      return await db.select().from(eventProposals).where(eq(eventProposals.status, 'pending')).orderBy(desc(eventProposals.submittedAt))
    } catch (error) {
      console.error('Error fetching proposals:', error)
      return []
    }
  },

  async getAllProposals() {
    try {
      return await db.select().from(eventProposals).orderBy(desc(eventProposals.submittedAt))
    } catch (error) {
      console.error('Error fetching all proposals:', error)
      return []
    }
  },

  async createProposal(data: {
    title: string
    eventDate: Date
    municipality: string
    department: string
    organizer?: string
    website?: string
    description?: string
    category?: string
    registrationFee?: string
    distances?: string[]
    submittedBy?: string
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      const result = await db.insert(eventProposals).values(data).returning()
      return result[0]
    } catch (error) {
      console.error('Error creating proposal:', error)
      throw error
    }
  },

  async updateProposalStatus(id: number, status: string) {
    try {
      const result = await db.update(eventProposals)
        .set({ status, reviewedAt: new Date() })
        .where(eq(eventProposals.id, id))
        .returning()
      return result[0]
    } catch (error) {
      console.error('Error updating proposal status:', error)
      throw error
    }
  }
}