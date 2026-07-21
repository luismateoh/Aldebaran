'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Marker, MarkerProps } from 'react-leaflet'
import L from 'leaflet'
import { normalizeCategory } from '@/components/ui/category-badge'

/**
 * Mapa de colores por categoría para marcadores.
 * Coincide con CATEGORY_CONFIG en category-badge.tsx.
 */
const CATEGORY_MARKER_COLORS: Record<string, string> = {
  trail: '#16a34a',    // green-600
  running: '#f97316',  // orange-500 (primary aproximado)
  ultra: '#9333ea',    // purple-600
  montaña: '#2563eb',  // blue-600
  asfalto: '#dc2626',  // red-600
}

const DEFAULT_MARKER_COLOR = '#f97316' // running / primary

export function getMarkerColor(category: string): string {
  const key = normalizeCategory(category)
  return CATEGORY_MARKER_COLORS[key] ?? DEFAULT_MARKER_COLOR
}

interface PulseMarkerIconOptions {
  color: string
  size?: number
  pulse?: boolean
  hovered?: boolean
}

/**
 * Genera un icono SVG tipo pin con círculo de pulso alrededor.
 */
function createPulseMarkerIcon({ color, size = 36, pulse = true, hovered = false }: PulseMarkerIconOptions): L.DivIcon {
  const pulseSize = Math.round(size * 2.4)
  const pulseCss = pulse
    ? `@keyframes pulse-marker-${color.replace('#', '')} {
        0% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.8); opacity: 0; }
        100% { transform: scale(1); opacity: 0.4; }
      }`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pulseSize}" height="${pulseSize}" viewBox="0 0 ${pulseSize} ${pulseSize}">
    <defs>
      <style>
        ${pulseCss}
        @keyframes marker-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .marker-pin {
          animation: marker-bounce 2s ease-in-out infinite;
        }
        .marker-pin:hover {
          animation: none;
          transform: scale(1.15);
          transition: transform 0.2s ease-out;
        }
      </style>
    </defs>
    ${pulse ? `<circle cx="${pulseSize / 2}" cy="${pulseSize / 2}" r="${size / 2}"
      fill="none" stroke="${color}" stroke-width="2"
      style="animation: pulse-marker-${color.replace('#', '')} 2s ease-out infinite; opacity: 0.3;" />` : ''}
    <g class="marker-pin" transform="translate(${(pulseSize - size) / 2}, ${(pulseSize - size) / 2})">
      <path d="M${size / 2},${size - 2} C${size - 6},${size * 0.65} ${size - 2},${size * 0.4} ${size / 2},${size * 0.12} C${2},${size * 0.4} ${6},${size * 0.65} ${size / 2},${size - 2}Z"
        fill="${color}" stroke="white" stroke-width="2" />
      <circle cx="${size / 2}" cy="${size * 0.32}" r="${size * 0.16}" fill="white" opacity="0.8" />
    </g>
  </svg>`

  const iconSize = pulseSize
  const iconAnchor = [iconSize / 2, iconSize / 2] as [number, number]

  return L.divIcon({
    html: svg,
    className: 'custom-marker-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor,
    popupAnchor: [0, -iconSize / 2],
  })
}

export interface MapMarkerProps extends Omit<MarkerProps, 'icon' | 'position'> {
  eventId: string
  category: string
  isSelected?: boolean
  isHovered?: boolean
  position: [number, number]
  onHover?: (id: string) => void
  onLeave?: () => void
}

/**
 * Marcador personalizado para el mapa interactivo.
 * - Color basado en categoría
 * - Animación de pulso
 * - Efecto hover: escala y tooltip
 * - Resaltado cuando está seleccionado
 */
export function MapMarker({
  eventId,
  category,
  isSelected = false,
  isHovered = false,
  position,
  onHover,
  onLeave,
  ...markerProps
}: MapMarkerProps) {
  const markerRef = useRef<L.Marker>(null)
  const color = getMarkerColor(category)

  const icon = useMemo(
    () =>
      createPulseMarkerIcon({
        color,
        size: isSelected ? 44 : 36,
        pulse: !isSelected,
        hovered: isHovered,
      }),
    [color, isSelected, isHovered]
  )

  useEffect(() => {
    const el = markerRef.current
    if (!el) return

    const handleMouseOver = () => onHover?.(eventId)
    const handleMouseOut = () => onLeave?.()

    el.on('mouseover', handleMouseOver)
    el.on('mouseout', handleMouseOut)

    return () => {
      el.off('mouseover', handleMouseOver)
      el.off('mouseout', handleMouseOut)
    }
  }, [eventId, onHover, onLeave])

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      {...markerProps}
    />
  )
}
