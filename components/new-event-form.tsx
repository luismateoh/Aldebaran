'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import emailjs from '@emailjs/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, ChevronUp, Edit } from 'lucide-react'
import { eventsService } from '@/lib/events-firebase'
import AIEventSearch from '@/components/ai-event-search'

interface EventFormData {
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  registrationUrl: string
  description: string
  distances: string[]
  price: string
  category: string
  cover: string
}

interface NewEventFormProps {
  isPublic?: boolean
}

export default function NewEventForm({ isPublic = false }: NewEventFormProps) {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    eventDate: '',
    municipality: '',
    department: '',
    organizer: '',
    registrationUrl: '',
    description: '',
    distances: [],
    price: '',
    category: 'Running',
    cover: ''
  })
  
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [commitResult, setCommitResult] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<{field: string, message: string}[]>([])
  const [showManualForm, setShowManualForm] = useState(false)
  
  const departments = [
    'Antioquia', 'Atlántico', 'Bogotá', 'Bolívar', 'Boyacá', 'Caldas', 
    'Caquetá', 'Cauca', 'Cesar', 'Córdoba', 'Cundinamarca', 'Chocó',
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander',
    'Quindío', 'Risaralda', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca'
  ]
  
  const categories = ['Running', 'Trail', 'Maraton', 'Media maraton', 'Ultra', 'Kids']
  const distanceOptions = ['1k', '2k', '3k', '5k', '8k', '10k', '15k', '21k', '25k', '30k', '42k', '50k', '100k']

  // Load template from URL parameters (only for admin)
  useEffect(() => {
    if (isPublic) return
    
    const templateTitle = searchParams.get('title')
    const templateCategory = searchParams.get('category')
    const templateDistances = searchParams.get('distances')
    const templatePrice = searchParams.get('price')
    const templateDescription = searchParams.get('description')

    if (templateTitle || templateCategory) {
      setFormData(prev => ({
        ...prev,
        title: templateTitle || prev.title,
        category: templateCategory || prev.category,
        distances: templateDistances ? templateDistances.split(',') : prev.distances,
        price: templatePrice || prev.price,
        description: templateDescription || prev.description
      }))
    }
  }, [searchParams, isPublic])

  // Validation function
  const validateForm = (): {field: string, message: string}[] => {
    const errors: {field: string, message: string}[] = []
    
    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'El título es obligatorio' })
    } else if (formData.title.length < 10) {
      errors.push({ field: 'title', message: 'El título debe tener al menos 10 caracteres' })
    }
    
    if (!formData.eventDate) {
      errors.push({ field: 'eventDate', message: 'La fecha del evento es obligatoria' })
    } else {
      const eventDate = new Date(formData.eventDate)
      const today = new Date()
      if (eventDate <= today) {
        errors.push({ field: 'eventDate', message: 'La fecha debe ser futura' })
      }
    }
    
    if (!formData.municipality.trim()) {
      errors.push({ field: 'municipality', message: 'El municipio es obligatorio' })
    }
    
    if (!formData.department) {
      errors.push({ field: 'department', message: 'El departamento es obligatorio' })
    }
    
    if (formData.distances.length === 0) {
      errors.push({ field: 'distances', message: 'Debe seleccionar al menos una distancia' })
    }
    
    return errors
  }
  
  const handleDistanceToggle = (distance: string) => {
    setFormData(prev => ({
      ...prev,
      distances: prev.distances.includes(distance)
        ? prev.distances.filter(d => d !== distance)
        : [...prev.distances, distance]
    }))
  }

  // Handle AI search results
  const handleAIEventFound = (aiEventData: Partial<EventFormData>) => {
    setFormData(prev => ({
      ...prev,
      // Only update fields that have actual data from AI
      ...(aiEventData.title && { title: aiEventData.title }),
      ...(aiEventData.eventDate && { eventDate: aiEventData.eventDate }),
      ...(aiEventData.municipality && { municipality: aiEventData.municipality }),
      ...(aiEventData.department && { department: aiEventData.department }),
      ...(aiEventData.organizer && { organizer: aiEventData.organizer }),
      ...(aiEventData.registrationUrl && { registrationUrl: aiEventData.registrationUrl }),
      ...(aiEventData.description && { description: aiEventData.description }),
      ...(aiEventData.distances && aiEventData.distances.length > 0 && { distances: aiEventData.distances }),
      ...(aiEventData.price && { price: aiEventData.price }),
      ...(aiEventData.category && { category: aiEventData.category }),
      ...(aiEventData.cover && { cover: aiEventData.cover }),
    }))
    
    // Clear validation errors when AI fills the form
    setValidationErrors([])
    
    // Show the manual form automatically when AI finds data
    setShowManualForm(true)
  }

  const sendEventByEmail = async () => {
    setIsSending(true)
    try {
      if (isPublic) {
        // Versión pública: enviar por email
        const templateParams = {
          event_title: formData.title,
          event_date: formData.eventDate,
          municipality: formData.municipality,
          department: formData.department,
          organizer: formData.organizer || 'No especificado',
          website: formData.registrationUrl || 'No especificado',
          description: formData.description || 'Sin descripción',
          distances: formData.distances.join(', ') || 'No especificadas',
          registration_fee: formData.price || 'No especificado',
          category: formData.category,
          cover_image: formData.cover || 'Sin imagen',
          submitted_at: new Date().toLocaleString('es-CO')
        }

        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
        )
        
        setEmailSent(true)
      } else {
        // En desarrollo, simular envío
        console.log('📧 Simulando envío de email:', formData)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setEmailSent(true)
      }
      
      // Limpiar formulario después del envío exitoso
      setFormData({
        title: '',
        eventDate: '',
        municipality: '',
        department: '',
        organizer: '',
        registrationUrl: '',
        description: '',
        distances: [],
        price: '',
        category: 'Running',
        cover: ''
      })
    } catch (error) {
      console.error('Error sending proposal:', error)
      alert('Error al enviar la propuesta. Por favor intenta de nuevo.')
    } finally {
      setIsSending(false)
    }
  }
  
  const createEventInFirebase = async () => {
    setIsCommitting(true)
    setCommitResult(null)

    try {
      const eventData = {
        title: formData.title,
        eventDate: formData.eventDate,
        municipality: formData.municipality,
        department: formData.department,
        organizer: formData.organizer,
        registrationUrl: formData.registrationUrl,
        description: formData.description,
        distances: formData.distances,
        price: formData.price,
        category: formData.category,
        cover: formData.cover,
        altitude: '1000m', // Valor por defecto
        tags: [formData.category.toLowerCase()],
        status: 'published' as const,
        featured: false
      }

      const result = await eventsService.createEvent(eventData)
      
      setCommitResult({
        success: true,
        message: 'Evento creado exitosamente en Firebase',
        eventId: result.id
      })

      // Limpiar formulario después del commit exitoso
      setFormData({
        title: '',
        eventDate: '',
        municipality: '',
        department: '',
        organizer: '',
        registrationUrl: '',
        description: '',
        distances: [],
        price: '',
        category: 'Running',
        cover: ''
      })
    } catch (error) {
      setCommitResult({
        success: false,
        error: 'Error al crear evento en Firebase',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsCommitting(false)
    }
  }
  
  return (
    <div className={isPublic ? "" : "container max-w-4xl mx-auto py-8"}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-6" />
            {isPublic ? 'Proponer Evento de Atletismo' : 'Crear Nuevo Evento de Atletismo'}
          </CardTitle>
          <CardDescription>
            {isPublic 
              ? 'Comparte la información del evento y lo revisaremos para publicarlo'
              : 'Completa la información y crea el evento directamente en Firebase'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Event Search (solo para admin) */}
          {!isPublic && (
            <div className="space-y-4">
              <AIEventSearch onEventFound={handleAIEventFound} />
              
              {/* Control button for manual form */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant={showManualForm ? "outline" : "default"}
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="flex items-center gap-2"
                >
                  {showManualForm ? (
                    <>
                      <ChevronUp className="size-4" />
                      Ocultar Formulario Manual
                    </>
                  ) : (
                    <>
                      <Edit className="size-4" />
                      Crear Evento Manualmente
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Manual Form Section */}
          {(isPublic || showManualForm) && (
            <div className="space-y-6">
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
                    {commitResult.error ? 'Error al Crear Evento' : 'Evento Creado Exitosamente'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    commitResult.error 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {commitResult.message || commitResult.error}
                  </p>
                  {commitResult.eventId && (
                    <p className="text-xs mt-2 text-green-600">
                      ID del evento: {commitResult.eventId}
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

              {/* Imagen del evento */}
              <div className="space-y-2">
                <Label htmlFor="cover">URL de la Imagen del Evento</Label>
                <Input
                  id="cover"
                  placeholder="https://ejemplo.com/imagen-evento.jpg"
                  value={formData.cover}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover: e.target.value }))}
                />
              </div>
              
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
                  <Label htmlFor="registrationUrl">Sitio Web / Inscripciones</Label>
                  <Input
                    id="registrationUrl"
                    placeholder="https://ejemplo.com"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationUrl: e.target.value }))}
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
                  <Label htmlFor="price">Costo de Inscripción</Label>
                  <Input
                    id="price"
                    placeholder="$50.000"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
              
              {/* Acciones */}
              <div className="space-y-4">
                {isPublic ? (
                  // Versión pública: solo envío por email
                  <div className="space-y-4">
                    {emailSent ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-5 text-green-500" />
                          <span className="text-green-700 font-medium">¡Propuesta enviada exitosamente!</span>
                        </div>
                        <p className="text-green-600 text-sm mt-1">
                          Tu propuesta se envió por email. La revisaremos y publicaremos en 24-48 horas.
                        </p>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          const errors = validateForm()
                          if (errors.length > 0) {
                            setValidationErrors(errors)
                            return
                          }
                          setValidationErrors([])
                          sendEventByEmail()
                        }} 
                        disabled={isSending}
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
                  // Versión admin: crear directamente en Firebase
                  <div className="space-y-4">
                    <Button 
                      onClick={() => {
                        const errors = validateForm()
                        if (errors.length > 0) {
                          setValidationErrors(errors)
                          return
                        }
                        setValidationErrors([])
                        createEventInFirebase()
                      }} 
                      disabled={isCommitting}
                      className="w-full"
                    >
                      {isCommitting ? (
                        <>🔄 Creando Evento...</>
                      ) : (
                        <>🔥 Crear Evento en Firebase</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}