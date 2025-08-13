'use client'

import dynamic from 'next/dynamic'
import { EventData } from "@/types"

const EventsMap = dynamic(
  () => import("@/components/home/events-map").then((mod) => ({ default: mod.EventsMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }
)

interface EventsMapWrapperProps {
  events: EventData[]
}

export function EventsMapWrapper({ events }: EventsMapWrapperProps) {
  return <EventsMap events={events} />
}