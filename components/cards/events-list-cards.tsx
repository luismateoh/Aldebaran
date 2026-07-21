"use client"

import React, { useState } from "react"

import type { AllEvents, EventData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import EventCard from "@/components/cards/event-card"
import FeaturedEventCard from "@/components/cards/featured-event-card"

export default function EventsListCards({ eventsData }: AllEvents) {
  const [limit, setLimit] = useState(6)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const onLoadMore = () => {
    setLimit((prev) => prev + 6)
  }

  const handleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!eventsData.length) return null

  // Primer evento como featured si tiene campo featured = true, o simplemente
  // el primero del array para destacar
  const featuredIndex = eventsData.findIndex(
    (e) => e.featured === true,
  )
  const hasFeatured = featuredIndex !== -1
  const featuredEvent = hasFeatured ? eventsData[featuredIndex] : eventsData[0]

  // Filtramos el evento destacado de la lista regular
  const regularEvents: EventData[] = hasFeatured
    ? eventsData.filter((_, i) => i !== featuredIndex)
    : eventsData.slice(1)

  const visibleRegular = regularEvents.slice(0, limit)

  return (
    <section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-y-8 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
        {/* Featured card — ocupa 2 columnas en md+ */}
        <div
          className={cn(
            "md:col-span-2 lg:col-span-2",
          )}
        >
          <FeaturedEventCard
            event={featuredEvent}
            saved={savedIds.has(featuredEvent.id ?? "")}
            onSave={handleSave}
          />
        </div>

        {/* Regular cards */}
        {visibleRegular.map((event: EventData) => (
          <EventCard
            event={event}
            key={event.id}
            saved={savedIds.has(event.id ?? "")}
            onSave={handleSave}
          />
        ))}
      </div>

      {limit < regularEvents.length && (
        <div className="mt-8 flex justify-center">
          <Button
            className="shadow"
            variant="secondary"
            size="sm"
            onClick={onLoadMore}
          >
            Mostrar más
          </Button>
        </div>
      )}
    </section>
  )
}
