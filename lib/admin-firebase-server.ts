import { getFirestore } from 'firebase-admin/firestore'
import './firebase-admin'

// Types
export interface Administrator {
  id?: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'super_admin' | 'admin'
  addedBy: string
  addedAt: any // Firestore timestamp
  lastLogin?: any // Firestore timestamp
  isActive: boolean
}

export interface SystemSettings {
  id?: string
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  defaultEventCategory: string
  autoApproveProposals: boolean
  requireEventApproval: boolean
  maxEventsPerDay: number
  allowPublicEventCreation: boolean
  enableRateLimiting: boolean
  maxProposalsPerHour: number
  aiEnhancementEnabled: boolean
  lastUpdatedBy: string
  lastUpdatedAt: any // Firestore timestamp
}

// Collections
const ADMINISTRATORS_COLLECTION = 'administrators'
const SETTINGS_COLLECTION = 'systemSettings'
const SETTINGS_DOC_ID = 'main'

class AdminServiceServer {
  private db = getFirestore()

  // Administrator Management
  async getAdministrators(): Promise<Administrator[]> {
    try {
      console.log('🔍 adminServiceServer: Getting all administrators...')
      const administratorsRef = this.db.collection(ADMINISTRATORS_COLLECTION)
      const snapshot = await administratorsRef.get()
      
      const administrators: Administrator[] = []
      snapshot.forEach(doc => {
        administrators.push({
          id: doc.id,
          ...doc.data()
        } as Administrator)
      })
      
      console.log('✅ adminServiceServer: Found', administrators.length, 'administrators')
      return administrators
    } catch (error) {
      console.error('❌ adminServiceServer: Error getting administrators:', error)
      throw new Error('Failed to load administrators')
    }
  }

  async getAdministratorByEmail(email: string): Promise<Administrator | null> {
    try {
      console.log('🔍 adminServiceServer: Getting administrator by email:', email)
      
      // First try direct document lookup (email as ID)
      const directDoc = await this.db.collection(ADMINISTRATORS_COLLECTION).doc(email).get()
      
      if (directDoc.exists) {
        console.log('✅ adminServiceServer: Found admin via direct lookup')
        return {
          id: directDoc.id,
          ...directDoc.data()
        } as Administrator
      }
      
      // Fallback to query by email field
      const administratorsRef = this.db.collection(ADMINISTRATORS_COLLECTION)
      const querySnapshot = await administratorsRef.where('email', '==', email).get()
      
      if (querySnapshot.empty) {
        console.log('❌ adminServiceServer: No administrator found for email:', email)
        return null
      }
      
      const doc = querySnapshot.docs[0]
      console.log('✅ adminServiceServer: Found admin via query lookup')
      return {
        id: doc.id,
        ...doc.data()
      } as Administrator
    } catch (error) {
      console.error('❌ adminServiceServer: Error getting administrator by email:', error)
      throw new Error('Failed to load administrator')
    }
  }

  async addAdministrator(adminData: Omit<Administrator, 'id' | 'addedAt' | 'lastLogin' | 'isActive'>, addedByEmail: string): Promise<string> {
    try {
      // Check if administrator already exists
      const existingAdmin = await this.getAdministratorByEmail(adminData.email)
      if (existingAdmin) {
        throw new Error('Administrator already exists')
      }

      const newAdmin: Omit<Administrator, 'id'> = {
        ...adminData,
        addedAt: new Date(),
        isActive: true,
        addedBy: addedByEmail
      }

      // Use email as document ID
      const adminDocRef = this.db.collection(ADMINISTRATORS_COLLECTION).doc(adminData.email)
      await adminDocRef.set(newAdmin)
      
      return adminData.email
    } catch (error) {
      console.error('❌ adminServiceServer: Error adding administrator:', error)
      throw error
    }
  }

  async removeAdministrator(email: string): Promise<void> {
    try {
      const admin = await this.getAdministratorByEmail(email)
      if (!admin) {
        throw new Error('Administrator not found')
      }

      if (admin.role === 'super_admin') {
        throw new Error('Cannot remove super administrator')
      }

      // Use direct email-based document ID first
      try {
        await this.db.collection(ADMINISTRATORS_COLLECTION).doc(email).delete()
      } catch (error) {
        // Fallback to using the found admin's ID
        if (admin.id) {
          await this.db.collection(ADMINISTRATORS_COLLECTION).doc(admin.id).delete()
        } else {
          throw new Error('Could not determine document ID for deletion')
        }
      }
    } catch (error) {
      console.error('❌ adminServiceServer: Error removing administrator:', error)
      throw error
    }
  }

