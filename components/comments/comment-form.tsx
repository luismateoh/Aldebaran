'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface CommentFormProps {
  onSubmit: (content: string) => void | Promise<void>
  isSubmitting?: boolean
  currentUser?: {
    name: string
    avatar?: string
  }
  placeholder?: string
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function CommentForm({
  onSubmit,
  isSubmitting = false,
  currentUser,
  placeholder = 'Comparte tu experiencia, pregunta o consejo...',
  className,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()

    if (!trimmed) {
      setError('El comentario no puede estar vacío')
      return
    }

    setError('')
    await onSubmit(trimmed)
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={className}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        {/* Encabezado con usuario */}
        {currentUser && (
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="size-8 border border-border">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {currentUser.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Comentando como
              </span>
            </div>
          </div>
        )}

        {/* Área de texto */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            maxLength={2000}
            className="min-h-[80px] resize-y border-0 bg-muted/40 p-3 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
            aria-label="Escribe un comentario"
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-destructive"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Barra inferior */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {content.length}/2000 ·{' '}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              ⌘⏎
            </kbd>{' '}
            para enviar
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <span className="size-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  )
}
