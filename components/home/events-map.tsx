'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { EventData } from "@/types"

interface EventsMapProps {
  events: EventData[]
}

// Coordenadas aproximadas para principales ciudades/departamentos de Colombia
const COLOMBIA_COORDINATES: Record<string, [number, number]> = {
  // Departamentos principales
  'Bogotá': [4.7110, -74.0721],
  'Antioquia': [6.2518, -75.5636], // Medellín
  'Valle del Cauca': [3.4516, -76.5320], // Cali
  'Atlántico': [10.9639, -74.7964], // Barranquilla
  'Santander': [7.1193, -73.1227], // Bucaramanga
  'Cundinamarca': [4.7110, -74.0721], // Bogotá region
  'Bolívar': [10.3932, -75.4794], // Cartagena
  'Norte de Santander': [7.8890, -72.4967], // Cúcuta
  'Córdoba': [8.7479, -75.8814], // Montería
  'Cesar': [10.4603, -73.2532], // Valledupar
  'Huila': [2.9273, -75.2819], // Neiva
  'Tolima': [4.4389, -75.2322], // Ibagué
  'Meta': [4.1420, -73.6266], // Villavicencio
  'Nariño': [1.2136, -77.2811], // Pasto
  'Cauca': [2.4448, -76.6147], // Popayán
  'Boyacá': [5.4544, -73.3639], // Tunja
  'Caldas': [5.0689, -75.5174], // Manizales
  'Risaralda': [4.8143, -75.6946], // Pereira
  'Quindío': [4.5389, -75.6811], // Armenia
  'Magdalena': [11.2408, -74.2110], // Santa Marta
  'La Guajira': [11.5449, -72.9072], // Riohacha
  'Sucre': [9.3012, -75.3975], // Sincelejo
  'Chocó': [5.6940, -76.6583], // Quibdó
  'Casanare': [5.3350, -72.3958], // Yopal
  'Arauca': [7.0908, -70.7587], // Arauca
  'Caquetá': [1.6145, -75.6062], // Florencia
  'Putumayo': [0.8653, -76.2939], // Mocoa
  'San Andrés y Providencia': [12.5847, -81.7006], // San Andrés
  'Amazonas': [-4.2158, -69.9406], // Leticia
  'Guainía': [3.8669, -67.9234], // Inírida
  'Guaviare': [2.5649, -72.6459], // San José del Guaviare
  'Vaupés': [1.2500, -70.2333], // Mitú
  'Vichada': [6.1892, -67.4853], // Puerto Carreño
}

export function EventsMap({ events }: EventsMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [MapContainer, setMapContainer] = useState<any>(null)
  const [TileLayer, setTileLayer] = useState<any>(null)
  const [Marker, setMarker] = useState<any>(null)
  const [Popup, setPopup] = useState<any>(null)

  useEffect(() => {
    // Cargar Leaflet dinámicamente solo en el cliente
    const loadMap = async () => {
      try {
        // Importar Leaflet y React Leaflet
        const leaflet = await import('leaflet')
        const reactLeaflet = await import('react-leaflet')
        
        // Importar estilos dinámicamente
        const style = document.createElement('link')
        style.rel = 'stylesheet'
        style.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(style)
        
        // Configurar iconos de Leaflet
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        // Configurar componentes
        setMapContainer(() => reactLeaflet.MapContainer)
        setTileLayer(() => reactLeaflet.TileLayer)
        setMarker(() => reactLeaflet.Marker)
        setPopup(() => reactLeaflet.Popup)
        setMapLoaded(true)
      } catch (error) {
        console.error('Error loading map:', error)
      }
    }

    loadMap()
  }, [])

  if (!mapLoaded || !MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  // Filtrar eventos que tienen ubicación conocida
  const eventsWithCoordinates = events
    .map(event => ({
      ...event,
      coordinates: COLOMBIA_COORDINATES[event.department] || COLOMBIA_COORDINATES[event.municipality]
    }))
    .filter(event => event.coordinates)

  if (eventsWithCoordinates.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <MapPin className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay eventos con ubicaciones disponibles</p>
        </div>
      </div>
    )
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-CO', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={[4.5709, -74.2973]} // Centro de Colombia
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {eventsWithCoordinates.map((event) => (
          <Marker
            key={event.id}
            position={event.coordinates}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="size-3" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3" />
                    <span>{event.municipality}, {event.department}</span>
                  </div>

                  {event.distances && event.distances.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="size-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {event.distances.slice(0, 2).map((distance, index) => (
                          <Badge key={`${event.id}-distance-${index}`} variant="outline" className="px-1 py-0 text-xs">
                            {typeof distance === 'string' ? distance : distance.value}
                          </Badge>
                        ))}
                        {event.distances.length > 2 && (
                          <Badge variant="outline" className="px-1 py-0 text-xs">
                            +{event.distances.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {event.category && (
                    <Badge variant="secondary" className="text-xs">
                      {event.category}
                    </Badge>
                  )}
                </div>

                <div className="mt-3">
                  <Button asChild size="sm" className="h-7 w-full text-xs">
                    <Link href={`/event/${event.id}`}>
                      Ver Detalles
                    </Link>
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}