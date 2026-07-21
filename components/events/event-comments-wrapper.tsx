'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import CommunityComments, {
  CommentData,
} from '@/components/comments/community-comments'
import type { FirebaseCommentData } from '@/types'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CommentsWrapperProps {
  eventId: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convierte un Firestore Timestamp o string a ISO string */
function tsToString(ts: unknown): string {
  if (!ts) return new Date().toISOString()
  if (typeof ts === 'string') return ts
  if (typeof ts === 'object' && ts !== null) {
    const obj = ts as Record<string, unknown>
    if (typeof obj.toDate === 'function') {
      return (obj.toDate() as Date).toISOString()
    }
    if (typeof obj.seconds === 'number') {
      return new Date((obj.seconds as number) * 1000).toISOString()
    }
  }
  return new Date().toISOString()
}

/** Mapea un comentario de Firebase al formato CommentData */
function mapComment(fc: FirebaseCommentData & { id?: string }): CommentData {
  return {
    id: fc.id ?? '',
    author: fc.author,
    avatar: fc.photoURL,
    content: fc.content,
    createdAt: tsToString(fc.createdAt),
    likes: fc.likes ?? 0,
  }
}

/** Obtiene el primer nombre */
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

/* ------------------------------------------------------------------ */
/*  CommentsWrapper                                                    */
/* ------------------------------------------------------------------ */

export default function CommentsWrapper({ eventId }: CommentsWrapperProps) {
  const { user, loading: authLoading } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [comments, setComments] = useState<CommentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/comments?eventId=${eventId}`)
      if (response.ok) {
        const data: { comments?: FirebaseCommentData[] } = await response.json()
        setComments((data.comments ?? []).map(mapComment))
      }
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!user) return
      setIsSubmitting(true)
      try {
        const response = await makeAuthenticatedRequest('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            author: getFirstName(
              user.displayName ?? user.email ?? 'Usuario',
            ),
            content,
            userId: user.uid,
            photoURL: user.photoURL,
          }),
        })

        if (response.ok) {
          await loadComments()
        } else {
          const errorData = await response.json().catch(() => null)
          console.error('Error posting comment:', errorData?.error ?? response.statusText)
        }
      } catch (err) {
        console.error('Error posting comment:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [user, eventId, makeAuthenticatedRequest, loadComments],
  )

  // Mientras carga la autenticación o los comentarios
  if (authLoading || isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Cargando comentarios...
      </div>
    )
  }

  return (
    <div className="mt-10">
      <CommunityComments
        eventId={eventId}
        comments={comments}
        onAddComment={user ? handleAddComment : undefined}
        isSubmitting={isSubmitting}
        currentUser={
          user
            ? {
                name: getFirstName(
                  user.displayName ?? user.email ?? 'Usuario',
                ),
                avatar: user.photoURL ?? undefined,
              }
            : undefined
        }
      />
    </div>
  )
}