  async updateAdministratorLastLogin(email: string): Promise<void> {
    try {
      console.log('🔍 adminServiceServer: Updating last login for:', email)
      
      // Try direct document update first
      try {
        await this.db.collection(ADMINISTRATORS_COLLECTION).doc(email).update({
          lastLogin: new Date()
        })
        console.log('✅ adminServiceServer: Updated last login via direct doc')
        return
      } catch (error) {
        console.log('⚠️ adminServiceServer: Direct update failed, trying query method')
      }
      
      // Fallback to finding the document first
      const admin = await this.getAdministratorByEmail(email)
      if (!admin || !admin.id) {
        console.log('⚠️ adminServiceServer: Administrator not found, skipping last login update')
        return // Administrator not found, maybe not added to the system yet
      }

      await this.db.collection(ADMINISTRATORS_COLLECTION).doc(admin.id).update({
        lastLogin: new Date()
      })
      console.log('✅ adminServiceServer: Updated last login via query method')
    } catch (error) {
      console.error('❌ adminServiceServer: Error updating administrator last login:', error)
      // Don't throw error here, login should still work
    }
  }

  async isAdmin(email: string): Promise<boolean> {
    try {
      console.log('🔍 adminServiceServer: Checking admin status for:', email)
      const admin = await this.getAdministratorByEmail(email)
      console.log('🔍 adminServiceServer: Found admin:', admin ? `${admin.email} (${admin.role}, active: ${admin.isActive})` : 'null')
      const result = admin !== null && admin.isActive
      console.log('🔍 adminServiceServer: Final result:', result)
      return result
    } catch (error) {
      console.error('❌ adminServiceServer: Error checking admin status:', error)
      return false
    }
  }

  // System Settings Management
  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const settingsDocRef = this.db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID)
      const settingsSnap = await settingsDocRef.get()
      
      if (!settingsSnap.exists) {
        return null
      }
      
      return {
        id: settingsSnap.id,
        ...settingsSnap.data()
      } as SystemSettings
    } catch (error) {
      console.error('❌ adminServiceServer: Error getting system settings:', error)
      throw new Error('Failed to load system settings')
    }
  }

  async updateSystemSettings(settings: Omit<SystemSettings, 'id' | 'lastUpdatedAt' | 'lastUpdatedBy'>, updatedBy: string): Promise<void> {
    try {
      const settingsDocRef = this.db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID)
      
      const updatedSettings = {
        ...settings,
        lastUpdatedBy: updatedBy,
        lastUpdatedAt: new Date()
      }
      
      await settingsDocRef.set(updatedSettings, { merge: true })
    } catch (error) {
      console.error('❌ adminServiceServer: Error updating system settings:', error)
      throw new Error('Failed to update system settings')
    }
  }

  async ensureInitialization(): Promise<void> {
    try {
      // Check if super admin exists
      const superAdmin = await this.getAdministratorByEmail('luismateohm@gmail.com')
      if (!superAdmin) {
        // Create super admin
        await this.addAdministrator({
          email: 'luismateohm@gmail.com',
          displayName: 'Luis Mateo',
          photoURL: null,
          role: 'super_admin',
          addedBy: 'system'
        }, 'system')
      }

      // Check if system settings exist
      const settings = await this.getSystemSettings()
      if (!settings) {
        // Create default settings
        await this.updateSystemSettings({
          siteName: 'Aldebaran',
          siteDescription: 'Plataforma de eventos de atletismo para Colombia',
          siteUrl: 'https://aldebaran.vercel.app',
          adminEmail: 'luismateohm@gmail.com',
          defaultEventCategory: 'Running',
          autoApproveProposals: false,
          requireEventApproval: true,
          maxEventsPerDay: 10,
          allowPublicEventCreation: true,
          enableRateLimiting: true,
          maxProposalsPerHour: 5,
          aiEnhancementEnabled: true
        }, 'system')
      }
    } catch (error) {
      console.error('❌ adminServiceServer: Error during initialization:', error)
      throw error
    }
  }
}

// Export singleton instance
export const adminServiceServer = new AdminServiceServer()