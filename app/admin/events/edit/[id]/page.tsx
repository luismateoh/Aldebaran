'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Calendar, MapPin, User, Globe, DollarSign, Check } from 'lucide-react'

interface EventData {
  id: string
  title: string
  date: string
  municipality: string
  department: string
  organizer: string
  category: string
  status: 'draft' | 'published' | 'cancelled'
  distances: string[]
  website: string
  registrationFee: string
  description: string
  altitude: string
  cover: string
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [eventData, setEventData] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEvent, setGeneratedEvent] = useState<string>('')
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [markdownContent, setMarkdownContent] = useState<string>('')

  // Detectar si estamos en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development'

  const departments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá', 'Bolívar', 'Boyacá', 
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 
    'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 
    'Vaupés', 'Vichada'
  ]

  const categories = ['Running', 'Trail', 'Maraton', 'Media maraton', 'Ultra', 'Kids']
  const distanceOptions = ['1k', '2k', '3k', '5k', '8k', '10k', '15k', '21k', '25k', '30k', '42k', '50k', '100k']

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/login')
      return
    }
    
    loadEventData()
  }, [eventId])

  const loadEventData = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/events/detail?id=${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setEventData(data.event)
      } else {
        console.error('Error loading event:', response.status)
        setSaveResult({
          error: true,
          message: `Error cargando evento: ${response.status}`
        })
      }
    } catch (error) {
      console.error('Error loading event:', error)
      setSaveResult({
        error: true,
        message: 'Error de conexión al cargar evento'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDistanceToggle = (distance: string) => {
    if (!eventData) return
    
    setEventData(prev => {
      if (!prev) return prev
      
      const lowerDistance = distance.toLowerCase()
      const currentDistances = prev.distances.map(d => d.toLowerCase())
      
      let newDistances
      if (currentDistances.includes(lowerDistance)) {
        newDistances = prev.distances.filter(d => d.toLowerCase() !== lowerDistance)
      } else {
        newDistances = [...prev.distances, distance]
      }
      
      return {
        ...prev,
        distances: newDistances
      }
    })
  }

  const handleSave = async () => {
    if (!eventData) return

    setIsSaving(true)
    setSaveResult(null)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/events/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: eventData.id,
          eventData: eventData
        })
      })

      if (response.ok) {
        setSaveResult({ 
          success: true, 
          message: 'Evento actualizado exitosamente' 
        })
      } else {
        const errorData = await response.json()
        setSaveResult({ 
          error: true, 
          message: `Error al actualizar evento: ${errorData.error || response.status}` 
        })
      }
    } catch (error) {
      setSaveResult({ 
        error: true, 
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!eventData) return

    setIsSaving(true)
    setSaveResult(null)
    
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/events/status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          eventId: eventData.id, 
          status: 'published' 
        })
      })

      if (response.ok) {
        setEventData(prev => prev ? { ...prev, status: 'published' } : null)
        setSaveResult({ 
          success: true, 
          message: 'Evento publicado exitosamente' 
        })
      } else {
        const errorData = await response.json()
        setSaveResult({ 
          error: true, 
          message: `Error al publicar evento: ${errorData.error || response.status}` 
        })
      }
    } catch (error) {
      setSaveResult({ 
        error: true, 
        message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    } finally {
      setIsSaving(false)
    }
  }

  const enhanceWithAI = async () => {
    if (!eventData) return
    
    setIsGenerating(true)
    setSaveResult(null)
    
    try {
      const response = await fetch('/api/enhance-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventData.title,
          eventDate: eventData.date,
          municipality: eventData.municipality,
          department: eventData.department,
          organizer: eventData.organizer,
          website: eventData.website,
          description: eventData.description,
          distances: eventData.distances,
          registrationFeed: eventData.registrationFee,
          category: eventData.category
        })
      })
      
      const result = await response.json()
      
      if (result.markdown) {
        setGeneratedEvent(result.markdown)
        setSaveResult({
          success: true,
          message: 'Contenido enriquecido con IA generado exitosamente'
        })
      }
    } catch (error) {
      setSaveResult({
        error: true,
        message: 'Error al enriquecer con IA: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const applyEnhancedContent = () => {
    if (!generatedEvent || !eventData) return
    
    // Extraer la descripción del markdown generado
    const lines = generatedEvent.split('\n')
    const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === '---')
    const description = lines.slice(frontmatterEnd + 1).join('\n').trim()
    
    setEventData(prev => prev ? { ...prev, description } : null)
    setGeneratedEvent('')
    setSaveResult({
      success: true,
      message: 'Contenido aplicado al evento'
    })
  }

  const generateMarkdownContent = () => {
    if (!eventData) return ''
    
    const frontmatter = `---
title: "${eventData.title}"
eventDate: "${eventData.date}"
municipality: "${eventData.municipality}"
department: "${eventData.department}"
organizer: "${eventData.organizer}"
category: "${eventData.category}"
draft: ${eventData.status === 'draft'}
distances: [${eventData.distances.map(d => `"${d}"`).join(', ')}]
website: "${eventData.website}"
registrationFeed: "${eventData.registrationFee}"
altitude: "${eventData.altitude}"
cover: "${eventData.cover}"
snippet: "${eventData.description.substring(0, 150).replace(/"/g, '\\"')}..."
tags: ["${eventData.category.toLowerCase()}", "running", "${eventData.municipality.toLowerCase()}"]
publishDate: "${new Date().toISOString().split('T')[0]}"
author: "Luis Hincapie"
---

${eventData.description}`

    return frontmatter
  }

  const updateEventFromMarkdown = (markdown: string) => {
    if (!eventData) return
    
    try {
      const lines = markdown.split('\n')
      const frontmatterStart = lines.findIndex(line => line === '---')
      const frontmatterEnd = lines.findIndex((line, index) => index > frontmatterStart && line === '---')
      
      if (frontmatterStart === -1 || frontmatterEnd === -1) {
        setSaveResult({
          error: true,
          message: 'Formato de markdown inválido: faltan los delimitadores de frontmatter (---)'
        })
        return
      }
      
      const frontmatterLines = lines.slice(frontmatterStart + 1, frontmatterEnd)
      const contentLines = lines.slice(frontmatterEnd + 1)
      
      const newEventData = { ...eventData }
      
      // Parsear frontmatter
      frontmatterLines.forEach(line => {
        const [key, ...valueParts] = line.split(':')
        if (!key || valueParts.length === 0) return
        
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
        
        switch (key.trim()) {
          case 'title':
            newEventData.title = value
            break
          case 'eventDate':
            newEventData.date = value
            break
          case 'municipality':
            newEventData.municipality = value
            break
          case 'department':
            newEventData.department = value
            break
          case 'organizer':
            newEventData.organizer = value
            break
          case 'category':
            newEventData.category = value
            break
          case 'draft':
            newEventData.status = value === 'true' ? 'draft' : 'published'
            break
          case 'website':
            newEventData.website = value
            break
          case 'registrationFeed':
            newEventData.registrationFee = value
            break
          case 'altitude':
            newEventData.altitude = value
            break
          case 'cover':
            newEventData.cover = value
            break
          case 'distances':
            // Parsear array de distancias
            const distanceMatch = value.match(/\[(.*)\]/)
            if (distanceMatch) {
              newEventData.distances = distanceMatch[1]
                .split(',')
                .map(d => d.trim().replace(/^["']|["']$/g, ''))
                .filter(d => d.length > 0)
            }
            break
        }
      })
      
      // Actualizar descripción desde el contenido
      newEventData.description = contentLines.join('\n').trim()
      
      setEventData(newEventData)
      setSaveResult({
        success: true,
        message: 'Evento actualizado desde markdown'
      })
    } catch (error) {
      setSaveResult({
        error: true,
        message: 'Error al parsear markdown: ' + (error instanceof Error ? error.message : 'Error desconocido')
      })
    }
  }

  useEffect(() => {
    if (eventData && showMarkdownPreview) {
      setMarkdownContent(generateMarkdownContent())
    }
  }, [eventData, showMarkdownPreview])

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="text-center">Cargando evento...</div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Eventos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Eventos
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Evento</h1>
            <p className="text-muted-foreground">
              Modificar información del evento: {eventData.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={eventData.status === 'published' ? 'default' : 'outline'}>
            {eventData.status === 'published' ? 'Publicado' : 
             eventData.status === 'draft' ? 'Borrador' : 'Cancelado'}
          </Badge>
        </div>
      </div>

      {/* Save Result */}
      {saveResult && (
        <div className={`border rounded-lg p-4 ${saveResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <p className={saveResult.error ? "text-red-700" : "text-green-700"}>
            {saveResult.message}
          </p>
        </div>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información del Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del Evento *</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha del Evento *</Label>
              <Input
                id="date"
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData(prev => prev ? { ...prev, date: e.target.value } : null)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio *</Label>
              <Input
                id="municipality"
                value={eventData.municipality}
                onChange={(e) => setEventData(prev => prev ? { ...prev, municipality: e.target.value } : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Departamento *</Label>
              <Select 
                value={eventData.department} 
                onValueChange={(value) => setEventData(prev => prev ? { ...prev, department: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizador</Label>
              <Input
                id="organizer"
                value={eventData.organizer}
                onChange={(e) => setEventData(prev => prev ? { ...prev, organizer: e.target.value } : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={eventData.website}
                onChange={(e) => setEventData(prev => prev ? { ...prev, website: e.target.value } : null)}
              />
            </div>
          </div>

          {/* Category and Fee */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={eventData.category} 
                onValueChange={(value) => setEventData(prev => prev ? { ...prev, category: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationFee">Costo de Inscripción</Label>
              <Input
                id="registrationFee"
                value={eventData.registrationFee}
                onChange={(e) => setEventData(prev => prev ? { ...prev, registrationFee: e.target.value } : null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altitude">Altitud</Label>
              <Input
                id="altitude"
                placeholder="2640m"
                value={eventData.altitude}
                onChange={(e) => setEventData(prev => prev ? { ...prev, altitude: e.target.value } : null)}
              />
            </div>
          </div>

          {/* Distances */}
          <div className="space-y-2">
            <Label>Distancias Disponibles</Label>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map(distance => (
                <Badge
                  key={distance}
                  variant={
                    (eventData.distances || []).some(d => d.toLowerCase() === distance.toLowerCase()) 
                    ? "default" 
                    : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleDistanceToggle(distance)}
                >
                  {distance}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Evento</Label>
            <Textarea
              id="description"
              rows={6}
              value={eventData.description}
              onChange={(e) => setEventData(prev => prev ? { ...prev, description: e.target.value } : null)}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover">URL de Imagen de Portada</Label>
            <Input
              id="cover"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={eventData.cover}
              onChange={(e) => setEventData(prev => prev ? { ...prev, cover: e.target.value } : null)}
            />
            {eventData.cover && (
              <div className="mt-2 border rounded-md p-2">
                <p className="text-xs text-muted-foreground mb-1">Vista previa de imagen:</p>
                <img 
                  src={eventData.cover} 
                  alt="Vista previa de portada" 
                  className="h-24 object-cover rounded"
                  onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Error+cargando+imagen'}
                />
              </div>
            )}
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-1">
              <Label className="text-base font-medium">Estado del Evento</Label>
              <p className="text-sm text-muted-foreground">
                {eventData.status === 'published' 
                  ? 'El evento está publicado y visible para los usuarios' 
                  : 'El evento está en borrador y no es visible públicamente'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-switch" className="text-sm font-normal">
                Borrador
              </Label>
              <Switch
                id="status-switch"
                checked={eventData.status === 'published'}
                onCheckedChange={(checked) => {
                  const newStatus = checked ? 'published' : 'draft'
                  setEventData(prev => prev ? { ...prev, status: newStatus } : null)
                }}
              />
              <Label htmlFor="status-switch" className="text-sm font-normal">
                Publicado
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Button onClick={enhanceWithAI} disabled={isGenerating || !eventData} variant="outline">
              {isGenerating ? (
                <>🔄 Generando...</>
              ) : (
                <>🤖 Enriquecer con IA</>
              )}
            </Button>

            <Button 
              onClick={() => setShowMarkdownPreview(!showMarkdownPreview)} 
              variant="outline"
              disabled={!eventData}
            >
              📝 {showMarkdownPreview ? 'Ocultar' : 'Ver'} Markdown
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>

            {eventData.status !== 'published' && (
              <Button
                onClick={handlePublish}
                disabled={isSaving}
                variant="secondary"
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {isSaving ? 'Publicando...' : 'Publicar Evento'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {generatedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contenido Enriquecido con IA</span>
              <div className="flex gap-2">
                <Button onClick={applyEnhancedContent} size="sm">
                  Aplicar al Evento
                </Button>
                <Button onClick={() => setGeneratedEvent('')} variant="outline" size="sm">
                  Descartar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm overflow-auto max-h-96">
              {generatedEvent}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Markdown Preview */}
      {showMarkdownPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vista Previa de Markdown</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => updateEventFromMarkdown(markdownContent)} 
                  size="sm"
                  disabled={!markdownContent.trim()}
                >
                  ⬆️ Aplicar Cambios
                </Button>
                <Button onClick={() => setShowMarkdownPreview(false)} variant="outline" size="sm">
                  Cerrar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Edita directamente el frontmatter y contenido markdown. Los cambios se aplicarán al formulario cuando hagas clic en "Aplicar Cambios".</p>
            </div>
            <Textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder={`---
title: "Nombre del evento"
eventDate: "2024-12-01"
municipality: "Ciudad"
department: "Departamento"
organizer: "Organizador"
category: "Running"
draft: false
distances: ["5k", "10k"]
website: "https://ejemplo.com"
registrationFeed: "$50.000"
altitude: "2640m"
cover: "https://ejemplo.com/imagen.jpg"
snippet: "Descripción corta del evento..."
tags: ["running", "ciudad"]
publishDate: "2024-08-04"
author: "Luis Hincapie"
---

Descripción completa del evento en markdown.

## Detalles del Evento

- **Fecha**: Información sobre la fecha
- **Lugar**: Información sobre el lugar
- **Inscripciones**: Información sobre inscripciones

## Distancias

Información sobre las distancias disponibles.

## Premios

Información sobre premios y reconocimientos.`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}