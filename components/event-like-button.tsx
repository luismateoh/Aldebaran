'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { cn } from '@/lib/utils'

interface EventLikeButtonProps {
  eventId: string
  initialLiked?: boolean
  initialCount?: number
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showCount?: boolean
  className?: string
}

export default function EventLikeButton({
  eventId,
  initialLiked = false,
  initialCount = 0,
  variant = 'outline',
  size = 'sm',
  showCount = true,
  className
}: EventLikeButtonProps) {
  const { user, signInWithGoogleForComments } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    loadLikeStatus()
  }, [user, eventId])

  const loadLikeStatus = async () => {
    try {
      const userId = user?.uid ? `?userId=${user.uid}` : ''
      const response = await fetch(`/api/events/${eventId}/like${userId}`)
      if (response.ok) {
        const data = await response.json()
        setLiked(data.isLiked || false)
        setLikesCount(data.likesCount || 0)
      }
    } catch (error) {
      console.error('Error loading like status:', error)
    }
  }

  const handleLikeClick = async () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await makeAuthenticatedRequest(`/api/events/${eventId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikesCount(data.totalLikes)
      } else {
        throw new Error('Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revertir el estado en caso de error
      setLiked(!liked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogleForComments()
      setShowLoginPrompt(false)
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  if (showLoginPrompt) {
    return (
      <div className="flex flex-col gap-2 p-2 border rounded-md bg-muted/50">
        <p className="text-xs text-muted-foreground">
          Inicia sesión para dar like a este evento
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSignIn}>
            Iniciar Sesión
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowLoginPrompt(false)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLikeClick}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        liked && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all",
          liked && "fill-red-500"
        )} 
      />
      {showCount && (
        <span className="text-sm font-medium">
          {likesCount}
        </span>
      )}
      <span className="sr-only">
        {liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      </span>
    </Button>
  )
}