import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import './firebase-admin'

const PROPOSALS_COLLECTION = 'proposals'

export interface ProposalData {
  id?: string
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  website?: string
  description: string
  distances: string[]
  registrationFee?: string
  category: string
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  submitterEmail?: string
  userAgent?: string
  ipAddress?: string
  createdAt?: any
  updatedAt?: any
  reviewedBy?: string
  reviewedAt?: any
  rejectionReason?: string
}

class ProposalsServiceAdmin {
  private db: ReturnType<typeof getFirestore>
  private proposalsRef: ReturnType<typeof getFirestore>['collection']

  constructor() {
    this.db = getFirestore()
    this.proposalsRef = this.db.collection(PROPOSALS_COLLECTION)
  }

  private transformFirestoreDoc(doc: any): ProposalData {
    const data = doc.data()
    
    // Manejar fecha del evento
    let eventDate = ''
    const rawDate = data.eventDate || data.date
    if (rawDate) {
      if (rawDate.toDate && typeof rawDate.toDate === 'function') {
        eventDate = rawDate.toDate().toISOString().split('T')[0]
      } else if (typeof rawDate === 'string' && rawDate.trim()) {
        const parsedDate = new Date(rawDate)
        if (!isNaN(parsedDate.getTime())) {
          eventDate = parsedDate.toISOString().split('T')[0]
        }
      }
    }
    
    return {
      id: doc.id,
      title: data.title || '',
      eventDate: eventDate,
      municipality: data.municipality || '',
      department: data.department || '',
      organizer: data.organizer || '',
      website: data.website || '',
      description: data.description || '',
      distances: Array.isArray(data.distances) ? data.distances : [],
      registrationFee: data.registrationFee || data.registrationFeed || '',
      category: data.category || 'Running',
      status: data.status || 'pending',
      submittedBy: data.submittedBy || 'Anónimo',
      submitterEmail: data.submitterEmail || '',
      userAgent: data.userAgent || '',
      ipAddress: data.ipAddress || '',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      reviewedBy: data.reviewedBy || '',
      reviewedAt: data.reviewedAt?.toDate?.()?.toISOString() || null,
      rejectionReason: data.rejectionReason || ''
    }
  }

  // Obtener todas las propuestas
  async getAllProposals(): Promise<ProposalData[]> {
    try {
      console.log('🔍 Obteniendo propuestas desde Firebase Admin...')
      
      const snapshot = await this.proposalsRef.orderBy('createdAt', 'desc').get()
      console.log(`📊 Encontradas ${snapshot.size} propuestas en Firebase`)
      
      const proposals: ProposalData[] = []
      snapshot.forEach(doc => {
        const proposalData = this.transformFirestoreDoc(doc)
        proposals.push(proposalData)
      })
      
      return proposals
    } catch (error) {
      console.error('❌ Error fetching proposals with Admin SDK:', error)
      throw error
    }
  }

  // Obtener propuesta por ID
  async getProposalById(id: string): Promise<ProposalData | null> {
    try {
      console.log(`🔍 Obteniendo propuesta con ID: ${id}`)
      
      const docRef = this.proposalsRef.doc(id)
      const docSnap = await docRef.get()
      
      if (!docSnap.exists) {
        console.log(`❌ Propuesta con ID ${id} no encontrada`)
        return null
      }
      
      const proposalData = this.transformFirestoreDoc(docSnap)
      console.log(`✅ Propuesta encontrada: ${proposalData.title}`)
      
      return proposalData
    } catch (error) {
      console.error(`❌ Error obteniendo propuesta ${id}:`, error)
      throw error
    }
  }

  // Crear nueva propuesta (desde formulario público)
  async createProposal(proposalData: Omit<ProposalData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProposalData> {
    try {
      console.log(`📝 Creando nueva propuesta: ${proposalData.title}`)
      
      const docRef = await this.proposalsRef.add({
        ...proposalData,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
      
      const newDoc = await docRef.get()
      const newProposal = this.transformFirestoreDoc(newDoc)
      
      console.log(`✅ Propuesta creada con ID: ${newProposal.id}`)
      return newProposal
    } catch (error) {
      console.error('❌ Error creating proposal with Admin SDK:', error)
      throw error
    }
  }

  // Actualizar estado de propuesta
  async updateProposalStatus(
    id: string, 
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<ProposalData | null> {
    try {
      console.log(`📝 Actualizando estado de propuesta ${id} a ${status}`)
      
      const docRef = this.proposalsRef.doc(id)
      
      // Verificar que existe
      const docSnap = await docRef.get()
      if (!docSnap.exists) {
        console.log(`❌ Propuesta con ID ${id} no encontrada`)
        return null
      }
      
      // Actualizar documento
      const updateData: any = {
        status,
        reviewedBy,
        reviewedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }
      
      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason
      }
      
      await docRef.update(updateData)
      
      console.log(`✅ Propuesta ${id} actualizada a estado ${status}`)
      
      // Obtener documento actualizado
      const updatedDoc = await docRef.get()
      return this.transformFirestoreDoc(updatedDoc)
    } catch (error) {
      console.error('❌ Error updating proposal status with Admin SDK:', error)
      throw error
    }
  }

  // Eliminar propuesta
  async deleteProposal(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Eliminando propuesta ${id}`)
      
      const docRef = this.proposalsRef.doc(id)
      await docRef.delete()
      
      console.log(`✅ Propuesta ${id} eliminada exitosamente`)
      return true
    } catch (error) {
      console.error('❌ Error deleting proposal with Admin SDK:', error)
      return false
    }
  }

  // Obtener estadísticas de propuestas
  async getProposalStats() {
    try {
      const snapshot = await this.proposalsRef.get()
      const proposals = snapshot.docs.map(doc => this.transformFirestoreDoc(doc))
      
      return {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'pending').length,
        approved: proposals.filter(p => p.status === 'approved').length,
        rejected: proposals.filter(p => p.status === 'rejected').length
      }
    } catch (error) {
      console.error('❌ Error getting proposal stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const proposalsServiceAdmin = new ProposalsServiceAdmin()