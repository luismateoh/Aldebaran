// Firebase specific types
export interface FirebaseEventData {
  id?: string // Firestore auto-genera IDs
  title: string
  description: string
  eventDate: string
  municipality: string
  department: string
  distance?: string
  price?: string
  registrationUrl?: string
  registrationFee?: string
  organizer?: string
  category?: string
  modality?: string
  status?: 'published' | 'draft' | 'archived' | 'cancelled'
  featured?: boolean
  createdAt?: any // Firestore Timestamp
  updatedAt?: any // Firestore Timestamp
  // Campos opcionales que pueden no existir en datos migrados
  cover?: string
  altitude?: string
  distances?: string[] | Array<{value: string}>
  website?: string
  // Campos adicionales para compatibilidad con el editor
  author?: string
  publishDate?: string
  draft?: boolean
  tags?: string[]
  snippet?: string
  registrationDeadline?: string
  contentHtml?: string
}

export interface FirebaseCommentData {
  id?: string
  eventId: string
  author: string
  email?: string
  content: string
  parentId?: string // Para replies
  likes?: number
  createdAt?: any // Firestore Timestamp
}

export interface FirebaseUserData {
  uid: string
  email: string
  displayName?: string
  role: 'admin' | 'user'
  createdAt?: any // Firestore Timestamp
}

// Mantener compatibilidad con tipos existentes
export type EventData = FirebaseEventData