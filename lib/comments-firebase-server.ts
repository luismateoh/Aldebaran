import { adminDb } from './firebase-admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { FirebaseCommentData } from '../types'

const COMMENTS_COLLECTION = 'comments'

export class CommentsServiceServer {
  private commentsRef = adminDb.collection(COMMENTS_COLLECTION)

  async getCommentsByEventId(eventId: string, includeHidden = false): Promise<FirebaseCommentData[]> {
    try {
      // Validaciones de seguridad
      if (!eventId || eventId.length > 200) {
        throw new Error('Invalid event ID')
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(eventId)) {
        throw new Error('Invalid event ID format')
      }

      const snapshot = await this.commentsRef
        .where('eventId', '==', eventId)
        .orderBy('createdAt', 'asc')
        .get()
      
      const allComments = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      // Filtrar comentarios ocultos si no se especifica incluirlos
      if (!includeHidden) {
        return allComments.filter(comment => !comment.hidden)
      }
      
      return allComments
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  async createComment(commentData: Omit<FirebaseCommentData, 'id' | 'createdAt'>): Promise<FirebaseCommentData> {
    try {
      // Validaciones de seguridad
      if (!commentData.eventId || !commentData.author || !commentData.content) {
        throw new Error('Missing required fields')
      }

      if (commentData.eventId.length > 200 || commentData.author.length > 100) {
        throw new Error('Field too long')
      }

      if (commentData.content.length > 2000) {
        throw new Error('Comment too long')
      }

      // Sanitizar contenido básico (prevenir XSS básico)
      const sanitizedContent = commentData.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '') // Remover HTML tags

      const docRef = await this.commentsRef.add({
        ...commentData,
        content: sanitizedContent,
        likes: 0,
        hidden: false, // Por defecto visible
        createdAt: FieldValue.serverTimestamp()
      })
      
      const newDoc = await docRef.get()
      return this.transformFirestoreDoc(newDoc)
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  async updateComment(id: string, updates: Partial<FirebaseCommentData>): Promise<FirebaseCommentData | null> {
    try {
      // Validaciones de seguridad
      if (!id || id.length > 100) {
        throw new Error('Invalid comment ID')
      }

      if (!/^[a-zA-Z0-9]+$/.test(id)) {
        throw new Error('Invalid comment ID format')
      }

      // Validar campos permitidos para actualización
      const allowedFields = ['content', 'hidden']
      const filteredUpdates: any = {}
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          if (key === 'content' && typeof value === 'string') {
            if (value.length > 2000) {
              throw new Error('Comment too long')
            }
            // Sanitizar contenido
            filteredUpdates[key] = value
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<[^>]*>/g, '')
          } else if (key === 'hidden' && typeof value === 'boolean') {
            filteredUpdates[key] = value
          }
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid updates provided')
      }

      const docRef = this.commentsRef.doc(id)
      await docRef.update(filteredUpdates)
      
      const updatedDoc = await docRef.get()
      return updatedDoc.exists ? this.transformFirestoreDoc(updatedDoc) : null
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      // Validaciones de seguridad
      if (!id || id.length > 100) {
        throw new Error('Invalid comment ID')
      }

      if (!/^[a-zA-Z0-9]+$/.test(id)) {
        throw new Error('Invalid comment ID format')
      }

      const docRef = this.commentsRef.doc(id)
      
      // Verificar que el comentario existe antes de intentar eliminarlo
      const doc = await docRef.get()
      if (!doc.exists) {
        return false
      }

      await docRef.delete()
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  async getCommentById(id: string): Promise<FirebaseCommentData | null> {
    try {
      // Validaciones de seguridad
      if (!id || id.length > 100) {
        throw new Error('Invalid comment ID')
      }

      if (!/^[a-zA-Z0-9]+$/.test(id)) {
        throw new Error('Invalid comment ID format')
      }

      const doc = await this.commentsRef.doc(id).get()
      return doc.exists ? this.transformFirestoreDoc(doc) : null
    } catch (error) {
      console.error('Error getting comment:', error)
      return null
    }
  }

  private transformFirestoreDoc(doc: any): FirebaseCommentData {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : 
                 data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : 
                 new Date()
    }
  }
}

export const commentsServiceServer = new CommentsServiceServer()