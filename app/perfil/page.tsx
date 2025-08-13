'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useUserInteractions } from '@/hooks/use-user-interactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GoalsManager from '@/components/goals-manager'
import { 
  Heart, 
  Calendar, 
  MapPin, 
  User, 
  Trophy, 
  Target,
  Activity,
  Settings,
  BarChart3,
  BookOpen,
  Star
} from 'lucide-react'

export default function UserProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { userProfile, likedEvents, loading } = useUserInteractions()
  const [favoriteEvents, setFavoriteEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Cargar eventos favoritos cuando tengamos los IDs
    if (likedEvents.length > 0) {
      loadFavoriteEvents()
    } else {
      setFavoriteEvents([])
    }
  }, [likedEvents])

  const loadFavoriteEvents = async () => {
    if (!user?.uid) return
    
    setLoadingEvents(true)
    try {
      const response = await fetch(`/api/user/liked-events?includeEventData=true`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFavoriteEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error loading favorite events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = userProfile?.stats || {
    totalEventsLiked: likedEvents.length,
    totalEventsAttended: 0,
    totalCommentsPosted: 0,
    favoriteCategory: 'Running'
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      {/* Header del perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-20">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user.displayName || user.email || 'Usuario')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="mb-1 text-2xl font-bold">
                {user.displayName || 'Usuario'}
              </h1>
              <p className="mb-3 text-muted-foreground">{user.email}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <User className="mr-1 size-3" />
                  {userProfile?.runnerProfile?.level || 'Principiante'}
                </Badge>
                <Badge variant="outline">
                  <Heart className="mr-1 size-3" />
                  {stats.totalEventsLiked} eventos favoritos
                </Badge>
                <Badge variant="outline">
                  <Trophy className="mr-1 size-3" />
                  {stats.totalEventsAttended} eventos completados
                </Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => router.push('/configuracion')}>
              <Settings className="mr-2 size-4" />
              Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Favoritos</p>
                <p className="text-2xl font-bold">{stats.totalEventsLiked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{stats.totalEventsAttended}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Comentarios</p>
                <p className="text-2xl font-bold">{stats.totalCommentsPosted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="size-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Categoría Fav</p>
                <p className="text-lg font-semibold">{stats.favoriteCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido por pestañas */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="favorites">
            <Heart className="mr-2 size-4" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Calendar className="mr-2 size-4" />
            Próximos
          </TabsTrigger>
          <TabsTrigger value="past">
            <Trophy className="mr-2 size-4" />
            Completados
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="mr-2 size-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 size-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="size-5 text-red-500" />
                Eventos Favoritos ({likedEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {likedEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <Heart className="mx-auto mb-4 size-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aún no tienes eventos favoritos
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Da like a los eventos que te interesen para verlos aquí
                  </p>
                  <Button className="mt-4" onClick={() => router.push('/')}>
                    Explorar Eventos
                  </Button>
                </div>
              ) : loadingEvents ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <p>Cargando eventos favoritos...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {favoriteEvents.map((event: any) => (
                    <Card key={event.id} className="cursor-pointer transition-shadow hover:shadow-md" 
                          onClick={() => router.push(`/events/${event.id}`)}>
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-semibold">{event.title}</h3>
                            <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                {event.eventDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                {event.municipality}, {event.department}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {event.snippet || 'Evento de running en Colombia'}
                            </p>
                          </div>
                          <Badge variant="secondary">{event.category}</Badge>
                        </div>
                        
                        {event.distances && event.distances.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.distances.map((distance: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {distance}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-500" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No hay eventos próximos marcados
                </p>
                <Button className="mt-4" onClick={() => router.push('/')}>
                  Explorar Eventos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-yellow-500" />
                Eventos Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <Trophy className="mx-auto mb-4 size-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No hay eventos completados registrados
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Marca los eventos en los que hayas participado
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <GoalsManager />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-purple-500" />
                  Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Eventos favoritos</span>
                    <Badge>{stats.totalEventsLiked}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Eventos completados</span>
                    <Badge>{stats.totalEventsAttended}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Comentarios publicados</span>
                    <Badge>{stats.totalCommentsPosted}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Categoría favorita</span>
                    <Badge variant="secondary">{stats.favoriteCategory}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}