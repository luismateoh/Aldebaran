'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { MapPin } from 'lucide-react'
import type { EventData } from '@/types'

/**
 * Props del mapa interactivo.
 */
export interface InteractiveMapProps {
  /** Lista de eventos a mostrar */
  events: EventData[]
  /** ID del evento seleccionado (resaltado) */
  selectedEvent?: string
  /** Callback al seleccionar un evento */
  onSelectEvent?: (id: string) => void
  /** Altura del contenedor (por defecto: 500px) */
  height?: string
  /** Clases CSS adicionales */
  className?: string
  /** Mostrar popups al hacer clic (por defecto: true) */
  showPopup?: boolean
}

// ---------------------------------------------------------------------------
// Coordenadas aproximadas de departamentos/ciudades de Colombia
// ---------------------------------------------------------------------------
const COLOMBIA_COORDINATES: Record<string, [number, number]> = {
  'Bogotá': [4.7110, -74.0721],
  'Antioquia': [6.2518, -75.5636],
  'Valle del Cauca': [3.4516, -76.5320],
  'Atlántico': [10.9639, -74.7964],
  'Santander': [7.1193, -73.1227],
  'Cundinamarca': [4.7110, -74.0721],
  'Bolívar': [10.3932, -75.4794],
  'Norte de Santander': [7.8890, -72.4967],
  'Córdoba': [8.7479, -75.8814],
  'Cesar': [10.4603, -73.2532],
  'Huila': [2.9273, -75.2819],
  'Tolima': [4.4389, -75.2322],
  'Meta': [4.1420, -73.6266],
  'Nariño': [1.2136, -77.2811],
  'Cauca': [2.4448, -76.6147],
  'Boyacá': [5.4544, -73.3639],
  'Caldas': [5.0689, -75.5174],
  'Risaralda': [4.8143, -75.6946],
  'Quindío': [4.5389, -75.6811],
  'Magdalena': [11.2408, -74.2110],
  'La Guajira': [11.5449, -72.9072],
  'Sucre': [9.3012, -75.3975],
  'Chocó': [5.6940, -76.6583],
  'Casanare': [5.3350, -72.3958],
  'Arauca': [7.0908, -70.7587],
  'Caquetá': [1.6145, -75.6062],
  'Putumayo': [0.8653, -76.2939],
  'San Andrés y Providencia': [12.5847, -81.7006],
  'Amazonas': [-4.2158, -69.9406],
  'Guainía': [3.8669, -67.9234],
  'Guaviare': [2.5649, -72.6459],
  'Vaupés': [1.2500, -70.2333],
  'Vichada': [6.1892, -67.4853],
}

const normalizeLocationKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const DEPARTMENT_ALIASES: Record<string, string> = {
  'archipielago de san andres providencia y santa catalina': 'San Andrés y Providencia',
  'san andres y providencia': 'San Andrés y Providencia',
  'bogota dc': 'Bogotá',
  'bogota d c': 'Bogotá',
}

const NORMALIZED_COORDINATES = Object.entries(COLOMBIA_COORDINATES).reduce(
  (acc, [key, value]) => {
    acc[normalizeLocationKey(key)] = value
    return acc
  },
  {} as Record<string, [number, number]>
)

function getEventCoordinates(event: EventData): [number, number] | undefined {
  const municipalityKey = normalizeLocationKey(event.municipality || '')
  const rawDepartmentKey = normalizeLocationKey(event.department || '')
  const departmentAlias = DEPARTMENT_ALIASES[rawDepartmentKey]
  const departmentKey = normalizeLocationKey(departmentAlias || event.department || '')
  return NORMALIZED_COORDINATES[municipalityKey] || NORMALIZED_COORDINATES[departmentKey]
}

