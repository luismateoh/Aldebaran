'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAuthApi } from '@/hooks/use-auth-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Calendar, MapPin, User, Plus, MoreHorizontal, Trash, Ban, Check, Search, Filter, SortAsc, Copy, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Event {
  id: string
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  category: string
  status: 'draft' | 'published' | 'cancelled'
  distances: string[]
  createdAt: string
  lastModified: string
}

export default function EventsPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const { makeAuthenticatedRequest } = useAuthApi()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'cancelled'>('all')
  const [actionResult, setActionResult] = useState<{success?: boolean, message: string} | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'created'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadEvents()
    }
  }, [user, isAdmin])

  const loadEvents = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/events/list')

      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error('Error loading events:', response.status)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/admin/events/edit/${eventId}`)
  }
  
  const handleCreateEvent = () => {
    router.push('/admin')
  }

  const handleUpdateStatus = async (eventId: string, status: 'draft' | 'published' | 'cancelled') => {
    try {
      setActionResult(null)
      
      const response = await makeAuthenticatedRequest('/api/events/status', {
        method: 'PATCH',
        body: JSON.stringify({ eventId, status })
      })

      if (response.ok) {
        // Update local state
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, status } : event
        ))
        
        // Show success message
        setActionResult({
          success: true,
          message: `Evento actualizado a "${
            status === 'published' ? 'publicado' : 
            status === 'draft' ? 'borrador' : 'cancelado'
          }"`
        })
      } else {
        const errorData = await response.json()
        setActionResult({
          success: false,
          message: errorData.error || 'Error actualizando evento'
        })
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Desconocido'}`
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-yellow-600">Borrador</Badge>
      case 'published':
        return <Badge variant="outline" className="text-green-600">Publicado</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Obtener departamentos únicos para filtro
  const uniqueDepartments = Array.from(new Set(events.map(e => e.department).filter(Boolean)))
  const uniqueCategories = Array.from(new Set(events.map(e => e.category).filter(Boolean)))

  // Función de duplicado de evento
  const handleDuplicateEvent = async (eventId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`/api/events/detail?id=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        const event = data.event
        
        // Crear nuevo evento duplicado
        const duplicatedEvent = {
          ...event,
          title: event.title + ' - Copia',
          status: 'draft',
          eventDate: '', // Limpiar fecha para que el admin la establezca
        }
        delete duplicatedEvent.id // Remover ID para crear nuevo
        
        const createResponse = await makeAuthenticatedRequest('/api/events', {
          method: 'POST',
          body: JSON.stringify(duplicatedEvent)
        })
        
        if (createResponse.ok) {
          setActionResult({
            success: true,
            message: 'Evento duplicado exitosamente. Actualice la fecha antes de publicar.'
          })
          loadEvents() // Recargar lista
        }
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: 'Error duplicando evento'
      })
    }
  }

  // Filtrado avanzado
  const filteredEvents = events
    .filter(event => {
      // Filtro por estado
      if (filter !== 'all' && event.status !== filter) return false
      
      // Filtro por búsqueda
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.municipality.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.organizer.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Filtro por departamento
      if (departmentFilter !== 'all' && event.department !== departmentFilter) return false
      
      // Filtro por categoría  
      if (categoryFilter !== 'all' && event.category !== categoryFilter) return false
      
      return true
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.createdAt || '').getTime()
          bValue = new Date(b.createdAt || '').getTime()
          break
        case 'date':
        default:
          aValue = new Date(a.eventDate || '').getTime()
          bValue = new Date(b.eventDate || '').getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">Verificando autenticación...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="text-center">Cargando eventos...</div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Eventos</h1>
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} de {events.length} eventos
            </p>
          </div>
        </div>
        <Button onClick={handleCreateEvent} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo
        </Button>
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar eventos por título, municipio u organizador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters - Collapsible on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {/* Status Filter */}
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>

          {/* Department Filter */}
          {uniqueDepartments.length > 0 && (
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Depto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Deptos</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Por Fecha</SelectItem>
              <SelectItem value="title">Por Título</SelectItem>
              <SelectItem value="created">Por Creación</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-xs"
          >
            <SortAsc className={`h-3 w-3 mr-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setFilter('all')
              setDepartmentFilter('all')
              setCategoryFilter('all')
              setSortBy('date')
              setSortOrder('desc')
            }}
            className="text-xs"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Action Result */}
      {actionResult && (
        <Alert className={actionResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={actionResult.success ? "text-green-700" : "text-red-700"}>
            {actionResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'published', 'draft', 'cancelled'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'Todos' : 
             status === 'published' ? 'Publicados' :
             status === 'draft' ? 'Borradores' : 'Cancelados'}
            {status !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {events.filter(e => e.status === status).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-sm text-muted-foreground">Total Eventos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.status === 'published').length}
            </div>
            <div className="text-sm text-muted-foreground">Publicados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {events.filter(e => e.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground">Borradores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {events.filter(e => e.status === 'cancelled').length}
            </div>
            <div className="text-sm text-muted-foreground">Cancelados</div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Lista de Eventos {filter !== 'all' && `(${filter})`}
        </h2>
        {filteredEvents.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay eventos {filter !== 'all' && `en estado ${filter}`} disponibles.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(event.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateEvent(event.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicar</span>
                          </DropdownMenuItem>
                          {event.status !== 'published' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'published')}>
                              <Check className="mr-2 h-4 w-4" />
                              <span>Publicar</span>
                            </DropdownMenuItem>
                          )}
                          {event.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'draft')}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Pasar a Borrador</span>
                            </DropdownMenuItem>
                          )}
                          {event.status !== 'cancelled' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(event.id, 'cancelled')}>
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Cancelar</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.municipality}, {event.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {event.organizer || 'No especificado'}
                    </div>
                  </div>

                  {/* Distances */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.distances.slice(0, 3).map((distance, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {distance}
                      </Badge>
                    ))}
                    {event.distances.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{event.distances.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleEditEvent(event.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Evento
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}