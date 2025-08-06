'use client'

import { useEventsRealtime } from "@/hooks/use-events-realtime"
import EventsListCards from "@/components/cards/events-list-cards"

export default function CardsView() {
  const { events, loading, error } = useEventsRealtime()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando eventos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Error cargando eventos: {error}</p>
      </div>
    )
  }

  return (
    <div>
      <EventsListCards eventsData={events} />
    </div>
  )
}
