import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { FirebaseCommentData } from '../types'

const COMMENTS_COLLECTION = 'comments'

export class CommentsService {
  private commentsRef = collection(db, COMMENTS_COLLECTION)

  async getCommentsByEventId(eventId: string, includeHidden = false): Promise<FirebaseCommentData[]> {
    try {
      const q = query(
        this.commentsRef,
        where('eventId', '==', eventId),
        orderBy('createdAt', 'asc')
      )
      const snapshot = await getDocs(q)
      
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
      const docRef = await addDoc(this.commentsRef, {
        ...commentData,
        likes: 0,
        createdAt: serverTimestamp()
      })
      
      const newDoc = await getDoc(docRef)
      return this.transformFirestoreDoc(newDoc)
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  async updateComment(id: string, updates: Partial<FirebaseCommentData>): Promise<FirebaseCommentData | null> {
    try {
      const docRef = doc(db, COMMENTS_COLLECTION, id)
      await updateDoc(docRef, updates)
      
      const updatedDoc = await getDoc(docRef)
      return updatedDoc.exists() ? this.transformFirestoreDoc(updatedDoc) : null
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COMMENTS_COLLECTION, id)
      await deleteDoc(docRef)
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  // Listener en tiempo real para comentarios
  subscribeToComments(eventId: string, callback: (comments: FirebaseCommentData[]) => void, includeHidden = false): () => void {
    const q = query(
      this.commentsRef,
      where('eventId', '==', eventId),
      orderBy('createdAt', 'asc')
    )
    
    return onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      // Filtrar comentarios ocultos si no se especifica incluirlos
      const filteredComments = includeHidden 
        ? allComments 
        : allComments.filter(comment => !comment.hidden)
      
      callback(filteredComments)
    })
  }

  private transformFirestoreDoc(doc: any): FirebaseCommentData {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
    }
  }
}

export const commentsService = new CommentsService()