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
  serverTimestamp,
  setDoc
} from 'firebase/firestore'
import { db } from './firebase'

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

class AdminService {
  // Administrators Management
  async getAdministrators(): Promise<Administrator[]> {
    try {
      const administratorsRef = collection(db, ADMINISTRATORS_COLLECTION)
      const querySnapshot = await getDocs(administratorsRef)
      
      const administrators: Administrator[] = []
      querySnapshot.forEach((doc) => {
        administrators.push({
          id: doc.id,
          ...doc.data()
        } as Administrator)
      })
      
      return administrators.sort((a, b) => {
        // Super admins first
        if (a.role === 'super_admin' && b.role !== 'super_admin') return -1
        if (b.role === 'super_admin' && a.role !== 'super_admin') return 1
        // Then by email
        return a.email.localeCompare(b.email)
      })
    } catch (error) {
      console.error('Error getting administrators:', error)
      throw new Error('Failed to load administrators')
    }
  }

  async getAdministratorByEmail(email: string): Promise<Administrator | null> {
    try {
      const administratorsRef = collection(db, ADMINISTRATORS_COLLECTION)
      const q = query(administratorsRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }
      
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as Administrator
    } catch (error) {
      console.error('Error getting administrator by email:', error)
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

      const administratorsRef = collection(db, ADMINISTRATORS_COLLECTION)
      const newAdmin: Omit<Administrator, 'id'> = {
        ...adminData,
        addedAt: serverTimestamp(),
        isActive: true,
        addedBy: addedByEmail
      }

      const docRef = await addDoc(administratorsRef, newAdmin)
      return docRef.id
    } catch (error) {
      console.error('Error adding administrator:', error)
      throw error
    }
  }

  async removeAdministrator(email: string): Promise<void> {
    try {
      const admin = await this.getAdministratorByEmail(email)
      if (!admin || !admin.id) {
        throw new Error('Administrator not found')
      }

      if (admin.role === 'super_admin') {
        throw new Error('Cannot remove super administrator')
      }

      const adminDocRef = doc(db, ADMINISTRATORS_COLLECTION, admin.id)
      await deleteDoc(adminDocRef)
    } catch (error) {
      console.error('Error removing administrator:', error)
      throw error
    }
  }

  async updateAdministratorLastLogin(email: string): Promise<void> {
    try {
      const admin = await this.getAdministratorByEmail(email)
      if (!admin || !admin.id) {
        return // Administrator not found, maybe not added to the system yet
      }

      const adminDocRef = doc(db, ADMINISTRATORS_COLLECTION, admin.id)
      await updateDoc(adminDocRef, {
        lastLogin: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating administrator last login:', error)
      // Don't throw error here, login should still work
    }
  }

  async isAdmin(email: string): Promise<boolean> {
    try {
      console.log('🔍 adminService.isAdmin: Checking admin status for:', email)
      const admin = await this.getAdministratorByEmail(email)
      console.log('🔍 adminService.isAdmin: Found admin:', admin ? `${admin.email} (${admin.role}, active: ${admin.isActive})` : 'null')
      const result = admin !== null && admin.isActive
      console.log('🔍 adminService.isAdmin: Final result:', result)
      return result
    } catch (error) {
      console.error('❌ adminService.isAdmin: Error checking admin status:', error)
      return false
    }
  }

  // System Settings Management
  async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID)
      const settingsSnap = await getDoc(settingsDocRef)
      
      if (!settingsSnap.exists()) {
        return null
      }
      
      return {
        id: settingsSnap.id,
        ...settingsSnap.data()
      } as SystemSettings
    } catch (error) {
      console.error('Error getting system settings:', error)
      throw new Error('Failed to load system settings')
    }
  }

  async saveSystemSettings(settings: Omit<SystemSettings, 'id' | 'lastUpdatedAt' | 'lastUpdatedBy'>, updatedByEmail: string): Promise<void> {
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID)
      const settingsData: Omit<SystemSettings, 'id'> = {
        ...settings,
        lastUpdatedBy: updatedByEmail,
        lastUpdatedAt: serverTimestamp()
      }

      await setDoc(settingsDocRef, settingsData, { merge: true })
    } catch (error) {
      console.error('Error saving system settings:', error)
      throw error
    }
  }

  async getDefaultSystemSettings(): Promise<Omit<SystemSettings, 'id' | 'lastUpdatedBy' | 'lastUpdatedAt'>> {
    return {
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
    }
  }

  // Initialize System (call this once to set up default admin and settings)
  async initializeSystem(): Promise<void> {
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
        const defaultSettings = await this.getDefaultSystemSettings()
        await this.saveSystemSettings(defaultSettings, 'system')
      }
    } catch (error) {
      console.error('Error initializing system:', error)
      throw error
    }
  }
}

export const adminService = new AdminService()