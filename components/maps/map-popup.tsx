'use client'

import { Calendar, MapPin, Route } from 'lucide-react'
import Link from 'next/link'
import type { EventData } from '@/types'
import { CategoryBadge } from '@/components/ui/category-badge'
import { ImageWithFallback, getFallbackFromCategory } from '@/components/ui/image-with-fallback'

interface MapPopupProps {
  event: EventData
  onClose?: () => void
}

/**
 * Formatea una fecha a formato corto en español.
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

/**
 * Popup elegante que se muestra al hacer clic en un marcador del mapa.
 */
export function MapPopup({ event }: MapPopupProps) {
  return (
    <div className="w-[260px] overflow-hidden font-sans">
      {/* Cover image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <ImageWithFallback
          src={event.cover}
          alt={event.title}
          fill
          sizes="260px"
          fallbackVariant={getFallbackFromCategory(event.category)}
          className="object-cover"
          unoptimized
        />
        {/* Category badge overlay */}
        {event.category && (
          <div className="absolute left-2 top-2 z-10">
            <CategoryBadge category={event.category} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {event.municipality}
              {event.department ? `, ${event.department}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3 shrink-0" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
        </div>

        {event.distances && event.distances.length > 0 && (
          <div className="flex items-start gap-1.5">
            <Route className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {event.distances.map((distance, index) => {
                const label = typeof distance === 'string' ? distance : distance.value
                return (
                  <span
                    key={`popup-dist-${event.id}-${index}`}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <Link
          href={`/events/${event.id}`}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  )
}
