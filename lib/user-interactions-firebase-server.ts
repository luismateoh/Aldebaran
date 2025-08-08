import { adminDb } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const LIKES_COLLECTION = 'event_likes'
const USER_INTERACTIONS_COLLECTION = 'user_interactions'
const USER_PROFILES_COLLECTION = 'user_profiles'
const USER_GOALS_COLLECTION = 'user_goals'

export class UserInteractionsServiceServer {
  private likesRef = adminDb.collection(LIKES_COLLECTION)
  private interactionsRef = adminDb.collection(USER_INTERACTIONS_COLLECTION)
  private profilesRef = adminDb.collection(USER_PROFILES_COLLECTION)
  private goalsRef = adminDb.collection(USER_GOALS_COLLECTION)
  
  // Rate limiting en memoria (en producción usar Redis o similar)
  private rateLimitMap = new Map<string, { count: number, resetTime: number }>()
  private readonly RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto
  private readonly MAX_LIKES_PER_MINUTE = 10 // máximo 10 likes por minuto

  // ===== LIKES =====
  
  // Rate limiting helper
  private checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const userKey = `like_${userId}`
    const userLimit = this.rateLimitMap.get(userKey)
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset o primera vez
      this.rateLimitMap.set(userKey, { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW })
      return true
    }
    
    if (userLimit.count >= this.MAX_LIKES_PER_MINUTE) {
      return false
    }
    
    userLimit.count++
    return true
  }

  async toggleEventLike(eventId: string, userId: string): Promise<{ liked: boolean, totalLikes: number }> {
    // Validaciones de seguridad
    if (!eventId || !userId) {
      throw new Error('Invalid parameters')
    }
    
    if (eventId.length > 200 || userId.length > 128) {
      throw new Error('Parameter too long')
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(eventId)) {
      throw new Error('Invalid event ID format')
    }
    
    // Rate limiting
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded')
    }
    
    const likeId = `${userId}_${eventId}`
    const likeDocRef = this.likesRef.doc(likeId)
    
    try {
      const likeDoc = await likeDocRef.get()
      const isLiked = likeDoc.exists
      
      if (isLiked) {
        // Quitar like
        await likeDocRef.delete()
      } else {
        // Agregar like
        await likeDocRef.set({
          eventId,
          userId,
          createdAt: FieldValue.serverTimestamp()
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
      const snapshot = await this.likesRef
        .where('userId', '==', userId)
        .get()
      
      return snapshot.docs.map(doc => doc.data().eventId)
    } catch (error) {
      console.error('Error getting user liked events:', error)
      return []
    }
  }

  async isEventLikedByUser(eventId: string, userId: string): Promise<boolean> {
    try {
      const likeId = `${userId}_${eventId}`
      const likeDoc = await this.likesRef.doc(likeId).get()
      return likeDoc.exists
    } catch (error) {
      console.error('Error checking if event is liked:', error)
      return false
    }
  }

  async getEventLikesCount(eventId: string): Promise<number> {
    try {
      const snapshot = await this.likesRef
        .where('eventId', '==', eventId)
        .get()
      return snapshot.docs.length
    } catch (error) {
      console.error('Error getting event likes count:', error)
      return 0
    }
  }

  // ===== USER INTERACTIONS =====
  
  async setUserEventInteraction(userId: string, eventId: string, interaction: any): Promise<void> {
    try {
      const interactionId = `${userId}_${eventId}`
      const interactionRef = this.interactionsRef.doc(interactionId)
      
      const existingDoc = await interactionRef.get()
      const now = new Date()
      
      const data = {
        eventId,
        liked: false,
        attended: false,
        interested: false,
        ...interaction,
        createdAt: existingDoc.exists ? existingDoc.data()?.createdAt : now,
        updatedAt: now
      }
      
      await interactionRef.set(data)
    } catch (error) {
      console.error('Error setting user event interaction:', error)
      throw error
    }
  }

  async getUserEventInteraction(userId: string, eventId: string): Promise<any | null> {
    try {
      const interactionId = `${userId}_${eventId}`
      const interactionDoc = await this.interactionsRef.doc(interactionId).get()
      
      if (interactionDoc.exists) {
        return interactionDoc.data()
      }
      
      return null
    } catch (error) {
      console.error('Error getting user event interaction:', error)
      return null
    }
  }

  async getUserInteractions(userId: string): Promise<any[]> {
    try {
      // Obtener todas las interacciones para este usuario
      const snapshot = await this.interactionsRef
        .where('userId', '==', userId)
        .orderBy('updatedAt', 'desc')
        .get()
      
      return snapshot.docs.map(doc => doc.data())
    } catch (error) {
      console.error('Error getting user interactions:', error)
      return []
    }
  }

  // ===== USER PROFILE =====
  
  async createOrUpdateUserProfile(userId: string, profileData: any): Promise<void> {
    try {
      const profileRef = this.profilesRef.doc(userId)
      const existingProfile = await profileRef.get()
      
      const data = {
        uid: userId,
        email: profileData.email || '',
        ...profileData,
        lastLoginAt: new Date(),
        createdAt: existingProfile.exists ? existingProfile.data()?.createdAt : new Date()
      }
      
      await profileRef.set(data, { merge: true })
    } catch (error) {
      console.error('Error creating/updating user profile:', error)
      throw error
    }
  }

  async getUserProfile(userId: string): Promise<any | null> {
    try {
      const profileDoc = await this.profilesRef.doc(userId).get()
      
      if (profileDoc.exists) {
        return profileDoc.data()
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // ===== USER GOALS =====
  
  async getUserGoals(userId: string): Promise<any[]> {
    try {
      // Validaciones de seguridad
      if (!userId || userId.length > 128) {
        throw new Error('Invalid user ID')
      }

      const snapshot = await this.goalsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting user goals:', error)
      return []
    }
  }

  async createUserGoal(userId: string, goalData: any): Promise<any> {
    try {
      // Validaciones de seguridad
      if (!userId || userId.length > 128) {
        throw new Error('Invalid user ID')
      }

      if (!goalData.title || !goalData.description) {
        throw new Error('Title and description are required')
      }

      const docRef = await this.goalsRef.add({
        ...goalData,
        userId,
        createdAt: FieldValue.serverTimestamp()
      })
      
      const newDoc = await docRef.get()
      return {
        id: newDoc.id,
        ...newDoc.data()
      }
    } catch (error) {
      console.error('Error creating user goal:', error)
      throw error
    }
  }

  async updateUserGoal(userId: string, goalId: string, updates: any): Promise<any | null> {
    try {
      // Validaciones de seguridad
      if (!userId || userId.length > 128 || !goalId || goalId.length > 100) {
        throw new Error('Invalid parameters')
      }

      const goalRef = this.goalsRef.doc(goalId)
      const goal = await goalRef.get()
      
      if (!goal.exists || goal.data()?.userId !== userId) {
        return null
      }

      await goalRef.update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      })
      
      const updatedGoal = await goalRef.get()
      return {
        id: updatedGoal.id,
        ...updatedGoal.data()
      }
    } catch (error) {
      console.error('Error updating user goal:', error)
      throw error
    }
  }

  async deleteUserGoal(userId: string, goalId: string): Promise<boolean> {
    try {
      // Validaciones de seguridad
      if (!userId || userId.length > 128 || !goalId || goalId.length > 100) {
        throw new Error('Invalid parameters')
      }

      const goalRef = this.goalsRef.doc(goalId)
      const goal = await goalRef.get()
      
      if (!goal.exists || goal.data()?.userId !== userId) {
        return false
      }

      await goalRef.delete()
      return true
    } catch (error) {
      console.error('Error deleting user goal:', error)
      return false
    }
  }
}

export const userInteractionsServiceServer = new UserInteractionsServiceServer()