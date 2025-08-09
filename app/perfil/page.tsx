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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Header del perfil */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(user.displayName || user.email || 'Usuario')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {user.displayName || 'Usuario'}
              </h1>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <User className="size-3 mr-1" />
                  {userProfile?.runnerProfile?.level || 'Principiante'}
                </Badge>
                <Badge variant="outline">
                  <Heart className="size-3 mr-1" />
                  {stats.totalEventsLiked} eventos favoritos
                </Badge>
                <Badge variant="outline">
                  <Trophy className="size-3 mr-1" />
                  {stats.totalEventsAttended} eventos completados
                </Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => router.push('/configuracion')}>
              <Settings className="size-4 mr-2" />
              Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Heart className="size-4 mr-2" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Calendar className="size-4 mr-2" />
            Próximos
          </TabsTrigger>
          <TabsTrigger value="past">
            <Trophy className="size-4 mr-2" />
            Completados
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="size-4 mr-2" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="size-4 mr-2" />
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
                <div className="text-center py-8">
                  <Heart className="size-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aún no tienes eventos favoritos
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Da like a los eventos que te interesen para verlos aquí
                  </p>
                  <Button className="mt-4" onClick={() => router.push('/')}>
                    Explorar Eventos
                  </Button>
                </div>
              ) : loadingEvents ? (
                <div className="text-center py-8">
                  <div className="size-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p>Cargando eventos favoritos...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {favoriteEvents.map((event: any) => (
                    <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => router.push(`/events/${event.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-4" />
                                {event.eventDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                {event.municipality}, {event.department}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
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
              <div className="text-center py-8">
                <Calendar className="size-12 mx-auto text-muted-foreground mb-4" />
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
              <div className="text-center py-8">
                <Trophy className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay eventos completados registrados
                </p>
                <p className="text-sm text-muted-foreground mt-2">
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
                  <div className="flex justify-between items-center">
                    <span>Eventos favoritos</span>
                    <Badge>{stats.totalEventsLiked}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Eventos completados</span>
                    <Badge>{stats.totalEventsAttended}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Comentarios publicados</span>
                    <Badge>{stats.totalCommentsPosted}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
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