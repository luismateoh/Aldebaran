'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, DollarSign, Globe, Users, Image as ImageIcon, Download, CheckCircle, AlertCircle } from 'lucide-react'

interface EventFormData {
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  website: string
  description: string
  distances: string[]
  registrationFeed: string
  category: string
  coverImage: string // Nueva propiedad para imagen
}

interface ImageOptimizationResult {
  success: boolean
  originalUrl: string
  optimizedUrl?: string
  originalSize?: number
  optimizedSize?: number
  compressionRatio?: number
  error?: string
}

interface NewEventFormProps {
  isPublic?: boolean
}

export default function NewEventForm({ isPublic = false }: NewEventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    eventDate: '',
    municipality: '',
    department: '',
    organizer: '',
    website: '',
    description: '',
    distances: [],
    registrationFeed: '',
    category: 'Running',
    coverImage: '' // Inicializar nueva propiedad
  })
  
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [commitResult, setCommitResult] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEvent, setGeneratedEvent] = useState<string>('')
  
  // Estados para optimización de imágenes
  const [isOptimizingImage, setIsOptimizingImage] = useState(false)
  const [imageOptimizationResult, setImageOptimizationResult] = useState<ImageOptimizationResult | null>(null)
  const [optimizedImageUrl, setOptimizedImageUrl] = useState<string>('')
  
  // Detectar si estamos en desarrollo o producción
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const departments = [
    'Antioquia', 'Atlántico', 'Bogotá', 'Bolívar', 'Boyacá', 'Caldas', 
    'Caquetá', 'Cauca', 'Cesar', 'Córdoba', 'Cundinamarca', 'Chocó',
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander',
    'Quindío', 'Risaralda', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca'
  ]
  
  const categories = ['Running', 'Trail', 'Maraton', 'Media maraton', 'Ultra', 'Kids']
  const distanceOptions = ['1k', '2k', '3k', '5k', '8k', '10k', '15k', '21k', '25k', '30k', '42k', '50k', '100k']
  
  const handleDistanceToggle = (distance: string) => {
    setFormData(prev => ({
      ...prev,
      distances: prev.distances.includes(distance)
        ? prev.distances.filter(d => d !== distance)
        : [...prev.distances, distance]
    }))
  }
  
  // Función para optimizar imagen automáticamente
  const optimizeImage = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.startsWith('http')) {
      setImageOptimizationResult({
        success: false,
        originalUrl: imageUrl,
        error: 'URL de imagen inválida'
      })
      return
    }

    setIsOptimizingImage(true)
    setImageOptimizationResult(null)

    try {
      // Generar eventId temporal basado en los datos actuales
      const eventId = `${formData.eventDate || 'temp'}_${formData.municipality?.toLowerCase() || 'unknown'}_${formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'event'}`

      const response = await fetch('/api/optimize-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl,
          eventId
        })
      })

      const result = await response.json()

      if (result.success) {
        setImageOptimizationResult({
          success: true,
          originalUrl: imageUrl,
          optimizedUrl: result.optimizedUrl,
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          compressionRatio: result.compressionRatio
        })
        setOptimizedImageUrl(result.optimizedUrl)
        console.log('✅ Imagen optimizada correctamente:', result)
      } else {
        setImageOptimizationResult({
          success: false,
          originalUrl: imageUrl,
          error: result.error || 'Error desconocido'
        })
      }
    } catch (error) {
      console.error('❌ Error optimizando imagen:', error)
      setImageOptimizationResult({
        success: false,
        originalUrl: imageUrl,
        error: error instanceof Error ? error.message : 'Error de conexión'
      })
    } finally {
      setIsOptimizingImage(false)
    }
  }

  // Función para manejar cambio en URL de imagen
  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, coverImage: url }))
    
    // Reset estados de optimización
    setImageOptimizationResult(null)
    setOptimizedImageUrl('')
    
    // Si la URL es válida, optimizar automáticamente después de 1 segundo
    if (url && url.startsWith('http')) {
      setTimeout(() => {
        optimizeImage(url)
      }, 1000)
    }
  }

  const sendEventByEmail = async () => {
    setIsSending(true)
    try {
      if (isPublic) {
        // Versión pública: guardar propuesta en Postgres
        const response = await fetch('/api/hybrid-storage', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer public-form-token'
          },
          body: JSON.stringify({
            action: 'create_proposal',
            proposal: {
              ...formData,
              // Usar imagen optimizada si está disponible
              coverImage: optimizedImageUrl || formData.coverImage,
              submittedBy: 'public_form',
              userAgent: navigator.userAgent
            }
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Propuesta guardada en Postgres:', result.proposalId)
          setEmailSent(true)
        } else {
          throw new Error('Error al guardar propuesta')
        }
      } else if (isDevelopment) {
        // En desarrollo, simular envío
        console.log('📧 Simulando envío de email:', {
          ...formData,
          coverImage: optimizedImageUrl || formData.coverImage
        })
        await new Promise(resolve => setTimeout(resolve, 1500))
        setEmailSent(true)
      } else {
        // En producción admin, usar EmailJS como fallback
        const templateParams = {
          event_title: formData.title,
          event_date: formData.eventDate,
          municipality: formData.municipality,
          department: formData.department,
          organizer: formData.organizer || 'No especificado',
          website: formData.website || 'No especificado',
          description: formData.description || 'Sin descripción',
          distances: formData.distances.join(', ') || 'No especificadas',
          registration_fee: formData.registrationFeed || 'No especificado',
          category: formData.category,
          cover_image: optimizedImageUrl || formData.coverImage || 'Sin imagen',
          submitted_at: new Date().toLocaleString('es-CO')
        }

        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_default',
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_default',
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'public_key_default'
        )
        
        setEmailSent(true)
      }
      
      // Limpiar formulario después del envío exitoso
      setFormData({
        title: '',
        eventDate: '',
        municipality: '',
        department: '',
        organizer: '',
        website: '',
        description: '',
        distances: [],
        registrationFeed: '',
        category: 'Running',
        coverImage: ''
      })
      setImageOptimizationResult(null)
      setOptimizedImageUrl('')
    } catch (error) {
      console.error('Error sending proposal:', error)
      alert('Error al enviar la propuesta. Por favor intenta de nuevo.')
    } finally {
      setIsSending(false)
    }
  }
  
  const commitToGitHub = async () => {
    setIsCommitting(true)
    setCommitResult(null)

    try {
      const { markdown } = generateMarkdown()
      const token = localStorage.getItem('admin_token') || 'bypass-token'
      
      const response = await fetch('/api/github/create-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventData: formData,
          markdown: markdown
        })
      })

      const result = await response.json()
      setCommitResult(result)

      if (result.success) {
        // Limpiar formulario después del commit exitoso
        setFormData({
          title: '',
          eventDate: '',
          municipality: '',
          department: '',
          organizer: '',
          website: '',
          description: '',
          distances: [],
          registrationFeed: '',
          category: 'Running',
          coverImage: ''
        })
      }
    } catch (error) {
      setCommitResult({
        error: 'Error al crear evento en GitHub',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsCommitting(false)
    }
  }

  // Nueva función para crear evento con sistema híbrido
  const createEventHybrid = async () => {
    setIsCommitting(true)
    setCommitResult(null)

    try {
      const { markdown } = generateMarkdown()
      const token = localStorage.getItem('admin_token') || 'bypass-token'
      
      const response = await fetch('/api/hybrid-storage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_event',
          eventData: {
            eventId: `${formData.eventDate}_${formData.municipality.toLowerCase()}_${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            title: formData.title.toUpperCase(),
            slug: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category: formData.category,
            snippet: formData.description,
            eventDate: new Date(formData.eventDate),
            municipality: formData.municipality,
            department: formData.department,
            organizer: formData.organizer,
            website: formData.website,
            registrationFee: formData.registrationFeed,
            distances: formData.distances,
            tags: [formData.category.toLowerCase()],
          },
          markdownContent: markdown
        })
      })

      const result = await response.json()
      setCommitResult(result)

      if (result.success) {
        // Limpiar formulario después del commit exitoso
        setFormData({
          title: '',
          eventDate: '',
          municipality: '',
          department: '',
          organizer: '',
          website: '',
          description: '',
          distances: [],
          registrationFeed: '',
          category: 'Running',
          coverImage: ''
        })
      }
    } catch (error) {
      setCommitResult({
        error: 'Error al crear evento con sistema híbrido',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsCommitting(false)
    }
  }

  // Simplificar función para crear solo drafts
  const createEventDraft = async () => {
    setIsCommitting(true)
    setCommitResult(null)

    try {
      const token = localStorage.getItem('admin_token') || 'bypass-token'
      
      const response = await fetch('/api/hybrid-storage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_event',
          eventData: {
            eventId: `${formData.eventDate}_${formData.municipality.toLowerCase()}_${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            title: formData.title.toUpperCase(),
            date: formData.eventDate,
            municipality: formData.municipality,
            department: formData.department,
            organizer: formData.organizer,
            category: formData.category,
            status: 'draft', // Siempre crear como draft
            distances: formData.distances,
            website: formData.website,
            registrationFee: formData.registrationFeed,
            description: formData.description,
            altitude: '',
            cover: optimizedImageUrl || formData.coverImage || '' // Usar imagen optimizada
          }
        })
      })

      const result = await response.json()
      setCommitResult(result)

      if (result.success) {
        // Limpiar formulario después del commit exitoso
        setFormData({
          title: '',
          eventDate: '',
          municipality: '',
          department: '',
          organizer: '',
          website: '',
          description: '',
          distances: [],
          registrationFeed: '',
          category: 'Running',
          coverImage: ''
        })
        setImageOptimizationResult(null)
        setOptimizedImageUrl('')
      }
    } catch (error) {
      setCommitResult({
        error: 'Error al crear borrador',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsCommitting(false)
    }
  }

  const generateMarkdown = () => {
    const date = new Date(formData.eventDate)
    const year = date.getFullYear()
    const month = date.toLocaleDateString('en', { month: 'short' }).toLowerCase()
    const day = date.getDate()
    
    const filename = `${year}-${month}-${day}_${formData.municipality.toLowerCase()}_${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    
    const markdown = `---
title: ${formData.title.toUpperCase()}
author: Luis Hincapie
publishDate: ${new Date().toISOString().split('T')[0]}
draft: false
category: ${formData.category}
tags:
  - ${formData.category.toLowerCase()}
snippet: ${formData.description}
altitude: 
eventDate: ${year}-${month}-${day}
organizer: ${formData.organizer}
registrationDeadline: ${year}-${month}-${day}
registrationFeed: ${formData.registrationFeed}
website: ${formData.website}
distances:
${formData.distances.map(d => `  - ${d}`).join('\n')}
cover: 
department: ${formData.department}
municipality: ${formData.municipality}
---

${formData.description}

## Información del Evento

**Fecha:** ${date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Lugar:** ${formData.municipality}, ${formData.department}
**Organizador:** ${formData.organizer}

## Distancias Disponibles

${formData.distances.map(d => `- ${d}`).join('\n')}

${formData.website ? `## Más Información\n\nVisita [${formData.website}](${formData.website}) para más detalles e inscripciones.` : ''}
`
    
    return { filename, markdown }
  }
  
  const downloadEvent = () => {
    const { filename, markdown } = generateMarkdown()
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const enhanceWithAI = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/enhance-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      setGeneratedEvent(result.markdown)
    } catch (error) {
      console.error('Error enhancing event:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className={isPublic ? "" : "container max-w-4xl mx-auto py-8"}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {isPublic ? 'Proponer Evento de Atletismo' : 'Crear Nuevo Evento de Atletismo'}
          </CardTitle>
          <CardDescription>
            {isPublic 
              ? 'Comparte la información del evento y lo revisaremos para publicarlo'
              : 'Completa la información básica y deja que la IA ayude a enriquecer los detalles'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resultado de commit (solo para admin) */}
          {!isPublic && commitResult && (
            <div className={`p-4 rounded-lg border ${
              commitResult.error 
                ? 'border-red-200 bg-red-50 dark:bg-red-950/20' 
                : 'border-green-200 bg-green-50 dark:bg-green-950/20'
            }`}>
              <h3 className={`font-medium ${
                commitResult.error 
                  ? 'text-red-900 dark:text-red-100' 
                  : 'text-green-900 dark:text-green-100'
              }`}>
                {commitResult.error ? 'Error al Publicar' : 'Evento Publicado Exitosamente'}
              </h3>
              <p className={`text-sm mt-1 ${
                commitResult.error 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {commitResult.message || commitResult.error}
              </p>
              {commitResult.filename && (
                <p className="text-xs mt-2 text-green-600">
                  Archivo creado: {commitResult.filename}
                </p>
              )}
            </div>
          )}

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del Evento *</Label>
              <Input
                id="title"
                placeholder="Ej: Maratón de Bogotá"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Fecha del Evento *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Nueva sección de imagen - solo para admin */}
          {!isPublic && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagen del Evento
                </Label>
                <Input
                  id="coverImage"
                  placeholder="https://ejemplo.com/imagen-evento.jpg"
                  value={formData.coverImage}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Pega la URL de una imagen y se descargará y optimizará automáticamente
                </p>
              </div>

              {/* Estado de optimización de imagen */}
              {(isOptimizingImage || imageOptimizationResult) && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    {isOptimizingImage && (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <div className="font-medium text-blue-700">Optimizando imagen...</div>
                          <div className="text-sm text-blue-600">Descargando, redimensionando y comprimiendo</div>
                        </div>
                      </div>
                    )}

                    {imageOptimizationResult && !isOptimizingImage && (
                      <div className={`flex items-start gap-3 ${
                        imageOptimizationResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {imageOptimizationResult.success ? (
                          <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">
                            {imageOptimizationResult.success ? 'Imagen optimizada correctamente' : 'Error al optimizar imagen'}
                          </div>
                          {imageOptimizationResult.success && (
                            <div className="text-sm space-y-1 mt-2">
                              <div>✅ Guardada en Blob Storage</div>
                              <div>📊 Tamaño original: {Math.round((imageOptimizationResult.originalSize || 0) / 1024)} KB</div>
                              <div>📉 Tamaño optimizado: {Math.round((imageOptimizationResult.optimizedSize || 0) / 1024)} KB</div>
                              <div>🎯 Compresión: {imageOptimizationResult.compressionRatio}%</div>
                            </div>
                          )}
                          {!imageOptimizationResult.success && (
                            <div className="text-sm text-red-600 mt-1">
                              {imageOptimizationResult.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview de imagen optimizada */}
                    {optimizedImageUrl && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Vista previa (optimizada):</div>
                        <img 
                          src={optimizedImageUrl} 
                          alt="Vista previa optimizada"
                          className="max-w-full h-32 object-cover rounded border"
                          onLoad={() => console.log('✅ Imagen optimizada cargada')}
                          onError={() => console.log('❌ Error cargando imagen optimizada')}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio *</Label>
              <Input
                id="municipality"
                placeholder="Ej: Bogotá"
                value={formData.municipality}
                onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Departamento *</Label>
              <Select value={formData.department} onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Organización */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizador</Label>
              <Input
                id="organizer"
                placeholder="Ej: IDRD, Alcaldía, Club..."
                value={formData.organizer}
                onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                placeholder="https://ejemplo.com"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Categoría y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category} onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value }))}>
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
              <Label htmlFor="registrationFeed">Costo de Inscripción</Label>
              <Input
                id="registrationFeed"
                placeholder="$50.000"
                value={formData.registrationFeed}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationFeed: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Distancias */}
          <div className="space-y-2">
            <Label>Distancias Disponibles</Label>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map(distance => (
                <Badge
                  key={distance}
                  variant={formData.distances.includes(distance) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleDistanceToggle(distance)}
                >
                  {distance}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Evento</Label>
            <Textarea
              id="description"
              placeholder="Describe el evento, su propósito, características especiales..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>
          
          {/* Acciones con IA restaurada */}
          <div className="space-y-4">
            {isPublic ? (
              // Versión pública: solo envío por email que se guarda en Postgres
              <div className="space-y-4">
                {emailSent ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-green-700 font-medium">¡Propuesta enviada exitosamente!</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      Tu propuesta se guardó en nuestra base de datos. La revisaremos y publicaremos en 24-48 horas.
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={sendEventByEmail} 
                    disabled={isSending || !formData.title || !formData.eventDate}
                    className="w-full"
                  >
                    {isSending ? (
                      <>📤 Enviando Propuesta...</>
                    ) : (
                      <>📧 Enviar Propuesta</>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              // Versión admin: crear drafts con IA
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={enhanceWithAI} disabled={isGenerating || !formData.title} variant="outline">
                    {isGenerating ? 'Generando...' : '🤖 Enriquecer con IA'}
                  </Button>
                  
                  <Button 
                    onClick={createEventDraft} 
                    disabled={isCommitting || !formData.title || !formData.eventDate}
                    className="flex-1"
                  >
                    {isCommitting ? (
                      <>🔄 Guardando...</>
                    ) : (
                      <>📝 Guardar como Borrador</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Preview restaurado - solo para admin */}
          {!isPublic && generatedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa Generada con IA</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {generatedEvent}
                </pre>
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => {
                      // Extraer descripción del markdown y aplicarla
                      const lines = generatedEvent.split('\n')
                      const frontmatterEnd = lines.findIndex((line, index) => index > 0 && line === '---')
                      const description = lines.slice(frontmatterEnd + 1).join('\n').trim()
                      setFormData(prev => ({ ...prev, description }))
                      setGeneratedEvent('')
                    }}
                    size="sm"
                  >
                    Aplicar al Formulario
                  </Button>
                  <Button onClick={() => setGeneratedEvent('')} variant="outline" size="sm">
                    Descartar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
