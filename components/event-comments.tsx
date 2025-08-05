'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, User, Clock } from 'lucide-react'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  eventId: string
}

interface CommentsProps {
  eventId: string
}

export default function EventComments({ eventId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState({ author: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar comentarios
  useEffect(() => {
    loadComments()
  }, [eventId])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.author.trim() || !newComment.content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          author: newComment.author.trim(),
          content: newComment.content.trim()
        })
      })

      if (response.ok) {
        setNewComment({ author: '', content: '' })
        loadComments() // Recargar comentarios
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Error al enviar comentario. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        <h3 className="text-2xl font-bold">Comentarios de la Comunidad</h3>
        <Badge className="bg-secondary text-secondary-foreground">{comments.length}</Badge>
      </div>
      
      <p className="text-muted-foreground">
        Comparte tu experiencia, haz preguntas o conecta con otros corredores
      </p>

      {/* Formulario para nuevo comentario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💬 Agregar Comentario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitComment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author">Tu nombre</Label>
              <Input
                id="author"
                placeholder="Ej: María González"
                value={newComment.author}
                onChange={(e) => setNewComment(prev => ({ ...prev, author: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Comentario</Label>
              <Textarea
                id="content"
                placeholder="Comparte tu experiencia, pregunta o consejo..."
                value={newComment.content}
                onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.author.trim() || !newComment.content.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>Publicando...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Comentario
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                ¡Sé el primero en comentar sobre este evento!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{comment.author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(comment.timestamp)}
                  </div>
                </div>
                <p className="text-sm leading-relaxed pl-10">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
