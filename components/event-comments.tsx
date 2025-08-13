'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, User, Clock, LogIn, MoreHorizontal, Edit3, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { FirebaseCommentData } from '@/types'
import { toast } from "sonner"

interface Comment extends FirebaseCommentData {
  timestamp?: string
}

interface CommentsProps {
  eventId: string
}

export default function EventComments({ eventId }: CommentsProps) {
  const { user, isAdmin, loading: authLoading, signInWithGoogleForComments } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState({ content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [editContent, setEditContent] = useState('')

  // Cargar comentarios
  useEffect(() => {
    loadComments()
  }, [eventId, isAdmin])

  const loadComments = async () => {
    try {
      // Si es admin, incluir comentarios ocultos para poder administrarlos
      const includeHidden = isAdmin ? '&includeHidden=true' : ''
      const response = await fetch(`/api/comments?eventId=${eventId}${includeHidden}`)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Comments loaded:', data.comments?.length || 0, data.comments)
        setComments(data.comments || [])
      } else {
        console.error('❌ Error response:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await makeAuthenticatedRequest('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          author: getFirstName(user.displayName || user.email || 'Usuario'),
          content: newComment.content.trim(),
          userId: user.uid,
          photoURL: user.photoURL
        })
      })

      if (response.ok) {
        setNewComment({ content: '' })
        loadComments() // Recargar comentarios
        toast.success('Comentario enviado exitosamente')
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Error al enviar comentario. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async () => {
    if (!editingComment || !editContent.trim()) return

    try {
      const response = await makeAuthenticatedRequest(`/api/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() })
      })

      if (response.ok) {
        setEditingComment(null)
        setEditContent('')
        loadComments()
        toast.success('Comentario editado exitosamente')
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error editing comment:', error)
      toast.error('Error al editar comentario.')
    }
  }

  const handleToggleHidden = async (comment: Comment) => {
    if (!isAdmin) return

    try {
      const response = await makeAuthenticatedRequest(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !comment.hidden })
      })

      if (response.ok) {
        loadComments()
        toast.success(comment.hidden ? 'Comentario mostrado' : 'Comentario ocultado')
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error toggling comment visibility:', error)
      toast.error('Error al cambiar visibilidad del comentario.')
    }
  }

  const handleDeleteComment = async (comment: Comment) => {
    if (!isAdmin) return
    
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await makeAuthenticatedRequest(`/api/comments/${comment.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadComments()
        toast.success('Comentario eliminado')
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Error al eliminar comentario.')
    }
  }

  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  return (
    <div data-comments-section className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-6" />
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
          {authLoading ? (
            <div className="py-4 text-center">
              <div className="mx-auto size-6 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : !user ? (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                <LogIn className="size-6 text-primary" />
              </div>
              <div>
                <h4 className="mb-2 font-medium">Inicia sesión para comentar</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Necesitas tener una cuenta para participar en la conversación
                </p>
                <Button onClick={signInWithGoogleForComments} className="w-full">
                  <LogIn className="mr-2 size-4" />
                  Iniciar sesión con Google
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitComment} className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="size-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(user.displayName || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{getFirstName(user.displayName || user.email || 'Usuario')}</p>
                  <p className="text-xs text-muted-foreground">Comentando como</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Textarea
                  id="content"
                  placeholder="Comparte tu experiencia, pregunta o consejo..."
                  value={newComment.content}
                  onChange={(e) => setNewComment({ content: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !newComment.content.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>Publicando...</>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Publicar Comentario
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageCircle className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                ¡Sé el primero en comentar sobre este evento!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className={comment.hidden ? 'border-orange-200 opacity-60' : ''}>
              <CardContent className="pt-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarImage src={comment.photoURL || undefined} />
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(comment.author)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getFirstName(comment.author)}</span>
                    {comment.hidden && (
                      <Badge variant="secondary" className="text-xs">
                        Oculto
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDate(comment.createdAt || comment.timestamp || new Date())}
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="size-8 p-0">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingComment(comment)
                              setEditContent(comment.content)
                            }}
                          >
                            <Edit3 className="mr-2 size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleHidden(comment)}
                          >
                            {comment.hidden ? (
                              <>
                                <Eye className="mr-2 size-4" />
                                Mostrar
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 size-4" />
                                Ocultar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <p className="ml-10 text-sm leading-relaxed">{comment.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Diálogo para editar comentario */}
      <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Comentario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-content">Contenido</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingComment(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditComment}
              disabled={!editContent.trim()}
            >
              <Edit3 className="mr-2 size-4" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
