import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  updateDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { EventLike, UserEventInteraction, UserProfile } from '@/types/user'

const LIKES_COLLECTION = 'event_likes'
const USER_INTERACTIONS_COLLECTION = 'user_interactions'
const USER_PROFILES_COLLECTION = 'user_profiles'
const EVENTS_COLLECTION = 'events'

export class UserInteractionsService {
  private likesRef = collection(db, LIKES_COLLECTION)
  private interactionsRef = collection(db, USER_INTERACTIONS_COLLECTION)
  private profilesRef = collection(db, USER_PROFILES_COLLECTION)

  // ===== LIKES =====
  
  async toggleEventLike(eventId: string, userId: string): Promise<{ liked: boolean, totalLikes: number }> {
    const likeId = `${userId}_${eventId}`
    const likeDocRef = doc(this.likesRef, likeId)
    
    try {
      const likeDoc = await getDoc(likeDocRef)
      const isLiked = likeDoc.exists()
      
      if (isLiked) {
        // Quitar like
        await deleteDoc(likeDocRef)
      } else {
        // Agregar like
        await setDoc(likeDocRef, {
          eventId,
          userId,
          createdAt: serverTimestamp()
        })
      }
      
      // Obtener el nuevo count desde la colección de likes
      const totalLikes = await this.getEventLikesCount(eventId)
      
      return { 
        liked: !isLiked, 
        totalLikes 
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  async getUserLikedEvents(userId: string): Promise<string[]> {
    try {
      const q = query(
        this.likesRef,
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => doc.data().eventId)
    } catch (error) {
      console.error('Error getting user liked events:', error)
      return []
    }
  }

  async isEventLikedByUser(eventId: string, userId: string): Promise<boolean> {
    try {
      const likeId = `${userId}_${eventId}`
      const likeDoc = await getDoc(doc(this.likesRef, likeId))
      return likeDoc.exists()
    } catch (error) {
      console.error('Error checking if event is liked:', error)
      return false
    }
  }

  async getEventLikesCount(eventId: string): Promise<number> {
    try {
      // Contar directamente desde la colección de likes
      const q = query(
        this.likesRef,
        where('eventId', '==', eventId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.length
    } catch (error) {
      console.error('Error getting event likes count:', error)
      return 0
    }
  }

  // ===== USER INTERACTIONS =====
  
  async setUserEventInteraction(userId: string, eventId: string, interaction: Partial<UserEventInteraction>): Promise<void> {
    try {
      const interactionId = `${userId}_${eventId}`
      const interactionRef = doc(this.interactionsRef, interactionId)
      
      const existingDoc = await getDoc(interactionRef)
      const now = new Date()
      
      const data: UserEventInteraction = {
        eventId,
        liked: false,
        attended: false,
        interested: false,
        ...interaction,
        createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
        updatedAt: now
      }
      
      await setDoc(interactionRef, data)
    } catch (error) {
      console.error('Error setting user event interaction:', error)
      throw error
    }
  }

  async getUserEventInteraction(userId: string, eventId: string): Promise<UserEventInteraction | null> {
    try {
      const interactionId = `${userId}_${eventId}`
      const interactionDoc = await getDoc(doc(this.interactionsRef, interactionId))
      
      if (interactionDoc.exists()) {
        return interactionDoc.data() as UserEventInteraction
      }
      
      return null
    } catch (error) {
      console.error('Error getting user event interaction:', error)
      return null
    }
  }

  async getUserInteractions(userId: string): Promise<UserEventInteraction[]> {
    try {
      // Obtener todas las interacciones donde el documento ID contiene el userId
      const snapshot = await getDocs(this.interactionsRef)
      
      const userInteractions = snapshot.docs
        .filter(doc => doc.id.startsWith(`${userId}_`))
        .map(doc => doc.data() as UserEventInteraction)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      
      return userInteractions
    } catch (error) {
      console.error('Error getting user interactions:', error)
      return []
    }
  }

  // ===== USER PROFILE =====
  
  async createOrUpdateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const profileRef = doc(this.profilesRef, userId)
      const existingProfile = await getDoc(profileRef)
      
      const data: UserProfile = {
        uid: userId,
        email: profileData.email || '',
        ...profileData,
        lastLoginAt: new Date(),
        createdAt: existingProfile.exists() ? existingProfile.data().createdAt : new Date()
      }
      
      await setDoc(profileRef, data, { merge: true })
    } catch (error) {
      console.error('Error creating/updating user profile:', error)
      throw error
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profileDoc = await getDoc(doc(this.profilesRef, userId))
      
      if (profileDoc.exists()) {
        return profileDoc.data() as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // ===== STATISTICS =====
  
  async updateUserStats(userId: string): Promise<void> {
    try {
      const [likedEvents, interactions] = await Promise.all([
        this.getUserLikedEvents(userId),
        this.getUserInteractions(userId)
      ])
      
      const attendedEvents = interactions.filter(i => i.attended).length
      const totalComments = 0 // TODO: implementar cuando tengamos referencia a comentarios por usuario
      
      // Calcular categoría favorita basada en eventos con interacción
      const categoryCount: Record<string, number> = {}
      // TODO: obtener categorías de los eventos y calcular la más común
      
      const stats = {
        totalEventsLiked: likedEvents.length,
        totalEventsAttended: attendedEvents,
        totalCommentsPosted: totalComments,
        favoriteCategory: 'Running', // Por defecto
        joinDate: new Date(),
        lastActivity: new Date()
      }
      
      await this.createOrUpdateUserProfile(userId, { stats })
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw error
    }
  }
}

export const userInteractionsService = new UserInteractionsService()