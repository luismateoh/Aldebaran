'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Calendar, MapPin, User, Globe, Users, Zap, CheckCircle, Rocket } from 'lucide-react'

interface EventFormData {
  title: string
  eventDate: string
  municipality: string
  department: string
  organizer: string
  website: string
  description: string
  distances: string[]
  registrationFee: string
  category: string
  submittedBy: string
  submitterEmail: string
}

export default function PublicEventForm() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    eventDate: '',
    municipality: '',
    department: '',
    organizer: '',
    website: '',
    description: '',
    distances: [],
    registrationFee: '',
    category: 'Running',
    submittedBy: '',
    submitterEmail: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{success?: boolean, message: string} | null>(null)

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

  const handleDistanceToggle = (distance: string) => {
    const currentDistances = formData.distances
    let newDistances
    
    if (currentDistances.includes(distance)) {
      newDistances = currentDistances.filter(d => d !== distance)
    } else {
      newDistances = [...currentDistances, distance]
    }
    
    setFormData(prev => ({ ...prev, distances: newDistances }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones básicas
    if (!formData.title || !formData.eventDate || !formData.municipality || !formData.department) {
      setSubmitResult({
        success: false,
        message: 'Por favor complete todos los campos obligatorios (título, fecha, municipio y departamento)'
      })
      return
    }

    if (formData.distances.length === 0) {
      setSubmitResult({
        success: false,
        message: 'Por favor seleccione al menos una distancia'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: result.message || 'Propuesta enviada exitosamente. Será revisada por nuestro equipo.'
        })
        
        // Limpiar formulario
        setFormData({
          title: '',
          eventDate: '',
          municipality: '',
          department: '',
          organizer: '',
          website: '',
          description: '',
          distances: [],
          registrationFee: '',
          category: 'Running',
          submittedBy: '',
          submitterEmail: ''
        })
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Error enviando propuesta'
        })
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Error de conexión. Por favor intente nuevamente.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Submit Result */}
      {submitResult && (
        <div className={`border rounded-lg p-4 ${
          submitResult.success 
            ? "border-border bg-muted text-foreground" 
            : "border-destructive bg-destructive/10 text-destructive"
        }`}>
          <p>{submitResult.message}</p>
          {submitResult.success && (
            <div className="mt-3 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/')}
              >
                Ver Eventos
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  setSubmitResult(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Proponer Otro Evento
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Proposal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Información del Evento Propuesto
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Llena todos los campos posibles. Tu propuesta será revisada por nuestro equipo antes de ser publicada.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre del Evento *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Maratón de Bogotá 2024"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventDate">Fecha del Evento *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="municipality">Municipio *</Label>
                <Input
                  id="municipality"
                  required
                  value={formData.municipality}
                  onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                  placeholder="Ej: Medellín"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione departamento" />
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
                  value={formData.organizer}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Ej: Club Deportivo XYZ"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web del Evento</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>

            {/* Category and Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                  value={formData.registrationFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: e.target.value }))}
                  placeholder="Ej: $50.000"
                />
              </div>
            </div>

            {/* Distances */}
            <div className="space-y-2">
              <Label>Distancias Disponibles *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Seleccione al menos una distancia que estará disponible en el evento
              </p>
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
              {formData.distances.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Distancias seleccionadas: {formData.distances.join(', ')}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Evento</Label>
              <Textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describa el evento, su historia, recorrido, premios, y cualquier información relevante..."
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submittedBy">Su Nombre</Label>
                <Input
                  id="submittedBy"
                  value={formData.submittedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, submittedBy: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="submitterEmail">Su Email (opcional)</Label>
                <Input
                  id="submitterEmail"
                  type="email"
                  value={formData.submitterEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, submitterEmail: e.target.value }))}
                  placeholder="juan@ejemplo.com"
                />
                <p className="text-xs text-muted-foreground">
                  Para contactarle en caso de necesitar más información
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Send className="size-4 mr-2" />
                {isSubmitting ? 'Enviando Propuesta...' : 'Enviar Propuesta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}