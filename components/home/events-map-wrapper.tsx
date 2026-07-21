'use client'

import dynamic from 'next/dynamic'
import type { EventData } from '@/types'

const InteractiveMap = dynamic(
  () => import('@/components/maps/interactive-map').then((mod) => ({ default: mod.InteractiveMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
)

export interface EventsMapWrapperProps {
  events: EventData[]
  selectedEvent?: string
  onSelectEvent?: (id: string) => void
  height?: string
  className?: string
  showPopup?: boolean
}

export function EventsMapWrapper({
  events,
  selectedEvent,
  onSelectEvent,
  height,
  className,
  showPopup,
}: EventsMapWrapperProps) {
  return (
    <InteractiveMap
      events={events}
      selectedEvent={selectedEvent}
      onSelectEvent={onSelectEvent}
      height={height}
      className={className}
      showPopup={showPopup}
    />
  )
}

// También exportamos el nombre anterior para compatibilidad
export { InteractiveMap as EventsMap }
