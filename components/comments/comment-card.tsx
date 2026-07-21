'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CommentData } from './community-comments'

export interface CommentCardProps {
  comment: CommentData
  onLike?: (commentId: string) => void
  onReply?: (commentId: string) => void
  isReply?: boolean
  className?: string
}

/** Genera iniciales a partir de un nombre */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Colores pastel deterministas para avatares sin foto */
const avatarColors = [
  'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-yellow-100 text-yellow-700',
  'bg-lime-100 text-lime-700',
  'bg-green-100 text-green-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-rose-100 text-rose-700',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

/** Mapea distancia a etiqueta legible */
function formatDistanceBadge(distance?: string): string {
  if (!distance) return ''
  const map: Record<string, string> = {
    '5K': '5K',
    '10K': '10K',
    '15K': '15K',
    '21K': 'Media Maratón',
    'media maratón': 'Media Maratón',
    'media maraton': 'Media Maratón',
    '42K': 'Maratón',
    maratón: 'Maratón',
    marathon: 'Maratón',
    ultra: 'Ultra',
    'ultra trail': 'Ultra',
    '3K': '3K',
    caminata: 'Caminata',
    '10k': '10K',
    '21k': 'Media Maratón',
    '42k': 'Maratón',
  }
  const key = distance.toLowerCase().trim()
  return map[key] || distance
}

/** Tiempo relativo estilo Reddit */
function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`
  if (weeks < 5) return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`
  if (months < 12) return `Hace ${months} mes${months !== 1 ? 'es' : ''}`
  return `Hace ${years} año${years !== 1 ? 's' : ''}`
}

export default function CommentCard({
  comment,
  onLike,
  onReply,
  isReply = false,
  className,
}: CommentCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes)
  const [showReplies, setShowReplies] = useState(false)
  const [imgError, setImgError] = useState<Set<number>>(new Set())

  const handleLike = () => {
    // Optimistic update local
    if (liked) {
      setLikeCount((prev) => Math.max(0, prev - 1))
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
    onLike?.(comment.id)
  }

  const hasReplies = comment.replies && comment.replies.length > 0
  const avatarColor = getAvatarColor(comment.author)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      <div
        className={`group rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-sm ${
          isReply ? 'ml-8 border-l-primary/30' : ''
        }`}
      >
        {/* Encabezado: avatar + info */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9 shrink-0 border-2 border-border">
              <AvatarImage src={comment.avatar} alt={comment.author} />
              <AvatarFallback className={`text-xs font-bold ${avatarColor}`}>
                {getInitials(comment.author)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {comment.author}
                </span>
                {comment.distance && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary/10 px-2 py-0 text-[10px] font-medium text-primary"
                  >
                    {formatDistanceBadge(comment.distance)}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido del comentario */}
        <div className="mb-3 pl-12">
          <p className="text-sm leading-relaxed text-foreground/90">
            {comment.content}
          </p>

          {/* Imágenes en miniatura */}
          {comment.images && comment.images.length > 0 && (
            <div
              className={`mt-3 grid gap-2 ${
                comment.images.length === 1
                  ? 'grid-cols-1'
                  : comment.images.length === 2
                    ? 'grid-cols-2'
                    : comment.images.length === 3
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
              }`}
            >
              {comment.images.map((img, idx) => {
                if (imgError.has(idx)) return null
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`overflow-hidden rounded-lg border border-border ${
                      comment.images && comment.images.length === 3 && idx === 0
                        ? 'col-span-2 row-span-2'
                        : ''
                    }`}
                    onClick={() => window.open(img, '_blank')}
                    type="button"
                  >
                    <img
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      className="h-24 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={() =>
                        setImgError((prev) => new Set(prev).add(idx))
                      }
                      loading="lazy"
                    />
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        {/* Acciones: likes + responder */}
        <div className="flex items-center gap-1 pl-12">
          <motion.div whileTap={{ scale: 0.85 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-7 gap-1 px-2 text-xs transition-colors duration-200 ${
                liked
                  ? 'text-primary hover:text-primary/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <motion.div
                animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`size-3.5 ${liked ? 'fill-primary' : ''}`}
                />
              </motion.div>
              <span>{likeCount}</span>
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply?.(comment.id)}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="size-3.5" />
            Responder
          </Button>

          {/* Botón para expandir respuestas */}
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showReplies ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              {comment.replies!.length}{' '}
              {comment.replies!.length === 1 ? 'respuesta' : 'respuestas'}
            </Button>
          )}
        </div>
      </div>

      {/* Respuestas anidadas */}
      {hasReplies && showReplies && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2 space-y-2"
        >
          {comment.replies!.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              isReply
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
