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
import { NaturalDatePicker } from '@/components/natural-date-picker'
import { MunicipalityAutocomplete } from '@/components/municipality-autocomplete'
import { getAltitude } from '@/lib/colombia-altitudes'
import { toast } from "sonner"

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
  altitude: string
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
    cover: '',
    altitude: ''
  })
  
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
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

  // Handle municipality change and auto-set altitude
  const handleMunicipalityChange = (municipality: string) => {
    setFormData(prev => ({ ...prev, municipality }))
    
    // Auto-set altitude if municipality and department are available
    if (municipality && formData.department) {
      const altitude = getAltitude(municipality, formData.department)
      if (altitude) {
        setFormData(prev => ({ ...prev, altitude: `${altitude}m` }))
      }
    }
  }

  // Handle department change and auto-set altitude
  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department }))
    
    // Auto-set altitude if municipality and department are available
    if (formData.municipality && department) {
      const altitude = getAltitude(formData.municipality, department)
      if (altitude) {
        setFormData(prev => ({ ...prev, altitude: `${altitude}m` }))
      }
    }
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
      ...(aiEventData.altitude && { altitude: aiEventData.altitude }),
    }))
    
    // Auto-set altitude if municipality and department are provided from AI
    if (aiEventData.municipality && aiEventData.department) {
      const altitude = getAltitude(aiEventData.municipality, aiEventData.department)
      if (altitude) {
        setFormData(prev => ({ ...prev, altitude: `${altitude}m` }))
      }
    }
    
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
        cover: '',
        altitude: ''
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
        altitude: formData.altitude || '1000m', // Use form altitude or default
        tags: [formData.category.toLowerCase()],
        status: 'published' as const,
        featured: false
      }

      const result = await eventsService.createEvent(eventData)
      
      toast.success(`Evento creado exitosamente en Firebase (ID: ${result.id})`)

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
        cover: '',
        altitude: ''
      })
    } catch (error) {
      toast.error(`Error al crear evento en Firebase: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsCommitting(false)
    }
  }
  
  return (
    <div className={isPublic ? "" : "container mx-auto max-w-4xl py-8"}>
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

              {/* Información Básica */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del Evento *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Maratón de Bogotá"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <NaturalDatePicker
                  label="Fecha del Evento"
                  value={formData.eventDate}
                  onChange={(value) => setFormData(prev => ({ ...prev, eventDate: value }))}
                  placeholder="Ej: mañana, próximo sábado, 15 de marzo"
                  required
                  helpText="El evento se realizará el"
                />
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MunicipalityAutocomplete
                  value={formData.municipality}
                  onChange={handleMunicipalityChange}
                  onDepartmentChange={handleDepartmentChange}
                  department={formData.department}
                  placeholder="Escriba el nombre del municipio"
                  required
                  label="Municipio"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Select value={formData.department} onValueChange={handleDepartmentChange}>
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

                <div className="space-y-2">
                  <Label htmlFor="altitude">Altitud</Label>
                  <Input
                    id="altitude"
                    placeholder="Ej: 2600m"
                    value={formData.altitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                    className="bg-muted"
                    title="Se completa automáticamente al seleccionar municipio"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se completa automáticamente al seleccionar el municipio
                  </p>
                </div>
              </div>
              
              {/* Organización */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-5 text-green-500" />
                          <span className="font-medium text-green-700">¡Propuesta enviada exitosamente!</span>
                        </div>
                        <p className="mt-1 text-sm text-green-600">
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