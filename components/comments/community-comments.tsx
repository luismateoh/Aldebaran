'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import CommentForm from './comment-form'
import CommentCard from './comment-card'

/* ------------------------------------------------------------------ */
/*  Tipos públicos                                                     */
/* ------------------------------------------------------------------ */

export interface CommentData {
  id: string
  author: string
  avatar?: string
  distance?: string
  content: string
  createdAt: string
  likes: number
  replies?: CommentData[]
  images?: string[]
}

export interface CommunityCommentsProps {
  eventId: string
  comments: CommentData[]
  className?: string
  onAddComment?: (content: string) => void | Promise<void>
  onLike?: (commentId: string) => void
  onReply?: (commentId: string) => void
  currentUser?: {
    name: string
    avatar?: string
  }
  isSubmitting?: boolean
}

/* ------------------------------------------------------------------ */
/*  Contador de comentarios (incluye replies)                          */
/* ------------------------------------------------------------------ */

function countAll(comments: CommentData[]): number {
  let total = 0
  for (const c of comments) {
    total += 1
    if (c.replies) total += countAll(c.replies)
  }
  return total
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export default function CommunityComments({
  eventId: _eventId,
  comments,
  className,
  onAddComment,
  onLike,
  onReply,
  currentUser,
  isSubmitting = false,
}: CommunityCommentsProps) {
  const [replyToId, setReplyToId] = useState<string | null>(null)

  const totalComments = countAll(comments)

  const handleReply = useCallback(
    (commentId: string) => {
      setReplyToId((prev) => (prev === commentId ? null : commentId))
      onReply?.(commentId)
    },
    [onReply],
  )

  const handleAddComment = useCallback(
    async (content: string) => {
      await onAddComment?.(content)
      setReplyToId(null)
    },
    [onAddComment],
  )

  return (
    <section className={className}>
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground md:text-xl">
            Comentarios de la Comunidad
          </h3>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-0.5 text-xs font-medium"
        >
          {totalComments}
        </Badge>
      </motion.div>

      <p className="mb-6 text-sm text-muted-foreground">
        Comparte tu experiencia, haz preguntas o conecta con otros corredores
      </p>

      {/* Formulario principal */}
      {onAddComment && (
        <div className="mb-8">
          <CommentForm
            onSubmit={handleAddComment}
            isSubmitting={isSubmitting}
            currentUser={currentUser}
            placeholder="Comparte tu experiencia, pregunta o consejo..."
          />
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {comments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="size-7 text-primary" />
              </div>
              <h4 className="mb-1 text-base font-semibold text-foreground">
                Sé el primero en comentar
              </h4>
              <p className="max-w-xs text-sm text-muted-foreground">
                Tu opinión e información le sirve a toda la comunidad de
                corredores
              </p>
            </motion.div>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <CommentCard
                  comment={comment}
                  onLike={onLike}
                  onReply={handleReply}
                />

                {/* Formulario de respuesta inline */}
                {replyToId === comment.id && onAddComment && (
                  <div className="ml-8 mt-3">
                    <CommentForm
                      onSubmit={async (content) => {
                        await handleAddComment(content)
                        setReplyToId(null)
                      }}
                      isSubmitting={isSubmitting}
                      currentUser={currentUser}
                      placeholder="Escribe tu respuesta..."
                    />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
