import { useAuth } from '@/lib/auth-context'
import { useCallback } from 'react'

export function useAuthApi() {
  const { user } = useAuth()

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error('No authenticated user')
    }

    try {
      // Force token refresh to get a valid token with all claims
      const idToken = await user.getIdToken(true)
      
      if (!idToken) {
        throw new Error('Failed to get ID token')
      }

      // Add Authorization header
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(url, {
        ...options,
        headers
      })

      // If we get a 401, try refreshing the token once more
      if (response.status === 401) {
        console.log('Token expired, refreshing...')
        const refreshedToken = await user.getIdToken(true)
        
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${refreshedToken}`,
          'Content-Type': 'application/json'
        }

        return fetch(url, {
          ...options,
          headers: retryHeaders
        })
      }

      return response
    } catch (error) {
      console.error('Error making authenticated request:', error)
      throw error
    }
  }, [user])

  return { makeAuthenticatedRequest }
}