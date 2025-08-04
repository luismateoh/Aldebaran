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
import { Calendar, MapPin, Clock, DollarSign, Globe, Users } from 'lucide-react'

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
}

export default function NewEventForm() {
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
    category: 'Running'
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEvent, setGeneratedEvent] = useState<string>('')
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
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
  
  const sendEventByEmail = async () => {
    setIsSending(true)
    try {
      if (isDevelopment) {
        // En desarrollo, simular envío
        console.log('📧 Simulando envío de email:', formData)
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simular delay
        setEmailSent(true)
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
          category: 'Running'
        })
      } else {
        // En producción, usar EmailJS
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
          submitted_at: new Date().toLocaleString('es-CO')
        }

        // Configurar EmailJS (las keys van en variables de entorno)
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_default',
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_default',
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'public_key_default'
        )
        
        setEmailSent(true)
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
          category: 'Running'
        })
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error al enviar el evento. Por favor intenta de nuevo.')
    } finally {
      setIsSending(false)
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
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Crear Nuevo Evento de Atletismo
          </CardTitle>
          <CardDescription>
            Completa la información básica y deja que la IA ayude a enriquecer los detalles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          
          {/* Acciones */}
          <div className="space-y-4">
            {isDevelopment ? (
              // Modo desarrollo: IA + descarga
              <div className="flex gap-4">
                <Button onClick={enhanceWithAI} disabled={isGenerating || !formData.title}>
                  {isGenerating ? 'Generando...' : '🤖 Enriquecer con IA'}
                </Button>
                
                <Button className="bg-secondary text-secondary-foreground" onClick={downloadEvent} disabled={!formData.title}>
                  📥 Descargar Markdown
                </Button>
              </div>
            ) : (
              // Modo producción: envío por email
              <div className="space-y-4">
                {emailSent ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-green-700 font-medium">¡Evento enviado exitosamente!</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      El administrador revisará tu evento y lo publicará pronto.
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={sendEventByEmail} 
                    disabled={isSending || !formData.title || !formData.eventDate}
                    className="w-full"
                  >
                    {isSending ? (
                      <>📤 Enviando...</>
                    ) : (
                      <>📧 Enviar Evento para Revisión</>
                    )}
                  </Button>
                )}
                
                <p className="text-sm text-muted-foreground text-center">
                  Tu evento será revisado y publicado por el administrador
                </p>
              </div>
            )}
          </div>
          
          {/* Preview */}
          {generatedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa Generada</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {generatedEvent}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
