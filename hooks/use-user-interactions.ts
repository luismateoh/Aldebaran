import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import type { UserEventInteraction, UserProfile } from '@/types/user'

export function useUserInteractions() {
  const { user } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [likedEvents, setLikedEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const loadUserData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Cargar perfil de usuario
      const profileResponse = await makeAuthenticatedRequest(`/api/user/profile`)
      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        setUserProfile(profile)
      }

      // Cargar eventos que le gustan
      const likesResponse = await makeAuthenticatedRequest(`/api/user/liked-events`)
      if (likesResponse.ok) {
        const likes = await likesResponse.json()
        setLikedEvents(likes.eventIds || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, makeAuthenticatedRequest])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  const toggleEventLike = useCallback(async (eventId: string) => {
    if (!user) return false

    try {
      const response = await makeAuthenticatedRequest(`/api/events/${eventId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        
        // Actualizar la lista local
        if (data.liked) {
          setLikedEvents(prev => [...prev, eventId])
        } else {
          setLikedEvents(prev => prev.filter(id => id !== eventId))
        }
        
        return data.liked
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
    
    return false
  }, [user, makeAuthenticatedRequest])

  const setEventInteraction = useCallback(async (
    eventId: string, 
    interaction: Partial<UserEventInteraction>
  ) => {
    if (!user) return

    try {
      const response = await makeAuthenticatedRequest(`/api/user/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, ...interaction })
      })

      if (response.ok) {
        // Recargar datos del usuario para reflejar cambios
        loadUserData()
      }
    } catch (error) {
      console.error('Error setting interaction:', error)
    }
  }, [user, makeAuthenticatedRequest, loadUserData])

  const isEventLiked = useCallback((eventId: string) => {
    return likedEvents.includes(eventId)
  }, [likedEvents])

  return {
    userProfile,
    likedEvents,
    loading,
    toggleEventLike,
    setEventInteraction,
    isEventLiked,
    refreshData: loadUserData
  }
}