'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { LoginModal } from '@/components/login-modal'
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
  const { user } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

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
      setShowLoginModal(true)
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


  return (
    <>
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
            "size-4 transition-all",
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

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Inicia sesión para dar like a este evento"
        description="Necesitas una cuenta para poder guardar eventos como favoritos y recibir notificaciones."
      />
    </>
  )
}