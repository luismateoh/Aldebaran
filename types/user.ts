// Tipos relacionados con usuarios y sus interacciones

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt?: Date
  lastLoginAt?: Date
  
  // Perfil de corredor
  runnerProfile?: RunnerProfile
  
  // Preferencias
  preferences?: UserPreferences
  
  // Estadísticas
  stats?: UserStats
}

export interface RunnerProfile {
  level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  favoriteDistances: string[]
  favoriteCategories: string[]
  personalBests?: PersonalBest[]
  goals?: Goal[]
  bio?: string
}

export interface PersonalBest {
  distance: string
  time: string
  eventName?: string
  date?: Date
}

export interface Goal {
  id: string
  type: 'distance' | 'time' | 'events' | 'custom'
  target: string
  description: string
  targetDate?: Date
  completed: boolean
  createdAt: Date
}

export interface UserPreferences {
  notifications: {
    newEvents: boolean
    eventReminders: boolean
    eventUpdates: boolean
  }
  privacy: {
    profilePublic: boolean
    showStats: boolean
    showGoals: boolean
  }
  display: {
    preferredView: 'cards' | 'table'
    eventsPerPage: number
  }
}

export interface UserStats {
  totalEventsLiked: number
  totalEventsAttended: number
  totalCommentsPosted: number
  favoriteCategory: string
  joinDate: Date
  lastActivity: Date
}

// Likes y favoritos
export interface EventLike {
  id?: string
  eventId: string
  userId: string
  createdAt: Date
}

export interface UserEventInteraction {
  eventId: string
  liked: boolean
  attended: boolean
  interested: boolean
  notes?: string
  rating?: number // 1-5 estrellas
  createdAt: Date
  updatedAt: Date
}