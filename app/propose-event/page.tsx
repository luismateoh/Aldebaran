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
import { NaturalDatePicker } from '@/components/natural-date-picker'
import { MunicipalityAutocomplete } from '@/components/municipality-autocomplete'
import { toast } from "sonner"

export default function ProposeEventPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    eventDate: '',
    municipality: '',
    department: '',
    organizer: '',
    website: '',
    description: '',
    distances: [] as string[],
    registrationFee: '',
    category: 'Running',
    submittedBy: '',
    submitterEmail: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

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
      toast.error('Por favor complete todos los campos obligatorios (título, fecha, municipio y departamento)')
      return
    }

    if (formData.distances.length === 0) {
      toast.error('Por favor seleccione al menos una distancia')
      return
    }

    setIsSubmitting(true)

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
        toast.success(result.message || 'Propuesta enviada exitosamente. Será revisada por nuestro equipo.')
        
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
        toast.error(result.error || 'Error enviando propuesta')
      }
    } catch (error) {
      toast.error('Error de conexión. Por favor intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Proponer Nuevo Evento</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          ¿Conoces un evento de atletismo que debería estar en Aldebaran? Compártelo con la comunidad y ayúdanos a mantener actualizado el calendario más completo de Colombia.
        </p>
        
        {/* Benefits Cards */}
        <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary">
              <Users className="size-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Para la Comunidad</h3>
            <p className="text-sm text-muted-foreground">Tu propuesta ayuda a miles de corredores</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary">
              <Zap className="size-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Revisión Rápida</h3>
            <p className="text-sm text-muted-foreground">Revisamos y publicamos en 24-48 horas</p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary">
              <CheckCircle className="size-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Siempre Actualizado</h3>
            <p className="text-sm text-muted-foreground">Información verificada y confiable</p>
          </div>
        </div>
      </div>

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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              
              <NaturalDatePicker
                label="Fecha del Evento"
                value={formData.eventDate}
                onChange={(value) => setFormData(prev => ({ ...prev, eventDate: value }))}
                placeholder="Ej: mañana, próximo sábado, 15 de marzo"
                required
                helpText="El evento se realizará el"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MunicipalityAutocomplete
                value={formData.municipality}
                onChange={(value) => setFormData(prev => ({ ...prev, municipality: value }))}
                onDepartmentChange={(department) => setFormData(prev => ({ ...prev, department }))}
                department={formData.department}
                placeholder="Ej: Medellín"
                required
                label="Municipio"
                id="municipality"
              />
              
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value, municipality: '' }))}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <p className="mb-3 text-sm text-muted-foreground">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  Te contactaremos si necesitamos más información y te notificaremos cuando tu evento sea aprobado y publicado
                </p>
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex gap-4 border-t pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Send className="mr-2 size-4" />
                {isSubmitting ? 'Enviando Propuesta...' : 'Enviar Propuesta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Process Information - Timeline */}
      <div className="rounded-lg border p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary">
            <Rocket className="size-5 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">¿Qué pasa después?</h3>
        </div>
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute inset-y-0 left-3 w-0.5 bg-border"></div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</div>
              <div>
                <h4 className="font-semibold text-foreground">Revisión</h4>
                <p className="text-sm text-muted-foreground">Verificamos la información en 24-48 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</div>
              <div>
                <h4 className="font-semibold text-foreground">Aprobación</h4>
                <p className="text-sm text-muted-foreground">Te enviamos un email cuando tu propuesta sea aprobada</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</div>
              <div>
                <h4 className="font-semibold text-foreground">Publicación</h4>
                <p className="text-sm text-muted-foreground">Te enviamos el enlace directo cuando tu evento esté publicado</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</div>
              <div>
                <h4 className="font-semibold text-foreground">Comunidad</h4>
                <p className="text-sm text-muted-foreground">Miles de corredores lo descubren</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}