'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Zap, Calendar, MapPin, Clock, Users, Copy, CheckCircle } from 'lucide-react'

// Templates predefinidos para eventos comunes
const eventTemplates = {
  '5k_popular': {
    title: 'Carrera Popular 5K',
    category: 'Running',
    distances: ['5k'],
    price: '$40.000',
    duration: 'Mañana (6:00 AM)',
    description: 'Carrera popular de 5K por las principales calles de la ciudad. Evento familiar que promueve el deporte y la vida saludable.',
    organizers: ['IDRD', 'Alcaldía', 'Secretaría de Deporte'],
    tags: ['familiar', 'popular', 'urbano']
  },
  '10k_competitivo': {
    title: 'Carrera Competitiva 10K',
    category: 'Running',
    distances: ['10k'],
    price: '$55.000',
    duration: 'Mañana (6:30 AM)',
    description: 'Carrera atlética de 10K con cronometraje oficial. Ideal para corredores que buscan mejorar sus marcas personales.',
    organizers: ['Liga de Atletismo', 'Club Deportivo'],
    tags: ['competitivo', 'cronometraje', 'ranking']
  },
  'media_maraton': {
    title: 'Media Maratón',
    category: 'Media maraton',
    distances: ['21k'],
    price: '$85.000',
    duration: 'Mañana (5:30 AM)',
    description: 'Media maratón de 21K con recorrido desafiante y puntos de hidratación cada 5K. Para corredores experimentados.',
    organizers: ['Federación de Atletismo', 'Liga Departamental'],
    tags: ['larga_distancia', 'desafiante', 'hidratación']
  },
  'maraton_completo': {
    title: 'Maratón',
    category: 'Maraton',
    distances: ['42k'],
    price: '$120.000',
    duration: 'Madrugada (5:00 AM)',
    description: 'Maratón completo de 42.195K certificado por World Athletics. El máximo desafío para corredores élite.',
    organizers: ['World Athletics', 'Federación Nacional'],
    tags: ['elite', 'certificado', 'internacional']
  },
  'trail_aventura': {
    title: 'Trail Run de Montaña',
    category: 'Trail',
    distances: ['10k', '21k', '30k'],
    price: '$70.000',
    duration: 'Día completo (7:00 AM)',
    description: 'Carrera de montaña por senderos naturales con desniveles técnicos. Conexión total con la naturaleza.',
    organizers: ['Club de Montañismo', 'Grupo Trail'],
    tags: ['naturaleza', 'montaña', 'técnico', 'aventura']
  },
  'ultra_resistencia': {
    title: 'Ultra Maratón',
    category: 'Ultra',
    distances: ['50k', '100k'],
    price: '$150.000',
    duration: 'Varios días',
    description: 'Ultra maratón de resistencia extrema para atletas de élite. Incluye apoyo médico y logístico completo.',
    organizers: ['Ultra Running Club', 'Asociación de Ultramaratonistas'],
    tags: ['extremo', 'resistencia', 'élite', 'apoyo_médico']
  },
  'carrera_kids': {
    title: 'Carrera Infantil',
    category: 'Kids',
    distances: ['1k', '2k', '3k'],
    price: '$25.000',
    duration: 'Tarde (3:00 PM)',
    description: 'Carrera especial para niños por edad. Incluye medallas para todos los participantes y actividades recreativas.',
    organizers: ['Fundación Deportiva', 'Alcaldía - Recreación'],
    tags: ['infantil', 'medallas', 'recreativo', 'familiar']
  },
  'nocturna_5k': {
    title: 'Carrera Nocturna 5K',
    category: 'Running',
    distances: ['5k'],
    price: '$45.000',
    duration: 'Noche (7:00 PM)',
    description: 'Carrera nocturna con iluminación especial y ambiente festivo. Incluye DJ en vivo y pulseras LED.',
    organizers: ['Evento Nocturno', 'Promotora Deportiva'],
    tags: ['nocturno', 'festivo', 'iluminado', 'música']
  }
}

interface EventTemplatesProps {
  onSelectTemplate?: (template: any) => void
}

export default function EventTemplates({ onSelectTemplate }: EventTemplatesProps) {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleUseTemplate = (templateKey: string, template: any) => {
    if (onSelectTemplate) {
      onSelectTemplate({ key: templateKey, ...template })
    } else {
      // Navegar al formulario con template pre-seleccionado
      const params = new URLSearchParams({
        template: templateKey,
        title: template.title,
        category: template.category,
        distances: template.distances.join(','),
        price: template.price,
        description: template.description
      })
      router.push(`/admin/events/new?${params.toString()}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Zap className="h-6 w-6 text-blue-500" />
          Templates de Eventos
        </h2>
        <p className="text-muted-foreground">
          Crea eventos rápidamente usando plantillas predefinidas optimizadas para móvil
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(eventTemplates).map(([key, template]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {template.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Información rápida */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Distancias: {template.distances.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{template.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{template.price}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag.replace('_', ' ')}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Acción */}
              <div className="pt-2 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => setSelectedTemplate(key)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Usar Template
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {template.title}
                      </DialogTitle>
                      <DialogDescription>
                        Vista previa del template y organizadores sugeridos
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Información del template */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Detalles</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Categoría:</strong> {template.category}</p>
                            <p><strong>Distancias:</strong> {template.distances.join(', ')}</p>
                            <p><strong>Precio:</strong> {template.price}</p>
                            <p><strong>Horario:</strong> {template.duration}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Organizadores Sugeridos</h4>
                          <div className="space-y-1">
                            {template.organizers.map(org => (
                              <Badge key={org} variant="outline" className="block w-fit">
                                {org}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Descripción completa */}
                      <div>
                        <h4 className="font-semibold mb-2">Descripción</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {template.description}
                        </p>
                      </div>

                      {/* Tags completos */}
                      <div>
                        <h4 className="font-semibold mb-2">Características</h4>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                              {tag.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Acción final */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          className="flex-1"
                          onClick={() => handleUseTemplate(key, template)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Crear con este Template
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instrucciones móviles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:hidden">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Optimizado para Móvil</h4>
            <p className="text-sm text-blue-700">
              Toca cualquier template para ver los detalles y usar la plantilla. 
              Todos los campos se autocompletarán para acelerar la creación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}