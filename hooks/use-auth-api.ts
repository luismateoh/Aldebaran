import { useAuth } from '@/lib/auth-context'
import { useCallback } from 'react'

export function useAuthApi() {
  const { user } = useAuth()

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error('No authenticated user')
    }

    // Get Firebase ID token
    const idToken = await user.getIdToken()

    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    }

    return fetch(url, {
      ...options,
      headers
    })
  }, [user])

  return { makeAuthenticatedRequest }
}