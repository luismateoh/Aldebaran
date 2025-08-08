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
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error editing comment:', error)
      alert('Error al editar comentario.')
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
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error toggling comment visibility:', error)
      alert('Error al cambiar visibilidad del comentario.')
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
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error al eliminar comentario.')
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
          {authLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-6 space-y-4">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-2">Inicia sesión para comentar</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Necesitas tener una cuenta para participar en la conversación
                </p>
                <Button onClick={signInWithGoogleForComments} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar sesión con Google
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitComment} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(user.displayName || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{getFirstName(user.displayName || user.email || 'Usuario')}</p>
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
                    <Send className="h-4 w-4 mr-2" />
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
            <Card key={comment.id} className={comment.hidden ? 'opacity-60 border-orange-200' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
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
                      <Clock className="h-3 w-3" />
                      {formatDate(comment.createdAt || comment.timestamp || new Date())}
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingComment(comment)
                              setEditContent(comment.content)
                            }}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleHidden(comment)}
                          >
                            {comment.hidden ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Mostrar
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Ocultar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed ml-10">{comment.content}</p>
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
              <Edit3 className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