// ---------------------------------------------------------------------------
// Componente interno del mapa (se renderiza solo en cliente)
// ---------------------------------------------------------------------------
function MapInner({
  events,
  selectedEvent,
  onSelectEvent,
  showPopup = true,
}: {
  events: EventData[]
  selectedEvent?: string
  onSelectEvent?: (id: string) => void
  showPopup?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Importaciones dinámicas de Leaflet
  const [L, setL] = useState<typeof import('leaflet') | null>(null)
  const [MapContainer, setMapContainer] = useState<any>(null)
  const [TileLayer, setTileLayer] = useState<any>(null)
  const [Popup, setPopup] = useState<any>(null)
  const [MarkerClusterGroup, setMarkerClusterGroup] = useState<any>(null)
  const [MapMarker, setMapMarker] = useState<any>(null)
  const [MapPopup, setMapPopup] = useState<any>(null)
  const [mapReady, setMapReady] = useState(false)

  // Cargar dependencias una sola vez
  useEffect(() => {
    async function loadDeps() {
      try {
        const leaflet = await import('leaflet')
        const rl = await import('react-leaflet')
        const mc = await import('react-leaflet-cluster')
        const mm = await import('@/components/maps/map-marker')
        const mp = await import('@/components/maps/map-popup')

        // CSS de Leaflet
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // CSS de clustering
        const clusterCss = document.createElement('link')
        clusterCss.rel = 'stylesheet'
        clusterCss.href = 'https://unpkg.com/react-leaflet-cluster@latest/dist/assets/MarkerCluster.css'
        document.head.appendChild(clusterCss)

        const clusterDefaultCss = document.createElement('link')
        clusterDefaultCss.rel = 'stylesheet'
        clusterDefaultCss.href = 'https://unpkg.com/react-leaflet-cluster@latest/dist/assets/MarkerCluster.Default.css'
        document.head.appendChild(clusterDefaultCss)

        // CSS personalizado del mapa
        const mapCss = document.createElement('style')
        mapCss.textContent = `
          .custom-marker-icon { background: none !important; border: none !important; }
          .custom-marker-icon div { background: none !important; }

          /* Popup personalizado */
          .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            padding: 0 !important;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          }
          .leaflet-popup-content {
            margin: 0 !important;
            width: 260px !important;
          }
          .leaflet-popup-tip {
            box-shadow: none !important;
          }
          .leaflet-popup-close-button {
            top: 8px !important;
            right: 8px !important;
            z-index: 10;
            font-size: 18px !important;
            color: white !important;
            opacity: 0.8;
          }
          .leaflet-popup-close-button:hover {
            opacity: 1;
          }

          /* Clusters personalizados */
          .marker-cluster-small {
            background-color: rgba(249, 115, 22, 0.2) !important;
          }
          .marker-cluster-small div {
            background-color: #f97316 !important;
            color: white !important;
            font-weight: 600 !important;
            font-size: 13px !important;
          }
          .marker-cluster-medium {
            background-color: rgba(249, 115, 22, 0.3) !important;
          }
          .marker-cluster-medium div {
            background-color: #ea580c !important;
            color: white !important;
            font-weight: 600 !important;
            font-size: 13px !important;
          }
          .marker-cluster-large {
            background-color: rgba(249, 115, 22, 0.4) !important;
          }
          .marker-cluster-large div {
            background-color: #c2410c !important;
            color: white !important;
            font-weight: 600 !important;
            font-size: 13px !important;
          }
        `
        document.head.appendChild(mapCss)

        setL(leaflet.default ?? leaflet)
        setMapContainer(() => rl.MapContainer)
        setTileLayer(() => rl.TileLayer)
        setPopup(() => rl.Popup)
        setMarkerClusterGroup(() => mc.default)
        setMapMarker(() => mm.MapMarker)
        setMapPopup(() => mp.MapPopup)
        setMapReady(true)
      } catch (err) {
        console.error('Error loading map dependencies:', err)
      }
    }
    loadDeps()
  }, [])

  // Filtrar eventos con coordenadas conocidas
  const eventsWithCoords = events
    .map((e) => ({ ...e, coordinates: getEventCoordinates(e) }))
    .filter((e): e is EventData & { coordinates: [number, number] } => Boolean(e.coordinates))

  const handleMarkerClick = useCallback(
    (id: string) => {
      onSelectEvent?.(id)
    },
    [onSelectEvent]
  )

  const handleHover = useCallback((id: string) => setHoveredId(id), [])
  const handleLeave = useCallback(() => setHoveredId(null), [])

  if (!mapReady || !MapContainer || !TileLayer || !MarkerClusterGroup || !MapMarker) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (eventsWithCoords.length === 0) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <MapPin className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay eventos con ubicaciones disponibles</p>
        </div>
      </div>
    )
  }

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'

  return (
    <MapContainer
      center={[4.5709, -74.2973]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer url={tileUrl} attribution={attribution} />

      <MarkerClusterGroup chunkedLoading>
        {eventsWithCoords.map((event) => (
          <MapMarker
            key={event.id}
            eventId={event.id}
            category={event.category || 'running'}
            position={event.coordinates}
            isSelected={event.id === selectedEvent}
            isHovered={event.id === hoveredId}
            onHover={handleHover}
            onLeave={handleLeave}
            eventHandlers={{
              click: () => event.id && handleMarkerClick(event.id),
            }}
          >
            {showPopup && (
              <Popup>
                <MapPopup event={event} />
              </Popup>
            )}
          </MapMarker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

// ---------------------------------------------------------------------------
// Componente exportado: wrapper con dynamic import (SSR desactivado)
// ---------------------------------------------------------------------------
function InteractiveMap({
  events,
  selectedEvent,
  onSelectEvent,
  height = '500px',
  className,
  showPopup = true,
}: InteractiveMapProps) {
  return (
    <div
      className={className}
      style={{ height }}
    >
      <MapInner
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={onSelectEvent}
        showPopup={showPopup}
      />
    </div>
  )
}

export { InteractiveMap }
